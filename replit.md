# MessengerPro - Personal Messaging Application

## Overview

MessengerPro is a modern, cross-platform messaging application built with React and Firebase. The application enables real-time messaging, file transfers, and seamless communication between users across mobile and PC devices. It features a beautiful, glassmorphic UI with dark/light mode support, real-time presence tracking, typing indicators, and comprehensive file sharing capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management

**UI/UX Design System**
- shadcn/ui components built on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (dark/light mode support)
- Glassmorphism design pattern with backdrop blur effects
- Custom animations and micro-interactions for enhanced user experience
- Responsive design with mobile-first approach

**State Management Strategy**
- React Context API for authentication state (AuthContext)
- React Context API for chat state (ChatContext)
- Zustand stores for global state (authStore, chatStore)
- Local component state for UI interactions
- Real-time listeners managed through custom hooks

**Component Architecture**
- Atomic design methodology with shared UI components in `/components/ui`
- Feature-based organization for auth, chat, and layout components
- Custom hooks for business logic separation (`useAuth`, `useChat`, `usePresence`)
- Reusable utility functions in `/lib/utils.ts`

### Backend Architecture

**Server Framework**
- Express.js REST API server
- Vite middleware integration for development
- Custom logging middleware for API request tracking
- JSON body parsing with raw body preservation for webhooks

**Real-time Communication**
- Firebase Firestore for real-time database operations
- WebSocket-like subscriptions via Firestore listeners
- Optimistic UI updates with local state synchronization

**Data Storage Design**
- In-memory storage interface (`IStorage`) for server-side operations
- MemStorage implementation for development/testing
- Designed to be swapped with database implementations (Postgres/Drizzle)
- UUID-based entity identification

### External Dependencies

**Firebase Services**
- **Firebase Authentication**: Email/password and Google OAuth authentication
- **Firebase Firestore**: Real-time NoSQL database for users, conversations, and messages
- **Firebase Storage**: Cloud storage for file uploads (images, videos, documents)
- Serverless architecture - no backend server maintenance required

**Database Schema (Firestore Collections)**
- `users`: User profiles with presence tracking (isOnline, lastSeen)
- `conversations`: Chat conversations with participant arrays and metadata
- `messages`: Individual messages with support for text, files, reactions, and status
- `typingIndicators`: Temporary collection for typing status

**Third-Party Integrations**
- Google OAuth provider for social authentication
- Font Awesome for iconography
- Google Fonts (Inter, Roboto) for typography

**File Storage Strategy**
- Firebase Cloud Storage for file persistence
- Client-side image compression (70% reduction) before upload
- Support for images, videos, PDFs, and documents (10MB limit)
- Thumbnail generation for image previews
- Progress tracking during uploads/downloads

**Development & Production**
- Neon Database integration prepared (via `@neondatabase/serverless`)
- Drizzle ORM configured for future SQL migrations
- PostgreSQL dialect support with schema definitions in `/shared/schema.ts`
- Session management with `connect-pg-simple` for production scaling

**Key Architectural Decisions**
- Firebase chosen for real-time capabilities and simplified backend management
- Drizzle ORM prepared for future migration to self-hosted database
- React Query for efficient data fetching and caching
- Modular architecture allows switching from Firebase to REST API + PostgreSQL
- TypeScript schemas shared between client and server via `/shared` directory
- Zod validation for runtime type checking and form validation