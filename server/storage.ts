import { type User, type InsertUser, type Solution, type InsertSolution, type Feedback, type InsertFeedback } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Solutions
  createSolution(solution: InsertSolution): Promise<Solution>;
  getSolution(id: string): Promise<Solution | undefined>;
  getUserSolutions(userId?: string, limit?: number, offset?: number): Promise<Solution[]>;
  deleteSolution(id: string): Promise<boolean>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackBySolution(solutionId: string): Promise<Feedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private solutions: Map<string, Solution>;
  private feedback: Map<string, Feedback>;

  constructor() {
    this.users = new Map();
    this.solutions = new Map();
    this.feedback = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSolution(insertSolution: InsertSolution): Promise<Solution> {
    const id = randomUUID();
    const solution: Solution = { 
      ...insertSolution,
      userId: insertSolution.userId || null,
      questionText: insertSolution.questionText || null,
      uploadedFilePath: insertSolution.uploadedFilePath || null,
      verified: insertSolution.verified || false,
      confidence: insertSolution.confidence || 0,
      id,
      createdAt: new Date()
    };
    this.solutions.set(id, solution);
    return solution;
  }

  async getSolution(id: string): Promise<Solution | undefined> {
    return this.solutions.get(id);
  }

  async getUserSolutions(userId?: string, limit: number = 10, offset: number = 0): Promise<Solution[]> {
    const solutions = Array.from(this.solutions.values())
      .filter(solution => !userId || solution.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
    return solutions;
  }

  async deleteSolution(id: string): Promise<boolean> {
    return this.solutions.delete(id);
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedbackItem: Feedback = { 
      ...insertFeedback,
      userId: insertFeedback.userId || null,
      rating: insertFeedback.rating || null,
      comment: insertFeedback.comment || null,
      id,
      createdAt: new Date()
    };
    this.feedback.set(id, feedbackItem);
    return feedbackItem;
  }

  async getFeedbackBySolution(solutionId: string): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(f => f.solutionId === solutionId);
  }
}

export const storage = new MemStorage();
