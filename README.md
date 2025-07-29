# SoC-AI Portal

A unified, AI-powered Security Operations Center (SOC) web application designed to support Tier 1–3 analysts with intelligent alert triage, streamlined investigations, proactive threat detection, and collaborative incident response.

## 📋 Documentation Overview

The SoC-AI Portal combines real-time monitoring capabilities with AI-powered analysis to enhance security operations efficiency. Built with a modern full-stack TypeScript architecture, it integrates OpenAI GPT-4o for intelligent threat analysis and provides comprehensive workflows for security teams across all analyst tiers.

### Key Capabilities
- **AI-Powered Alert Triage**: Automated risk scoring and MITRE ATT&CK mapping
- **Real-Time Monitoring**: Live dashboard with WebSocket updates and KPI tracking
- **Multi-Tier Collaboration**: Role-based workflows for Tier 1-3 analysts and managers
- **Incident Response**: Automated playbook execution and investigation tracking
- **Threat Intelligence**: Interactive correlation graphs and global threat mapping
- **Reporting & Analytics**: Executive summaries and compliance reporting

## 🏗️ Architecture Sections

### High-Level System Design

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server  │◄──►│  PostgreSQL DB  │
│   (Frontend)    │    │   (Backend)      │    │   (Storage)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Tailwind CSS │    │   OpenAI API     │    │  Drizzle ORM    │
│   (Styling)     │    │   (AI Analysis)  │    │  (Schema)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Project Structure

```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── dashboard/      # SOC-specific components
│   │   │   └── ui/            # Base UI library (shadcn/ui)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and configurations
│   │   ├── pages/             # Application pages/routes
│   │   └── types/             # TypeScript type definitions
│   └── index.html             # Entry point
├── server/                    # Backend Express application
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API route definitions
│   ├── storage.ts            # Database interface layer
│   ├── db.ts                 # Database connection
│   ├── openaiService.ts      # AI analysis service
│   ├── replitAuth.ts         # Authentication middleware
│   └── seedData.ts           # Sample data generation
├── shared/                   # Shared types and schemas
│   └── schema.ts            # Database schema definitions
└── README.md                # Project documentation
```

### Data Flow and Interactions

1. **Alert Ingestion**: Security alerts → Database storage → AI analysis → Risk scoring
2. **Real-Time Updates**: WebSocket connections → Live dashboard updates → Team notifications
3. **Investigation Workflow**: Alert triage → Investigation creation → Collaborative analysis → Resolution
4. **AI Integration**: Alert analysis → MITRE mapping → Contextual recommendations → Chat assistance
5. **Reporting Pipeline**: Data aggregation → Report generation → Role-based access → Export capabilities

## 🧩 Component Analysis

### SOCDashboard
**Main container and navigation orchestrator**
- Centralizes all SOC operations in unified interface
- Provides role-based navigation and access control
- Manages real-time data synchronization across components
- Handles authentication state and user session management

**Key Features:**
- Live KPI monitoring (MTTD, MTTR, false positive rates)
- Real-time alert feed with severity-based filtering
- AI-powered chat assistant for investigation support
- Activity timeline for team collaboration tracking

### AlertFeed
**Real-time alert management with AI summaries**
- Displays incoming security alerts with intelligent prioritization
- Provides AI-generated summaries and risk assessments
- Enables quick triage actions and assignment workflows
- Supports filtering by severity, status, and assignment

**AI Integration:**
- Automated risk scoring (1-100 scale)
- MITRE ATT&CK technique mapping
- Contextual threat intelligence
- Recommended response actions

### AIAssistant
**Conversational investigation support**
- Interactive chat interface for security analysis
- Context-aware responses based on current alerts and investigations
- Guided investigation workflows and best practices
- Integration with threat intelligence and historical data

**Capabilities:**
- Natural language query processing
- Investigation methodology guidance
- Threat hunting assistance
- Knowledge base integration

### CollaborationPanel
**Multi-tier analyst workflows**
- Team activity feeds and communication tools
- Assignment and escalation management
- Shift handoff capabilities
- Cross-tier knowledge sharing

**Workflow Features:**
- Comment threads on alerts and investigations
- @mention notifications for team members
- Status updates and progress tracking
- Escalation paths for complex incidents

### IncidentManagement
**Full lifecycle incident tracking**
- Investigation creation and management
- Evidence collection and documentation
- Timeline reconstruction and analysis
- Post-incident review and lessons learned

**Investigation Tools:**
- Artifact collection and preservation
- Timeline visualization
- IOC (Indicator of Compromise) tracking
- Forensic analysis support

### KPIMetrics
**Performance analytics dashboard**
- Real-time SOC performance monitoring
- Analyst productivity tracking
- SLA compliance measurement
- Trend analysis and reporting

**Key Metrics:**
- Mean Time to Detection (MTTD)
- Mean Time to Response (MTTR)
- Alert resolution rates
- False positive percentage
- Team workload distribution

### ThreatMap
**Global threat intelligence visualization**
- Interactive network correlation graphs
- Geographic threat mapping
- Attack pattern visualization
- Threat actor profiling

**Visualization Features:**
- Node-link diagrams for threat relationships
- Heat maps for geographic threat density
- Timeline views for campaign tracking
- Interactive drill-down capabilities

## 🎨 Design System Documentation

### CSS Variable Architecture

```css
:root {
  /* Core Brand Colors */
  --primary: hsl(240, 100%, 60%);      /* Indigo-600 */
  --primary-foreground: hsl(0, 0%, 100%);
  
  /* Security Severity Colors */
  --critical: hsl(0, 84%, 60%);        /* Red-500 */
  --high: hsl(25, 95%, 60%);           /* Orange-500 */
  --medium: hsl(45, 93%, 60%);         /* Yellow-500 */
  --low: hsl(142, 76%, 60%);           /* Green-500 */
  --info: hsl(217, 91%, 60%);          /* Blue-500 */
  
  /* Dark Theme Foundation */
  --background: hsl(222, 84%, 5%);     /* Dark-950 */
  --foreground: hsl(210, 40%, 95%);    /* Dark-50 */
  --card: hsl(222, 84%, 9%);           /* Dark-900 */
  --border: hsl(217, 32%, 17%);        /* Dark-800 */
}
```

### Animation System

**Real-Time SOC Operations**
- Pulse animations for critical alerts (2s interval)
- Smooth transitions for status changes (300ms)
- Loading states with skeleton animations
- WebSocket connection indicators

```css
/* Critical Alert Pulse */
@keyframes critical-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Status Transition */
.status-transition {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Color Coding for Security Severity

| Severity | Color | Usage | Background |
|----------|-------|-------|------------|
| Critical | Red-500 | High-priority threats requiring immediate attention | Red-900/20 |
| High | Orange-500 | Significant security events needing prompt response | Orange-900/20 |
| Medium | Yellow-500 | Moderate threats for investigation | Yellow-900/20 |
| Low | Green-500 | Minor security events for monitoring | Green-900/20 |
| Info | Blue-500 | Informational alerts and system notifications | Blue-900/20 |

### Responsive Design Patterns

```css
/* Mobile-First Breakpoints */
.responsive-grid {
  grid-template-columns: 1fr;                    /* Mobile */
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);       /* Tablet */
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);       /* Desktop */
  }
}
```

## 🔄 Integration Planning

### Backend Architecture

**Current Implementation:**
- Express.js REST API with TypeScript
- PostgreSQL database with Drizzle ORM
- WebSocket server for real-time updates
- Replit Auth for secure authentication

**Future Supabase Migration Path:**
```typescript
// Planned migration structure
const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    channels: ['alerts', 'investigations', 'chat'],
    policies: 'authenticated_users_only'
  }
}
```

### Database Schema Design

**Multi-Tier Access Control:**
```sql
-- Row Level Security policies
CREATE POLICY "tier1_read_policy" ON alerts
  FOR SELECT USING (severity IN ('low', 'medium'));

CREATE POLICY "tier3_full_access" ON alerts
  FOR ALL USING (auth.jwt() ->> 'role' = 'tier3');

CREATE POLICY "manager_all_access" ON alerts
  FOR ALL USING (auth.jwt() ->> 'role' = 'manager');
```

**Core Tables:**
- `users` - User profiles and role assignments
- `alerts` - Security alert storage with AI analysis
- `investigations` - Investigation tracking and documentation
- `comments` - Collaborative discussion threads
- `activities` - Audit trail and activity logging
- `chat_messages` - AI assistant conversation history

### Real-Time Features

**WebSocket Integration:**
```typescript
// Real-time event types
interface WebSocketEvents {
  new_alert: Alert;
  alert_updated: Alert;
  investigation_created: Investigation;
  chat_message: ChatMessage;
  user_activity: Activity;
}
```

**Supabase Realtime Channels:**
- `alerts` - New alerts and status updates
- `investigations` - Investigation lifecycle events
- `chat` - AI assistant and team communications
- `activities` - User actions and system events

### AI/ML Integration Points

**Enhanced Capabilities Roadmap:**
1. **Advanced Threat Detection**
   - Custom ML models for anomaly detection
   - Behavioral analysis for insider threats
   - Network traffic analysis integration

2. **Predictive Analytics**
   - Alert volume forecasting
   - Resource planning optimization
   - Threat landscape trend analysis

3. **Automated Response**
   - SOAR (Security Orchestration) integration
   - Automated containment actions
   - Dynamic playbook generation

## 🔒 Security & Performance

### Role-Based Access Control Design

**Tier Structure:**
```typescript
interface UserRole {
  tier1: {
    permissions: ['view_alerts', 'update_status', 'create_comments'];
    restrictions: ['critical_alerts', 'investigations', 'reports'];
  };
  tier2: {
    permissions: ['create_investigations', 'escalate_alerts', 'view_reports'];
    restrictions: ['user_management', 'system_config'];
  };
  tier3: {
    permissions: ['full_investigation_access', 'advanced_analysis'];
    restrictions: ['user_management'];
  };
  manager: {
    permissions: ['full_access', 'user_management', 'reporting'];
    restrictions: [];
  };
}
```

### Performance Optimization Strategies

**Frontend Optimizations:**
- React Query for intelligent caching and background updates
- Virtual scrolling for large alert lists
- Code splitting and lazy loading for route-based chunks
- Optimistic updates for improved perceived performance

**Backend Optimizations:**
- Database indexing on frequently queried fields
- Connection pooling for PostgreSQL
- Redis caching for session management (planned)
- API response compression and minification

**Real-Time Optimizations:**
- WebSocket connection management and reconnection logic
- Message throttling to prevent UI flooding
- Selective subscription to relevant data channels
- Efficient serialization for large datasets

### Testing Methodology

**Quality Assurance Framework:**
```typescript
// Testing pyramid structure
interface TestingStrategy {
  unit: 'Component logic and utility functions';
  integration: 'API endpoints and database operations';
  e2e: 'Critical user workflows and security scenarios';
  performance: 'Load testing and real-time responsiveness';
}
```

**Security Testing:**
- Authentication and authorization flows
- Input validation and sanitization
- SQL injection prevention
- XSS protection verification
- CSRF token validation

### Scalability Considerations

**Horizontal Scaling Strategies:**
1. **Database Scaling**
   - Read replicas for query distribution
   - Partitioning for large alert volumes
   - Connection pooling optimization

2. **Application Scaling**
   - Stateless server design for load balancing
   - Redis for session store clustering
   - CDN integration for static assets

3. **Real-Time Scaling**
   - WebSocket server clustering
   - Message queue integration (Redis Pub/Sub)
   - Client-side connection management

**Performance Targets:**
- Sub-100ms API response times
- <5s alert processing and analysis
- 99.9% uptime availability
- Support for 1000+ concurrent users
- Real-time updates <500ms latency

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   SESSION_SECRET=your_session_secret
   ```
4. Initialize database: `npm run db:push`
5. Seed sample data: `npx tsx server/seedData.ts`
6. Start development server: `npm run dev`

The application will be available at `http://localhost:5000` with the SOC dashboard accessible after authentication.