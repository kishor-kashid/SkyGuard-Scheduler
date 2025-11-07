# System Patterns: SkyGuard-Scheduler

## Architecture Overview

### High-Level Architecture
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │──────│   Express    │──────│ PostgreSQL  │
│  Frontend   │      │    API       │      │  Database   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├──────► OpenWeatherMap API
                            │
                            ├──────► OpenAI (via Vercel AI SDK)
                            │
                            └──────► Email Service (Nodemailer)
```

### System Layers

#### Frontend Layer
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand (lightweight, simple)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with consistent design system
- **HTTP Client:** Axios with interceptors for auth

#### Backend Layer
- **Framework:** Express.js with TypeScript
- **ORM:** Prisma (type-safe database access)
- **Authentication:** JWT tokens with bcrypt password hashing
- **Validation:** Custom middleware for request validation
- **Error Handling:** Centralized error handler middleware
- **Scheduling:** node-cron for hourly weather checks

#### Data Layer
- **Database:** PostgreSQL (via Docker locally, RDS in production)
- **Migrations:** Prisma migrations
- **Seeding:** Prisma seed script for test data

#### External Services
- **Weather:** OpenWeatherMap API
- **AI:** Vercel AI SDK with OpenAI
- **Email:** Nodemailer (SMTP)

## Key Design Patterns

### 1. Service Layer Pattern
**Purpose:** Separate business logic from controllers
**Location:** `backend/src/services/`

**Services:**
- `authService.ts` - Authentication and authorization logic
- `weatherService.ts` - Weather API integration and data fetching
- `conflictDetectionService.ts` - Weather conflict evaluation logic
- `aiService.ts` - AI-powered rescheduling generation
- `notificationService.ts` - Email and in-app notification handling
- `schedulingService.ts` - Availability checking and slot management

**Pattern:**
```typescript
// Service contains business logic
export class WeatherService {
  async getWeather(location: Location): Promise<WeatherData> { }
  async checkFlightSafety(flight: Flight, weather: WeatherData): Promise<SafetyResult> { }
}

// Controller uses service
export const checkWeather = async (req, res) => {
  const weather = await weatherService.getWeather(location);
  res.json(weather);
}
```

### 2. Repository Pattern (via Prisma)
**Purpose:** Abstract database access
**Implementation:** Prisma Client provides type-safe database access

**Usage:**
```typescript
// Direct Prisma usage in services
const flight = await prisma.flightBooking.findUnique({
  where: { id: flightId },
  include: { student: true, instructor: true }
});
```

### 3. Middleware Pattern
**Purpose:** Cross-cutting concerns (auth, validation, error handling)
**Location:** `backend/src/middleware/`

**Middleware Stack:**
1. CORS middleware
2. Body parser
3. Authentication middleware (JWT verification)
4. Authorization middleware (role checking)
5. Request validation middleware
6. Route handlers
7. Error handler middleware (catch-all)

### 4. Event-Driven Notification Pattern
**Purpose:** Decouple notification sending from business logic
**Implementation:** Service methods trigger notifications after state changes

**Flow:**
```
Conflict Detected → Update Flight Status → Trigger Notification Service
                                                      ↓
                                    Send Email + Create In-App Notification
```

### 5. AI Integration Pattern
**Purpose:** Structured AI responses with validation
**Implementation:** Vercel AI SDK with Zod schemas

**Pattern:**
```typescript
// Define schema for AI response
const rescheduleOptionsSchema = z.object({
  options: z.array(z.object({
    dateTime: z.string(),
    reasoning: z.string(),
    weatherForecast: z.string()
  }))
});

// Use with AI SDK
const result = await generateObject({
  model: openai('gpt-4'),
  schema: rescheduleOptionsSchema,
  prompt: buildPrompt(context)
});
```

### 6. Demo Mode Pattern
**Purpose:** Test system without external API dependencies
**Implementation:** Service layer checks demo mode flag

**Pattern:**
```typescript
if (DEMO_MODE) {
  return getDemoScenario(scenarioId);
} else {
  return await fetchFromOpenWeather(location);
}
```

## Component Relationships

### Backend Component Flow
```
Routes → Controllers → Services → Database (Prisma)
                ↓
         External APIs (Weather, AI)
                ↓
         Notification Service
```

### Frontend Component Hierarchy
```
App
├── Layout
│   ├── Navbar (with NotificationBell)
│   └── Sidebar
├── ProtectedRoute
│   └── Dashboard (role-based)
│       ├── StudentDashboard
│       ├── InstructorDashboard
│       └── AdminDashboard
├── Flights Page
│   ├── FlightList
│   │   └── FlightCard
│   └── CreateFlightForm
└── Weather Components
    ├── WeatherAlertList
    │   └── WeatherAlertCard
    └── DemoModeToggle
```

## Data Flow Patterns

### Weather Check Flow
```
Cron Job (hourly)
  → Get Upcoming Flights
  → For Each Flight:
      → Fetch Weather (departure, destination, corridor)
      → Get Student Training Level
      → Evaluate Against Minimums
      → If Conflict:
          → Update Flight Status
          → Send Notifications
          → Generate Reschedule Options (on-demand)
```

### Reschedule Flow
```
User Requests Reschedule
  → AI Service Analyzes:
      → Student Availability
      → Instructor Availability
      → Aircraft Availability
      → Weather Forecasts
  → Generate 3 Options
  → User Selects Option
  → Create New Booking
  → Cancel Original Booking
  → Send Confirmations
  → Log Reschedule Event
```

## Key Technical Decisions

### 1. Monorepo Structure
**Decision:** Single repository with backend/ and frontend/ directories
**Rationale:** Easier dependency management, shared types, simpler deployment coordination

### 2. Prisma ORM
**Decision:** Use Prisma instead of raw SQL or TypeORM
**Rationale:** Type safety, excellent migration system, great developer experience

### 3. Zustand for State Management
**Decision:** Zustand instead of Redux or Context API
**Rationale:** Lightweight, simple API, no boilerplate, sufficient for this project's needs

### 4. Vercel AI SDK
**Decision:** Vercel AI SDK instead of direct OpenAI SDK
**Rationale:** Better structured outputs with Zod, easier prompt management, future-proof for multi-provider support

### 5. Demo Mode
**Decision:** Built-in demo mode with pre-defined scenarios
**Rationale:** Enables testing and demos without API costs, predictable test scenarios

## Database Schema Patterns

### Entity Relationships
```
User (1) ──< (1) Student
User (1) ──< (1) Instructor

Student (1) ──< (*) FlightBooking
Instructor (1) ──< (*) FlightBooking
Aircraft (1) ──< (*) FlightBooking

FlightBooking (1) ──< (*) WeatherCheck
FlightBooking (1) ──< (*) Notification
FlightBooking (1) ──< (1) RescheduleEvent (original)
FlightBooking (1) ──< (1) RescheduleEvent (new)
```

### Key Design Principles
- Normalized schema to avoid data duplication
- Timestamps on all entities for auditing
- Soft deletes where appropriate (status fields instead of hard deletes)
- Foreign key constraints for data integrity

## Security Patterns

### Authentication Flow
1. User submits credentials
2. Backend validates and hashes password comparison
3. Generate JWT token with user ID and role
4. Return token to frontend
5. Frontend stores token and includes in Authorization header
6. Middleware verifies token on protected routes

### Authorization Pattern
```typescript
// Role-based route protection
router.get('/flights', 
  authenticateToken,
  authorizeRoles(['admin', 'instructor']),
  getFlights
);

// Resource-level authorization in controllers
if (user.role !== 'admin' && flight.studentId !== user.id) {
  throw new ForbiddenError();
}
```

## Error Handling Pattern

### Backend Error Handling
```typescript
// Custom error classes
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Centralized error handler
app.use((err, req, res, next) => {
  // Log error
  // Format response
  // Return appropriate status code
});
```

### Frontend Error Handling
- Try-catch in service calls
- Error boundaries for React components
- Toast notifications for user-facing errors
- Graceful degradation for API failures

## Testing Strategy

### Backend Testing
- Unit tests for services (especially conflict detection and AI logic)
- Integration tests for API endpoints
- Test demo scenarios thoroughly

### Frontend Testing
- Component tests for critical UI elements
- Integration tests for user flows
- E2E tests for complete workflows (optional)

## Performance Considerations

### Optimization Strategies
- Database indexes on frequently queried fields (scheduledDate, status)
- Caching weather data for short periods (avoid duplicate API calls)
- Pagination for flight lists
- Lazy loading for dashboard components
- Efficient cron job (batch process multiple flights)

### Scalability Considerations
- Weather checks can be parallelized
- Database connection pooling
- Consider queue system (Bull/BullMQ) for high-volume notifications
- CDN for frontend assets in production

