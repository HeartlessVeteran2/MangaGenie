# MangaAI - AI-Powered Manga Translation Platform

## Overview

MangaAI is a comprehensive manga reader and anime streaming Android application that surpasses Komikku and Aniyomi with modern UI combining Gemini, Android 16, and Comick layouts. The platform features advanced AI-powered OCR translation, repository management compatible with Aniyomi/Komikku sources, NSFW content support with age verification, advanced streaming capabilities, and comprehensive user management.

**Current Status: Full-featured Android application with advanced components competing directly with Komikku and Aniyomi. All core features implemented including AI translation, advanced reader, video player, search system, download management, and NSFW content controls.**

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

### Advanced Components Implementation

#### Core Advanced Components
- **AdvancedReader**: Comprehensive manga reading component with AI translation overlay, gesture controls, pinch-to-zoom, multiple reading modes (paged/continuous/webtoon), and real-time OCR processing
- **AdvancedPlayer**: Professional video player with quality selection, subtitle support, playback speed control, gesture-based volume/brightness adjustment, and streaming optimization
- **AdvancedSearch**: Multi-repository search system with advanced filtering (genres, status, NSFW, ratings), source selection, and content discovery algorithms
- **AdvancedSettings**: Comprehensive preferences system covering reading settings, translation configuration, and app behavior with user-friendly controls
- **DownloadManager**: Enterprise-grade download system with queue management, progress tracking, storage optimization, and concurrent download controls
- **AgeVerification**: NSFW content management with age verification, parental controls, content filtering, and compliance with content guidelines

#### Next-Generation Features
- **SmartRecommendations**: AI-powered personalized suggestions with mood-based filtering, library analysis, and intelligent content discovery beyond basic popularity rankings
- **CommunityHub**: Integrated chapter discussions, social features, and community engagement with spoiler warnings and threaded conversations
- **CreatorDiscovery**: Staff & Studio hub functionality for following authors, artists, and studios across their complete works with detailed creator profiles and work collections

#### Enhanced Features Implementation
- **AI Translation System**: Real-time OCR with confidence scoring, contextual translation using OpenAI GPT-4o, and overlay positioning
- **Repository Management**: Full compatibility with Aniyomi/Komikku sources, individual source controls, and NSFW filtering
- **Content Discovery**: Advanced search with multi-criteria filtering, source aggregation, and personalized recommendations
- **User Experience**: Material Design 3 components, dynamic theming, gesture-based navigation, and accessibility features
- **Storage Management**: Download progress tracking, storage usage monitoring, and automatic cleanup options
- **Content Safety**: Age verification system, NSFW controls, and parental supervision features

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