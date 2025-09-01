# FreeSpell - IELTS Vocabulary Practice

## Overview

FreeSpell is an interactive IELTS vocabulary learning application built with React and Express. The app helps users practice spelling and memorize vocabulary from the Wang Lu Corpus through gamified learning sessions. It features unit-based learning, error tracking, progress monitoring, and practice analytics to enhance vocabulary retention.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with TypeScript and Vite for fast development and optimized builds
- **Component Library**: Uses shadcn/ui components with Radix UI primitives for consistent, accessible UI
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Express Server**: RESTful API with middleware for request logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Database Integration**: Drizzle ORM configured for PostgreSQL with Neon database support
- **Development Tools**: Vite middleware integration for hot module replacement in development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Normalized tables for units, words, user progress, practice attempts, error words, and practice settings
- **Migration Management**: Drizzle Kit for database schema migrations and updates
- **Connection**: Neon serverless PostgreSQL for cloud database hosting

### Authentication and Authorization
- **Simplified Auth**: Uses default user ID system for demo purposes
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **User Context**: All data operations include user ID for multi-user support

### API Design Patterns
- **RESTful Endpoints**: Standard CRUD operations for units, words, progress, and practice data
- **Response Formatting**: Consistent JSON responses with error handling middleware
- **Query Parameters**: Support for filtering, pagination, and data customization
- **Validation**: Zod schemas for request/response validation and type safety

## External Dependencies

### Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **shadcn/ui**: Pre-built component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Class Variance Authority**: Utility for creating variant-based component APIs

### Development and Build Tools
- **Vite**: Fast build tool and development server with HMR support
- **TypeScript**: Static typing for better developer experience and code safety
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### Data Fetching and Forms
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries
- **Zod**: Schema validation for forms and API responses

### Audio and Media
- **Web Speech API**: Browser-native text-to-speech for word pronunciation
- **SpeechSynthesis**: Built-in browser API for audio playback of vocabulary words