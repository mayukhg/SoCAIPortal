import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("tier1"), // tier1, tier2, tier3, manager
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Alert severity and status enums
export const alertSeverityEnum = pgEnum("alert_severity", ["critical", "high", "medium", "low", "info"]);
export const alertStatusEnum = pgEnum("alert_status", ["open", "investigating", "resolved", "false_positive"]);

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  status: alertStatusEnum("status").notNull().default("open"),
  source: varchar("source").notNull(), // e.g., "WORKSTATION-042", "VPN Gateway"
  sourceUser: varchar("source_user"), // e.g., "john.doe@company.com"
  tags: text("tags").array().default([]), // e.g., ["MITRE:T1059", "PowerShell"]
  metadata: jsonb("metadata").default({}), // Additional alert data
  assignedTo: varchar("assigned_to").references(() => users.id),
  aiSummary: text("ai_summary"), // AI-generated summary/analysis
  riskScore: integer("risk_score").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investigations table
export const investigations = pgTable("investigations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, critical
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investigation alerts relationship
export const investigationAlerts = pgTable("investigation_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investigationId: varchar("investigation_id").notNull().references(() => investigations.id),
  alertId: varchar("alert_id").notNull().references(() => alerts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments/collaboration
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  entityType: varchar("entity_type").notNull(), // "alert", "investigation"
  entityId: varchar("entity_id").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // "created_alert", "assigned_investigation", etc.
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages with AI
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  isFromAI: boolean("is_from_ai").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedAlerts: many(alerts),
  assignedInvestigations: many(investigations),
  createdInvestigations: many(investigations, { relationName: "createdInvestigations" }),
  comments: many(comments),
  activities: many(activities),
  chatMessages: many(chatMessages),
}));

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  assignee: one(users, {
    fields: [alerts.assignedTo],
    references: [users.id],
  }),
  investigationAlerts: many(investigationAlerts),
  comments: many(comments),
}));

export const investigationsRelations = relations(investigations, ({ one, many }) => ({
  assignee: one(users, {
    fields: [investigations.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [investigations.createdBy],
    references: [users.id],
    relationName: "createdInvestigations",
  }),
  investigationAlerts: many(investigationAlerts),
  comments: many(comments),
}));

export const investigationAlertsRelations = relations(investigationAlerts, ({ one }) => ({
  investigation: one(investigations, {
    fields: [investigationAlerts.investigationId],
    references: [investigations.id],
  }),
  alert: one(alerts, {
    fields: [investigationAlerts.alertId],
    references: [alerts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertAlert = typeof alerts.$inferInsert;
export type Alert = typeof alerts.$inferSelect;

export type InsertInvestigation = typeof investigations.$inferInsert;
export type Investigation = typeof investigations.$inferSelect;

export type InsertComment = typeof comments.$inferInsert;
export type Comment = typeof comments.$inferSelect;

export type InsertActivity = typeof activities.$inferInsert;
export type Activity = typeof activities.$inferSelect;

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Zod schemas
export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestigationSchema = createInsertSchema(investigations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
