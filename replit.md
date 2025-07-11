# AI-Powered Learning Management System

## Overview

This is a full-stack AI-powered conversational Learning Management System (LMS) built with Express.js backend and React frontend. The system provides intelligent chat-based learning experiences, quiz functionality, and user progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Password-based authentication using bcrypt
- **API Design**: RESTful API endpoints for all functionality

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Database Schema
- **Users**: Stores user credentials, preferences, and profile information
- **Conversations**: Tracks chat sessions with AI tutor
- **Messages**: Individual chat messages with role-based content
- **Quizzes**: Quiz templates with questions and answers
- **Quiz Attempts**: User quiz submissions and scores
- **User Progress**: Learning progress tracking by topic

### Authentication System
- Session-based authentication using express-session
- Password hashing with bcryptjs
- Protected routes requiring authentication
- User registration and login endpoints

### Chat Interface
- Real-time chat with AI tutor functionality
- Message history persistence
- Conversation management
- Topic-based learning suggestions

### Quiz System
- Multiple-choice quiz generation
- Score tracking and progress monitoring
- Topic-based quiz organization
- Answer submission and evaluation

### Progress Tracking
- User learning progress by topic
- Statistics dashboard
- Achievement tracking
- Performance analytics

## Data Flow

1. **User Authentication**: Users register/login through API endpoints
2. **Session Management**: Express sessions maintain user state
3. **Chat Interactions**: Messages sent to AI service, responses stored in database
4. **Quiz Flow**: Users take quizzes, answers submitted and scored
5. **Progress Updates**: Learning activities update user progress metrics
6. **Dashboard Display**: Frontend queries aggregated statistics and progress

## External Dependencies

### Core Backend Dependencies
- Express.js for server framework
- Drizzle ORM for database interactions
- @neondatabase/serverless for PostgreSQL connection
- bcryptjs for password hashing
- express-session for session management

### Core Frontend Dependencies
- React with TypeScript
- Vite for build tooling
- TanStack Query for data fetching
- Wouter for routing
- Radix UI components for accessibility
- Tailwind CSS for styling

### UI Component Library
- shadcn/ui components built on Radix UI
- Comprehensive component set (buttons, forms, dialogs, etc.)
- Consistent design system with CSS variables
- Dark/light theme support

## Deployment Strategy

### Development
- Concurrent development server setup
- Hot module replacement for frontend
- TypeScript compilation for backend
- Database migrations with Drizzle Kit

### Production Build
- Vite builds optimized frontend bundle
- esbuild bundles backend for Node.js
- Static file serving through Express
- Environment-based configuration

### Database Management
- Drizzle migrations for schema changes
- PostgreSQL as primary database
- Connection pooling for performance
- Environment-based database URLs

The application uses a traditional monorepo structure with separate client and server directories, shared schema definitions, and comprehensive TypeScript configuration for type safety across the entire stack.

## Recent Changes: Latest modifications with dates

### January 11, 2025
- **Hugging Face AI Integration**: Implemented comprehensive AI tutoring service with easy API integration
- **Smart Fallback System**: Created intelligent educational responses that work without API key
- **AI Service Architecture**: Built modular AI service supporting multiple Hugging Face models
- **Enhanced Chat Interface**: Improved conversation management with topic categorization
- **Progress Tracking**: Added user progress updates based on AI interactions
- **API Status Endpoint**: Added `/api/ai/status` to check AI service availability