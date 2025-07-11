import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface ChatMessage {
  conversationId?: number;
  message: string;
  topic?: string;
  suggestedTopics?: string[];
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  topic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: number;
  topic: string;
  title: string;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export interface UserProgress {
  id: number;
  topic: string;
  progress: number;
  lastStudied: string;
}

export interface UserStats {
  topicsLearned: number;
  averageScore: number;
  studyStreak: number;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User }> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  register: async (data: RegisterData): Promise<{ user: User }> => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  }
};

// Chat API
export const chatApi = {
  sendMessage: async (message: string, conversationId?: number): Promise<ChatMessage> => {
    const response = await apiRequest("POST", "/api/chat/send", { message, conversationId });
    return response.json();
  },

  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiRequest("GET", "/api/chat/conversations");
    return response.json();
  },

  getMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await apiRequest("GET", `/api/chat/conversations/${conversationId}/messages`);
    return response.json();
  }
};

// Quiz API
export const quizApi = {
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await apiRequest("GET", "/api/quizzes");
    return response.json();
  },

  getQuiz: async (id: number): Promise<Quiz> => {
    const response = await apiRequest("GET", `/api/quizzes/${id}`);
    return response.json();
  },

  submitQuiz: async (quizId: number, answers: number[]): Promise<{ score: number; totalQuestions: number }> => {
    const response = await apiRequest("POST", `/api/quizzes/${quizId}/submit`, { answers });
    return response.json();
  }
};

// Progress API
export const progressApi = {
  getProgress: async (): Promise<UserProgress[]> => {
    const response = await apiRequest("GET", "/api/progress");
    return response.json();
  },

  getStats: async (): Promise<UserStats> => {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  }
};
