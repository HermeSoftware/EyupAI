import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertSolutionSchema, insertFeedbackSchema, type SolveRequest, type SolveResponse, type ModelResponse } from "@shared/schema";
import { solveProblem } from "./services/geminiClient.js";
import { validateSolution } from "./services/validator";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, status: "healthy" });
  });

  // Solve problem endpoint
  app.post("/api/solve", upload.single("file"), async (req, res) => {
    try {
      const { text, subject = "matematik", level = "lise" } = req.body as SolveRequest;
      const file = req.file;

      if (!text && !file) {
        return res.status(400).json({ 
          ok: false, 
          error: "Metin veya fotoğraf göndermelisiniz" 
        });
      }

      let fileBuffer: Buffer | undefined;
      let mimeType: string | undefined;

      if (file) {
        fileBuffer = fs.readFileSync(file.path);
        mimeType = file.mimetype;
        // Clean up uploaded file
        fs.unlinkSync(file.path);
      }

      // Call Gemini API
      const modelResponse = await solveProblem({
        text,
        imageBuffer: fileBuffer,
        mimeType,
        subject,
        level
      });

      // Validate the solution
      const validation = validateSolution(modelResponse);

      // Create solution record
      const solutionData = {
        userId: null, // Anonymous for now
        subject,
        level,
        questionText: text || "Fotoğraf sorusu",
        uploadedFilePath: file?.filename,
        modelResponseJson: modelResponse,
        verified: validation.isValid,
        confidence: validation.confidence
      };

      const solution = await storage.createSolution(solutionData);

      const response: SolveResponse = {
        ok: true,
        solution,
        parsed: modelResponse,
        verified: validation.isValid
      };

      res.json(response);

    } catch (error) {
      console.error("Solve error:", error);
      res.status(500).json({ 
        ok: false, 
        error: error instanceof Error ? error.message : "Beklenmeyen hata oluştu" 
      });
    }
  });

  // Get solutions history
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = req.query.userId as string | undefined;

      const solutions = await storage.getUserSolutions(userId, limit, offset);
      res.json({ ok: true, solutions });
    } catch (error) {
      console.error("History error:", error);
      res.status(500).json({ 
        ok: false, 
        error: "Geçmiş yüklenirken hata oluştu" 
      });
    }
  });

  // Delete solution
  app.delete("/api/history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSolution(id);
      
      if (!deleted) {
        return res.status(404).json({ 
          ok: false, 
          error: "Çözüm bulunamadı" 
        });
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ 
        ok: false, 
        error: "Silme işleminde hata oluştu" 
      });
    }
  });

  // Submit feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(feedbackData);
      res.json({ ok: true, feedback });
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(400).json({ 
        ok: false, 
        error: "Geçersiz geri bildirim verisi" 
      });
    }
  });

  // Get single solution
  app.get("/api/solution/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const solution = await storage.getSolution(id);
      
      if (!solution) {
        return res.status(404).json({ 
          ok: false, 
          error: "Çözüm bulunamadı" 
        });
      }

      res.json({ ok: true, solution });
    } catch (error) {
      console.error("Get solution error:", error);
      res.status(500).json({ 
        ok: false, 
        error: "Çözüm yüklenirken hata oluştu" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
