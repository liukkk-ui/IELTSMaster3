import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPracticeAttemptSchema, insertErrorWordSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all units
  app.get("/api/units", async (req, res) => {
    try {
      const units = await storage.getUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  // Get unit by ID
  app.get("/api/units/:id", async (req, res) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unit" });
    }
  });

  // Get words for a unit
  app.get("/api/units/:id/words", async (req, res) => {
    try {
      const words = await storage.getWordsByUnit(req.params.id);
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch words" });
    }
  });

  // Get random words for quick practice
  app.get("/api/words/random", async (req, res) => {
    try {
      const count = parseInt(req.query.count as string) || 20;
      const excludeUnits = req.query.excludeUnits ? (req.query.excludeUnits as string).split(',') : undefined;
      const words = await storage.getRandomWords(count, excludeUnits);
      res.json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch random words" });
    }
  });

  // Get user progress for all units
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getAllUserProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Get user progress for specific unit
  app.get("/api/progress/:unitId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.unitId);
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unit progress" });
    }
  });

  // Update user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = req.body;
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Submit practice attempt
  app.post("/api/practice-attempts", async (req, res) => {
    try {
      const attemptData = insertPracticeAttemptSchema.parse(req.body);
      const attempt = await storage.createPracticeAttempt(attemptData);
      
      // If incorrect, add to error words
      if (!attemptData.isCorrect) {
        await storage.createOrUpdateErrorWord({
          wordId: attemptData.wordId,
          userId: attemptData.userId,
          userSpelling: attemptData.userSpelling,
          attemptCount: 1
        });
      } else {
        // If correct, resolve any existing error for this word
        await storage.resolveErrorWord(attemptData.wordId, attemptData.userId);
      }
      
      res.json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid attempt data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to submit practice attempt" });
    }
  });

  // Get error words for review
  app.get("/api/error-words", async (req, res) => {
    try {
      const errorWords = await storage.getErrorWords();
      res.json(errorWords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch error words" });
    }
  });

  // Get practice settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getPracticeSettings();
      res.json(settings || {
        playAudioAutomatically: true,
        showDefinitions: true,
        practiceSpeed: "normal"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update practice settings
  app.post("/api/settings", async (req, res) => {
    try {
      const settingsData = req.body;
      const settings = await storage.updatePracticeSettings({
        userId: "default_user",
        ...settingsData
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Get overall statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const units = await storage.getUnits();
      const allProgress = await storage.getAllUserProgress();
      const errorWords = await storage.getErrorWords();
      
      const totalWords = units.reduce((sum, unit) => sum + unit.wordCount, 0);
      const completedWords = allProgress.reduce((sum, progress) => sum + progress.completedWords, 0);
      const totalAttempts = allProgress.reduce((sum, progress) => sum + progress.totalAttempts, 0);
      const correctAttempts = allProgress.reduce((sum, progress) => sum + progress.correctAttempts, 0);
      
      const stats = {
        totalWords,
        masteredWords: completedWords,
        errorWords: errorWords.length,
        currentStreak: 15, // Simplified for demo
        overallAccuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Spell check endpoint
  app.post("/api/spell-check", async (req, res) => {
    try {
      const { wordId, userSpelling } = req.body;
      const word = await storage.getWord(wordId);
      
      if (!word) {
        return res.status(404).json({ error: "Word not found" });
      }
      
      const isCorrect = userSpelling.toLowerCase().trim() === word.word.toLowerCase();
      
      res.json({
        isCorrect,
        correctSpelling: word.word,
        userSpelling: userSpelling.trim()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check spelling" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
