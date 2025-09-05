import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPracticeAttemptSchema, insertErrorWordSchema } from "@shared/schema";
import { setupAuth, requireAuth, hashPassword, generateToken } from "./auth";
import passport from "passport";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10).optional(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.email || data.phoneNumber, {
  message: "Either email or phone number is required",
});

const loginSchema = z.object({
  identifier: z.string(), // email or phone
  password: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.errors 
        });
      }

      const { email, phoneNumber, password, firstName, lastName } = validation.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmailOrPhone(email || phoneNumber!);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email: email || null,
        phoneNumber: phoneNumber || null,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        isVerified: false,
      });

      // Generate token and set session
      const token = generateToken(user.id);
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ 
          user: userWithoutPassword, 
          token,
          message: "Registration successful" 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', (req, res, next) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid input", 
        errors: validation.error.errors 
      });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        const token = generateToken(user.id);
        const { password: _, ...userWithoutPassword } = user;
        res.json({ 
          user: userWithoutPassword, 
          token,
          message: "Login successful" 
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
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
      
      // Get the word to determine its unit
      const word = await storage.getWord(attemptData.wordId);
      if (word) {
        // Update user progress for this unit
        const existingProgress = await storage.getUserProgress(word.unitId);
        const progressUpdate = {
          unitId: word.unitId,
          userId: attemptData.userId,
          totalAttempts: (existingProgress?.totalAttempts || 0) + 1,
          correctAttempts: (existingProgress?.correctAttempts || 0) + (attemptData.isCorrect ? 1 : 0),
          completedWords: existingProgress?.completedWords || 0,
          lastPracticedAt: new Date()
        };

        // If this is a correct attempt, check if it's the first time completing this word
        if (attemptData.isCorrect) {
          const wordAttempts = await storage.getPracticeAttempts(attemptData.wordId, attemptData.userId);
          const previousCorrectAttempts = wordAttempts.filter(a => a.isCorrect && a.id !== attempt.id);
          
          // If this is the first correct attempt for this word, increment completed words
          if (previousCorrectAttempts.length === 0) {
            progressUpdate.completedWords = (existingProgress?.completedWords || 0) + 1;
          }
        }

        await storage.updateUserProgress(progressUpdate);
      }
      
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
      console.error('Practice attempt submission error:', error);
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

  // Test Papers endpoints
  app.get('/api/units/:unitId/test-papers', async (req, res) => {
    try {
      const { unitId } = req.params;
      const testPapers = await storage.getTestPapers(unitId);
      res.json(testPapers);
    } catch (error) {
      console.error('Error fetching test papers:', error);
      res.status(500).json({ error: 'Failed to fetch test papers' });
    }
  });

  app.get('/api/test-papers/:testPaperId/words', async (req, res) => {
    try {
      const { testPaperId } = req.params;
      const words = await storage.getTestPaperWords(testPaperId);
      res.json(words);
    } catch (error) {
      console.error('Error fetching test paper words:', error);
      res.status(500).json({ error: 'Failed to fetch test paper words' });
    }
  });

  app.post('/api/units/:unitId/generate-test-papers', async (req, res) => {
    try {
      const { unitId } = req.params;
      const { wordsPerPaper, useExcelStructure } = req.body;
      
      let testPapers;
      if (useExcelStructure !== false) {
        // Use predefined Excel structure by default
        testPapers = await storage.generatePredefinedTestPapersForUnit(unitId);
      } else {
        // Use custom word count generation if explicitly requested
        testPapers = await storage.generateTestPapersForUnit(unitId, wordsPerPaper);
      }
      
      res.json(testPapers);
    } catch (error) {
      console.error('Error generating test papers:', error);
      res.status(500).json({ error: 'Failed to generate test papers' });
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

  // Dictionary API endpoint  
  app.get("/api/dictionary/:word", async (req, res) => {
    try {
      const { word } = req.params;
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        return res.status(404).json({ error: 'Word not found in dictionary' });
      }
      
      const data = await response.json();
      
      // Extract the first definition from the response
      const firstEntry = data[0];
      const firstMeaning = firstEntry?.meanings?.[0];
      const firstDefinition = firstMeaning?.definitions?.[0];
      
      const result = {
        word: firstEntry?.word || word,
        phonetic: firstEntry?.phonetic || firstEntry?.phonetics?.[0]?.text || null,
        partOfSpeech: firstMeaning?.partOfSpeech || null,
        definition: firstDefinition?.definition || null,
        example: firstDefinition?.example || null,
        audio: firstEntry?.phonetics?.find(p => p.audio)?.audio || null
      };
      
      res.json(result);
    } catch (error) {
      console.error('Dictionary API error:', error);
      res.status(500).json({ error: 'Failed to fetch word definition' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
