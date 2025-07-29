import {
  users,
  alerts,
  investigations,
  investigationAlerts,
  comments,
  activities,
  chatMessages,
  type User,
  type UpsertUser,
  type Alert,
  type InsertAlert,
  type Investigation,
  type InsertInvestigation,
  type Comment,
  type InsertComment,
  type Activity,
  type InsertActivity,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Alert operations
  getAlerts(limit?: number): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, alert: Partial<InsertAlert>): Promise<Alert>;
  updateAlertStatus(id: string, status: string): Promise<Alert>;
  assignAlert(id: string, userId: string): Promise<Alert>;
  
  // Investigation operations
  getInvestigations(limit?: number): Promise<Investigation[]>;
  getInvestigation(id: string): Promise<Investigation | undefined>;
  createInvestigation(investigation: InsertInvestigation): Promise<Investigation>;
  updateInvestigation(id: string, investigation: Partial<InsertInvestigation>): Promise<Investigation>;
  
  // Comment operations
  getComments(entityType: string, entityId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Activity operations
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Chat operations
  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    activeAlerts: number;
    criticalAlerts: number;
    avgMTTD: number;
    avgMTTR: number;
    falsePositiveRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Alert operations
  async getAlerts(limit = 50): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .orderBy(desc(alerts.createdAt))
      .limit(limit);
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async updateAlert(id: string, alert: Partial<InsertAlert>): Promise<Alert> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ ...alert, updatedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  async updateAlertStatus(id: string, status: string): Promise<Alert> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  async assignAlert(id: string, userId: string): Promise<Alert> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ assignedTo: userId, updatedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  // Investigation operations
  async getInvestigations(limit = 20): Promise<Investigation[]> {
    return await db
      .select()
      .from(investigations)
      .orderBy(desc(investigations.updatedAt))
      .limit(limit);
  }

  async getInvestigation(id: string): Promise<Investigation | undefined> {
    const [investigation] = await db
      .select()
      .from(investigations)
      .where(eq(investigations.id, id));
    return investigation;
  }

  async createInvestigation(investigation: InsertInvestigation): Promise<Investigation> {
    const [newInvestigation] = await db
      .insert(investigations)
      .values(investigation)
      .returning();
    return newInvestigation;
  }

  async updateInvestigation(
    id: string,
    investigation: Partial<InsertInvestigation>
  ): Promise<Investigation> {
    const [updatedInvestigation] = await db
      .update(investigations)
      .set({ ...investigation, updatedAt: new Date() })
      .where(eq(investigations.id, id))
      .returning();
    return updatedInvestigation;
  }

  // Comment operations
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(eq(comments.entityType, entityType), eq(comments.entityId, entityId)))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  // Activity operations
  async getRecentActivities(limit = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Chat operations
  async getChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Dashboard metrics
  async getDashboardMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Active alerts
    const [{ activeAlerts }] = await db
      .select({ activeAlerts: count() })
      .from(alerts)
      .where(eq(alerts.status, "open"));

    // Critical alerts
    const [{ criticalAlerts }] = await db
      .select({ criticalAlerts: count() })
      .from(alerts)
      .where(and(eq(alerts.status, "open"), eq(alerts.severity, "critical")));

    // False positive rate (simplified calculation)
    const [{ totalResolved }] = await db
      .select({ totalResolved: count() })
      .from(alerts)
      .where(or(eq(alerts.status, "resolved"), eq(alerts.status, "false_positive")));

    const [{ falsePositives }] = await db
      .select({ falsePositives: count() })
      .from(alerts)
      .where(eq(alerts.status, "false_positive"));

    const falsePositiveRate = totalResolved > 0 ? (falsePositives / totalResolved) * 100 : 0;

    return {
      activeAlerts,
      criticalAlerts,
      avgMTTD: 4.2, // Mock value - would need proper timestamp tracking
      avgMTTR: 18.5, // Mock value - would need proper timestamp tracking
      falsePositiveRate: Math.round(falsePositiveRate * 100) / 100,
    };
  }
}

export const storage = new DatabaseStorage();
