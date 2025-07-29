import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { openaiService } from "./openaiService";
import {
  insertAlertSchema,
  insertInvestigationSchema,
  insertCommentSchema,
  insertChatMessageSchema,
} from "@shared/schema";
import { ZodError } from "zod";

interface WebSocketClient extends WebSocket {
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Alert routes
  app.get('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const alerts = await storage.getAlerts(limit);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get('/api/alerts/:id', isAuthenticated, async (req, res) => {
    try {
      const alert = await storage.getAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      console.error("Error fetching alert:", error);
      res.status(500).json({ message: "Failed to fetch alert" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      
      // Get AI analysis
      const analysis = await openaiService.analyzeAlert({
        title: alertData.title,
        description: alertData.description,
        source: alertData.source,
        sourceUser: alertData.sourceUser,
        severity: alertData.severity,
      });

      const alert = await storage.createAlert({
        ...alertData,
        aiSummary: analysis.summary,
        riskScore: analysis.riskScore,
        tags: [...(alertData.tags || []), ...analysis.mitreMapping],
      });

      // Create activity log
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: "created_alert",
        entityType: "alert",
        entityId: alert.id,
        metadata: { severity: alert.severity },
      });

      // Broadcast to WebSocket clients
      broadcastToClients({ type: "new_alert", data: alert });

      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch('/api/alerts/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const alert = await storage.updateAlertStatus(req.params.id, status);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: "updated_alert_status",
        entityType: "alert",
        entityId: alert.id,
        metadata: { newStatus: status },
      });

      broadcastToClients({ type: "alert_updated", data: alert });
      res.json(alert);
    } catch (error) {
      console.error("Error updating alert status:", error);
      res.status(500).json({ message: "Failed to update alert status" });
    }
  });

  app.patch('/api/alerts/:id/assign', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.body;
      const alert = await storage.assignAlert(req.params.id, userId);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: "assigned_alert",
        entityType: "alert",
        entityId: alert.id,
        metadata: { assignedTo: userId },
      });

      broadcastToClients({ type: "alert_updated", data: alert });
      res.json(alert);
    } catch (error) {
      console.error("Error assigning alert:", error);
      res.status(500).json({ message: "Failed to assign alert" });
    }
  });

  // Investigation routes
  app.get('/api/investigations', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const investigations = await storage.getInvestigations(limit);
      res.json(investigations);
    } catch (error) {
      console.error("Error fetching investigations:", error);
      res.status(500).json({ message: "Failed to fetch investigations" });
    }
  });

  app.post('/api/investigations', isAuthenticated, async (req: any, res) => {
    try {
      const investigationData = insertInvestigationSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      
      const investigation = await storage.createInvestigation(investigationData);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: "created_investigation",
        entityType: "investigation",
        entityId: investigation.id,
        metadata: { priority: investigation.priority },
      });

      broadcastToClients({ type: "new_investigation", data: investigation });
      res.status(201).json(investigation);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid investigation data", errors: error.errors });
      }
      console.error("Error creating investigation:", error);
      res.status(500).json({ message: "Failed to create investigation" });
    }
  });

  // Comment routes
  app.get('/api/comments', isAuthenticated, async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      if (!entityType || !entityId) {
        return res.status(400).json({ message: "entityType and entityId are required" });
      }
      
      const comments = await storage.getComments(entityType as string, entityId as string);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        authorId: req.user.claims.sub,
      });
      
      const comment = await storage.createComment(commentData);
      
      await storage.createActivity({
        userId: req.user.claims.sub,
        action: "commented",
        entityType: commentData.entityType,
        entityId: commentData.entityId,
        metadata: {},
      });

      broadcastToClients({ type: "new_comment", data: comment });
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        message,
        isFromAI: false,
      });

      // Get AI response
      const aiResponse = await openaiService.chatResponse(message);
      
      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        message: aiResponse,
        response: aiResponse,
        isFromAI: true,
      });

      broadcastToClients({ 
        type: "new_chat_messages", 
        data: { userMessage, aiMessage } 
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // AI routes
  app.post('/api/ai/summarize-alerts', isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getAlerts(10);
      const summary = await openaiService.summarizeAlerts(alerts);
      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing alerts:", error);
      res.status(500).json({ message: "Failed to summarize alerts" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocketClient>();

  function broadcastToClients(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  wss.on('connection', (ws: WebSocketClient) => {
    clients.add(ws);
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          ws.userId = data.userId;
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  return httpServer;
}
