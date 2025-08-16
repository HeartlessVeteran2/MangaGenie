# MangaAI - AI-Powered Manga Translation Platform

## Overview

MangaAI is a comprehensive manga reader and anime streaming application that surpasses Komikku and Aniyomi with modern UI combining Gemini, Android 16, and Comick layouts. The platform features AI-powered OCR translation, repository management compatible with Aniyomi/Komikku sources, NSFW content support, advanced streaming capabilities, and comprehensive user management.

**Current Status: Transitioning from web application to Android app while maintaining full feature parity and repository compatibility.**

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Android App Architecture (Primary)
- **Framework**: React Native 0.72+ with TypeScript for cross-platform mobile development
- **Navigation**: React Navigation with bottom tab and stack navigation for mobile-optimized UX
- **UI Framework**: Material Design 3 components following Android 16 design guidelines
- **State Management**: React Context API with AsyncStorage for local persistence
- **Repository Compatibility**: Full Aniyomi and Komikku source repository support
- **Native Features**: Android-specific OCR, video playback, file management, and background services

### Web Application (Legacy/Fallback)
- **Framework**: React 18 with TypeScript in a modern single-page application
- **Routing**: Wouter for lightweight client-side routing with pages for home, library, and reader
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds
- **Mobile-First Design**: Responsive design with bottom navigation optimized for mobile reading

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API endpoints with JSON responses
- **File Handling**: Multer middleware for image upload processing with memory storage
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development**: Hot reload with Vite middleware integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Pattern**: Repository pattern with in-memory fallback for development
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple

### Authentication and Authorization
- **Session-Based**: Express sessions with PostgreSQL storage
- **User Identification**: Header-based user ID system with demo user fallback
- **Security**: CORS enabled, JSON parsing middleware with size limits

### External Service Integrations
- **OCR Service**: Tesseract.js for optical character recognition with multi-language support (Japanese, Korean, Chinese)
- **Translation Service**: OpenAI GPT-4o for context-aware manga translation with quality tiers
- **Image Processing**: Memory-based image handling with support for JPEG, PNG, and WebP formats

### Key Features Implementation
- **Manga Library Management**: CRUD operations for manga collections with progress tracking
- **Chapter Organization**: Page-based reading with bookmark functionality
- **Real-time Translation**: OCR detection followed by AI translation with confidence scoring
- **Translation Overlay**: Dynamic positioned translation bubbles over original text
- **Language Support**: Japanese, Korean, and Chinese to English translation pairs
- **Quality Settings**: Configurable translation quality (fast/balanced/premium) affecting model selection
- **Progress Tracking**: Reading progress persistence across sessions

### Development and Deployment
- **Development**: tsx for TypeScript execution with file watching
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Environment**: Replit-optimized with runtime error overlays and development banners
- **Asset Management**: Static asset serving with proper caching headers
- **Font Loading**: Google Fonts integration for typography (Inter, JetBrains Mono)

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **TypeScript**: Full TypeScript support with strict configuration
- **Build Tools**: Vite, esbuild, PostCSS, Autoprefixer

### Database and ORM
- **Drizzle ORM**: Type-safe PostgreSQL ORM with Zod schema validation
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Session Storage**: connect-pg-simple for PostgreSQL session management

### UI and Styling
- **Shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Lucide Icons**: Icon library for consistent iconography

### AI and Processing Services
- **OpenAI API**: GPT-4o model for manga-specific translation with context awareness
- **Tesseract.js**: Browser-based OCR with multi-language support
- **Image Processing**: Multer for file uploads, native image format support

### State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form validation with Zod resolvers
- **Date Management**: date-fns for date manipulation and formatting

### Development and Utilities
- **Class Variance Authority**: Utility for component variant management
- **clsx/tailwind-merge**: Conditional CSS class composition
- **Embla Carousel**: Touch-friendly carousel component for image viewing
- **Replit Integration**: Development environment optimization and error handling