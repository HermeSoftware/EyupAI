import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const solutions = pgTable("solutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  questionText: text("question_text"),
  uploadedFilePath: text("uploaded_file_path"),
  modelResponseJson: jsonb("model_response_json").notNull(),
  verified: boolean("verified").default(false),
  confidence: real("confidence").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  solutionId: varchar("solution_id").notNull(),
  userId: varchar("user_id"),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertSolutionSchema = createInsertSchema(solutions).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSolution = z.infer<typeof insertSolutionSchema>;
export type Solution = typeof solutions.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// API response types
export interface SolutionStep {
  step: number;
  text: string;
  latex?: string;
  svg_overlay_id?: number;
}

export interface ModelResponse {
  summary: string;
  steps: SolutionStep[];
  latex: string;
  diagram_svg?: string;
  diagram_commands?: any[];
  plot_data?: {
    x: number[];
    y: number[];
  };
  final_answer: string;
  hints: string[];
  confidence: number;
}

export interface SolveRequest {
  text?: string;
  subject: string;
  level: string;
}

export interface SolveResponse {
  ok: boolean;
  solution?: Solution;
  parsed?: ModelResponse;
  verified?: boolean;
  error?: string;
}
