import { 
  users, conversations, messages, quizzes, quizAttempts, userProgress,
  type User, type InsertUser, type Conversation, type InsertConversation,
  type Message, type InsertMessage, type Quiz, type QuizAttempt, 
  type InsertQuizAttempt, type UserProgress, type InsertUserProgress
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Conversation operations
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  getConversationById(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Message operations
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Quiz operations
  getQuizzes(): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz>;
  
  // Quiz attempt operations
  getQuizAttemptsByUserId(userId: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  
  // User progress operations
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(userId: number, topic: string, progress: number): Promise<UserProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private conversations: Map<number, Conversation> = new Map();
  private messages: Map<number, Message> = new Map();
  private quizzes: Map<number, Quiz> = new Map();
  private quizAttempts: Map<number, QuizAttempt> = new Map();
  private userProgress: Map<number, UserProgress> = new Map();
  
  private currentUserId = 1;
  private currentConversationId = 1;
  private currentMessageId = 1;
  private currentQuizId = 1;
  private currentQuizAttemptId = 1;
  private currentProgressId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: 1,
      email: "demo@example.com",
      password: "hashedpassword123",
      name: "Demo User",
      learningPreferences: { preferredSubjects: ["programming", "math"] },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(1, sampleUser);
    this.currentUserId = 2;

    // Create sample quizzes
    const pythonQuiz: Quiz = {
      id: 1,
      topic: "Python Programming",
      title: "Python Functions Quiz",
      questions: [
        {
          id: 1,
          question: "What is the correct syntax for defining a function in Python?",
          options: [
            "function myFunction():",
            "def myFunction():",
            "define myFunction():",
            "func myFunction():"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "How do you call a function named 'greet' with parameter 'name'?",
          options: [
            "greet(name)",
            "call greet(name)",
            "execute greet(name)",
            "run greet(name)"
          ],
          correctAnswer: 0
        }
      ],
      createdAt: new Date()
    };
    this.quizzes.set(1, pythonQuiz);
    this.currentQuizId = 2;

    // Create sample progress
    const sampleProgress: UserProgress[] = [
      {
        id: 1,
        userId: 1,
        topic: "Python Programming",
        progress: 85,
        lastStudied: new Date(),
        createdAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        topic: "Web Development",
        progress: 62,
        lastStudied: new Date(),
        createdAt: new Date()
      },
      {
        id: 3,
        userId: 1,
        topic: "Data Science",
        progress: 43,
        lastStudied: new Date(),
        createdAt: new Date()
      }
    ];
    
    sampleProgress.forEach(progress => {
      this.userProgress.set(progress.id, progress);
    });
    this.currentProgressId = 4;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.currentUserId++,
      learningPreferences: user.learningPreferences || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
  }

  async getConversationById(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const newConversation: Conversation = {
      ...conversation,
      id: this.currentConversationId++,
      topic: conversation.topic || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.conversations.set(newConversation.id, newConversation);
    return newConversation;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: this.currentMessageId++,
      createdAt: new Date()
    };
    this.messages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> {
    const newQuiz: Quiz = {
      ...quiz,
      id: this.currentQuizId++,
      createdAt: new Date()
    };
    this.quizzes.set(newQuiz.id, newQuiz);
    return newQuiz;
  }

  async getQuizAttemptsByUserId(userId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values())
      .filter(attempt => attempt.userId === userId)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: this.currentQuizAttemptId++,
      completedAt: new Date()
    };
    this.quizAttempts.set(newAttempt.id, newAttempt);
    return newAttempt;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId)
      .sort((a, b) => b.lastStudied!.getTime() - a.lastStudied!.getTime());
  }

  async updateUserProgress(userId: number, topic: string, progress: number): Promise<UserProgress> {
    const existingProgress = Array.from(this.userProgress.values())
      .find(p => p.userId === userId && p.topic === topic);
    
    if (existingProgress) {
      const updatedProgress = { 
        ...existingProgress, 
        progress, 
        lastStudied: new Date() 
      };
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      const newProgress: UserProgress = {
        id: this.currentProgressId++,
        userId,
        topic,
        progress,
        lastStudied: new Date(),
        createdAt: new Date()
      };
      this.userProgress.set(newProgress.id, newProgress);
      return newProgress;
    }
  }
}

export const storage = new MemStorage();
