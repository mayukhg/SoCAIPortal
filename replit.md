# SoC-AI Portal

## Overview

SoC-AI Portal is a unified, AI-powered Security Operations Center (SOC) web application designed to support Tier 1–3 analysts. The platform provides intelligent alert triage, simplified investigations, proactive threat detection, and streamlined reporting through a modern web interface. Built with a full-stack TypeScript architecture, it combines real-time monitoring capabilities with AI-powered analysis to enhance security operations efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom SOC-themed design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with real-time WebSocket support
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit Auth integration with OIDC

### Database Architecture
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Structured tables for users, alerts, investigations, comments, activities, and chat messages
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Authentication System
- Replit Auth integration for secure user authentication
- Role-based access control (tier1, tier2, tier3, manager)
- Session-based authentication with PostgreSQL session storage
- Automatic user provisioning and profile management

### Alert Management System
- Real-time alert ingestion and processing
- AI-powered alert analysis using OpenAI GPT-4o
- Severity-based prioritization (critical, high, medium, low, info)
- Status tracking (open, investigating, resolved, false_positive)
- Assignment and escalation workflows

### AI Integration
- OpenAI service for intelligent alert analysis
- Automated risk scoring and MITRE ATT&CK mapping
- Contextual threat intelligence integration
- AI chat assistant for guided investigations

### Real-time Communication
- WebSocket server for live updates
- Real-time alert notifications
- Live dashboard metrics updates
- Instant collaboration features

### Dashboard and Analytics
- KPI monitoring (MTTD, MTTR, false positive rates)
- Visual alert feed with filtering capabilities
- Investigation workflow management
- Activity timeline tracking

## Data Flow

1. **Alert Ingestion**: Security alerts are received and stored in the alerts table
2. **AI Analysis**: OpenAI service analyzes alerts and provides risk scores, recommendations, and MITRE mappings
3. **Real-time Updates**: WebSocket connections broadcast new alerts and updates to connected clients
4. **User Interaction**: Analysts can update alert status, create investigations, and collaborate through comments
5. **Dashboard Updates**: Metrics and KPIs are calculated and displayed in real-time
6. **Chat Integration**: AI-powered chat provides contextual assistance for investigations

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for alert analysis and chat assistance
- **API Key Management**: Environment variable-based configuration

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection Pooling**: @neondatabase/serverless for optimized connections

### Authentication
- **Replit Auth**: OIDC-based authentication system
- **Session Storage**: PostgreSQL-backed session management

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- Vite development server for frontend with HMR
- tsx for TypeScript execution in development
- Environment variable configuration for database and API keys

### Production Build
- Vite builds optimized client bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Single server serves both API and static files

### Database Management
- Drizzle migrations for schema changes
- Database URL environment variable for connection
- Automatic session table management

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access
- `SESSION_SECRET`: Session encryption key
- `REPL_ID` and `ISSUER_URL`: Replit Auth configuration

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and real-time capabilities to support the demanding requirements of security operations centers.

## Recent Changes
- Complete SOC portal implementation with all advanced features
- AI-powered alert triage system using OpenAI GPT-4o  
- Real-time dashboard with WebSocket integration and KPI monitoring
- Role-based authentication and multi-tier user management
- Advanced features: Threat correlation graph, automated reports, team management, playbook builder
- Interactive network visualization for threat analysis
- Comprehensive documentation with architecture overview and component analysis
- Sample security alerts and realistic investigation workflows