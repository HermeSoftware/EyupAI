# Overview

EyüpAI is a Turkish educational AI application that helps students solve academic problems across multiple subjects including mathematics, geometry, physics, chemistry, biology, history, and literature. The application accepts both text and image inputs, processes them using Google's Gemini AI model, and provides structured, step-by-step solutions with mathematical notation, diagrams, and validation. The system is built as a modern web application with a React frontend and Express.js backend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with CSS custom properties for theming, Inter font family
- **Mathematical Rendering**: KaTeX for LaTeX formula rendering with fallback HTML conversion
- **File Handling**: Native HTML5 file upload with drag-and-drop support

## Backend Architecture  
- **Runtime**: Node.js with TypeScript and ESM modules
- **Framework**: Express.js with minimal middleware setup
- **File Upload**: Multer for handling multipart form data and image uploads
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Storage**: In-memory storage implementation with interface for future database integration
- **Validation**: Math.js for mathematical expression validation and verification
- **Development**: Vite integration for hot module replacement in development

## Data Layer
- **Database**: PostgreSQL with Neon serverless driver
- **Schema**: Three main tables - users, solutions, and feedback
- **ORM**: Drizzle with Zod schema validation for type safety
- **Storage Strategy**: Interface-based storage layer allowing pluggable implementations (current: in-memory, future: PostgreSQL)

## AI Integration
- **Model Provider**: Google Gemini AI via @google/genai package
- **Input Processing**: Multimodal support for text and image inputs
- **Response Format**: Structured JSON responses with steps, LaTeX formulas, SVG diagrams, and confidence scores
- **Validation**: Server-side mathematical validation using math.js to verify AI-generated solutions

## Authentication & Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **User Management**: Basic user system with username/password authentication
- **Security**: Environment-based API key management for external services

## File & Asset Management
- **Upload Directory**: Local filesystem storage for temporary file uploads
- **Image Processing**: Direct buffer processing for AI model input
- **Static Assets**: Vite-handled static asset serving with proper cache headers

## Deployment Architecture
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Environment**: Development/production environment detection
- **Database Migrations**: Drizzle Kit for schema migrations
- **Process Management**: Single-process Node.js server serving both API and static assets

# External Dependencies

## AI Services
- **Google Gemini AI**: Primary AI model for problem-solving via @google/genai package
- **API Authentication**: GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable

## Database Services  
- **Neon Database**: Serverless PostgreSQL database using @neondatabase/serverless driver
- **Connection**: DATABASE_URL environment variable for database connectivity

## Third-Party Libraries
- **UI Components**: Radix UI primitives for accessible component foundation
- **Mathematical Processing**: KaTeX for LaTeX rendering, math.js for validation
- **File Handling**: Multer for file uploads with temporary storage
- **Query Management**: TanStack Query for efficient data fetching and caching
- **Validation**: Zod for runtime type validation and schema definition

## Development Tools
- **Replit Integration**: Specialized Replit plugins for development environment
- **Build Tools**: Vite with React plugin, esbuild for backend bundling
- **Type Checking**: TypeScript with strict mode configuration
- **Code Quality**: ESLint integration through Vite plugin system

## CDN Resources
- **Fonts**: Google Fonts (Inter family) loaded via CDN
- **Math Rendering**: KaTeX CSS and JS loaded from jsDelivr CDN
- **Icons**: Font Awesome icons loaded via CDN, Lucide React icons as components
