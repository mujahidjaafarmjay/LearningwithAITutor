import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertConversationSchema, insertMessageSchema, insertQuizAttemptSchema } from "@shared/schema";
import { aiTutorService } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Store user in session
      req.session.userId = user.id;
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        } 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user in session
      req.session.userId = user.id;
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        } 
      });
    } catch (error) {
      res.status(400).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });
  });

  // AI Chat routes
  app.post("/api/chat/send", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { message, conversationId } = req.body;
      let conversation;

      if (conversationId) {
        conversation = await storage.getConversationById(conversationId);
        if (!conversation || conversation.userId !== req.session.userId) {
          return res.status(404).json({ error: "Conversation not found" });
        }
      } else {
        // Create new conversation with a temporary topic
        conversation = await storage.createConversation({
          userId: req.session.userId,
          title: message.substring(0, 50) + "...",
          topic: null // Will be set after AI response
        });
      }

      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message
      });

      // Generate AI response using the new AI service
      const aiResponse = await aiTutorService.generateResponse(message);
      
      // Save AI message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: aiResponse.content
      });

      // Update user progress
      if (aiResponse.topic) {
        const currentProgress = await storage.getUserProgress(req.session.userId);
        const topicProgress = currentProgress.find(p => p.topic === aiResponse.topic);
        await storage.updateUserProgress(
          req.session.userId, 
          aiResponse.topic, 
          Math.min(100, (topicProgress?.progress || 0) + 5)
        );
      }

      res.json({
        conversationId: conversation.id,
        message: aiResponse.content,
        topic: aiResponse.topic,
        suggestedTopics: aiResponse.suggestedTopics
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  app.get("/api/chat/conversations", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const conversations = await storage.getConversationsByUserId(req.session.userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/chat/conversations/:id/messages", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversationById(conversationId);
      
      if (!conversation || conversation.userId !== req.session.userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Quiz routes
  app.get("/api/quizzes", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuizById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  app.post("/api/quizzes/:id/submit", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const quizId = parseInt(req.params.id);
      const { answers } = req.body;
      
      const quiz = await storage.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Calculate score
      const score = calculateQuizScore(quiz, answers);
      
      // Save attempt
      await storage.createQuizAttempt({
        userId: req.session.userId,
        quizId,
        answers,
        score
      });

      // Update progress
      await storage.updateUserProgress(
        req.session.userId,
        quiz.topic,
        Math.min(100, score)
      );

      const questions = quiz.questions as any[];
      res.json({ score, totalQuestions: questions.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  });

  // AI Service Status route
  app.get("/api/ai/status", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const status = aiTutorService.getApiStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get AI service status" });
    }
  });

  // Progress routes
  app.get("/api/progress", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const progress = await storage.getUserProgress(req.session.userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const progress = await storage.getUserProgress(req.session.userId);
      const quizAttempts = await storage.getQuizAttemptsByUserId(req.session.userId);
      
      const stats = {
        topicsLearned: progress.length,
        averageScore: quizAttempts.length > 0 
          ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length)
          : 0,
        studyStreak: 7 // Placeholder - would calculate based on daily activity
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function calculateQuizScore(quiz: any, answers: any[]): number {
  let correctAnswers = 0;
  const questions = quiz.questions as any[];
  
  questions.forEach((question: any, index: number) => {
    if (answers[index] === question.correctAnswer) {
      correctAnswers++;
    }
  });
  
  return Math.round((correctAnswers / questions.length) * 100);
}
