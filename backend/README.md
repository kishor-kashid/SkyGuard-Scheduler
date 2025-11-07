# SkyGuard-Scheduler Backend

Backend API for SkyGuard-Scheduler, an intelligent flight scheduling system with automated weather monitoring and AI-powered rescheduling.

## 🏗️ Architecture

The backend follows a layered architecture pattern:

```
Controllers → Services → Prisma (Database)
     ↓           ↓
Middleware  ← → Jobs (Cron)
```

### Key Components

- **Controllers** - Handle HTTP requests and responses
- **Services** - Business logic and external API integration
- **Middleware** - Authentication, authorization, validation, error handling
- **Jobs** - Scheduled background tasks (weather monitoring)
- **Utils** - Helper functions and utilities

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed data script
│   └── migrations/        # Database migrations
├── src/
│   ├── config/
│   │   └── env.ts         # Environment configuration
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication
│   │   ├── errorHandler.ts
│   │   └── validation.ts  # Request validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── flights.routes.ts
│   │   ├── students.routes.ts
│   │   ├── notifications.routes.ts
│   │   └── weather.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── flights.controller.ts
│   │   ├── students.controller.ts
│   │   ├── notifications.controller.ts
│   │   └── weather.controller.ts
│   ├── services/
│   │   ├── authService.ts           # JWT & password hashing
│   │   ├── weatherService.ts        # OpenWeatherMap integration
│   │   ├── aiService.ts             # OpenAI integration
│   │   ├── conflictDetectionService.ts
│   │   ├── schedulingService.ts     # Availability checking
│   │   └── notificationService.ts   # In-app notifications
│   ├── jobs/
│   │   └── weatherCheckCron.ts      # Hourly weather monitoring
│   ├── utils/
│   │   ├── logger.ts                # Logging utility
│   │   ├── weatherMinimums.ts       # Training level minimums
│   │   └── demoScenarios.ts         # Demo mode scenarios
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── app.ts                       # Express app setup
│   └── index.ts                     # Server entry point
└── package.json
```

## 🗄️ Database Schema

### Models

1. **User** - Authentication and role management
   - Roles: `STUDENT`, `INSTRUCTOR`, `ADMIN`

2. **Student** - Student profile with training level
   - Training Levels: `STUDENT_PILOT`, `PRIVATE_PILOT`, `INSTRUMENT_RATED`

3. **Instructor** - Instructor profile and certifications

4. **Aircraft** - Aircraft registry

5. **FlightBooking** - Flight scheduling
   - Status: `CONFIRMED`, `WEATHER_HOLD`, `CANCELLED`, `COMPLETED`

6. **WeatherCheck** - Weather monitoring records

7. **RescheduleEvent** - AI rescheduling history

8. **Notification** - In-app notifications

### Relationships

- User 1:1 Student/Instructor
- FlightBooking N:1 Student, Instructor, Aircraft
- WeatherCheck N:1 FlightBooking
- RescheduleEvent N:1 Original/New FlightBooking
- Notification N:1 User

## 🔐 Authentication

### JWT-Based Authentication

All protected routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Roles & Permissions

- **STUDENT**: Access own flights, request reschedules
- **INSTRUCTOR**: View assigned flights, manage schedule
- **ADMIN**: Full access, demo mode controls, system management

## 🌐 API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/register`
Register a new user

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT",
  "trainingLevel": "STUDENT_PILOT",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@example.com",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST `/api/auth/login`
Login existing user

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "student@example.com",
      "role": "STUDENT",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### GET `/api/auth/me`
Get current user (requires authentication)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@example.com",
    "role": "STUDENT",
    "name": "John Doe"
  }
}
```

### Flights (`/api/flights`)

#### GET `/api/flights`
Get all flights (filtered by user role)

**Query Parameters:**
- `status`: Filter by flight status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "scheduledDate": "2024-03-20T10:00:00Z",
      "duration": 120,
      "status": "CONFIRMED",
      "student": { "id": 1, "name": "John Doe" },
      "instructor": { "id": 1, "name": "Jane Smith" },
      "aircraft": { "id": 1, "registration": "N12345" }
    }
  ]
}
```

#### POST `/api/flights`
Create new flight (Instructors and Admins only)

**Request:**
```json
{
  "studentId": 1,
  "instructorId": 1,
  "aircraftId": 1,
  "scheduledDate": "2024-03-20T10:00:00Z",
  "duration": 120,
  "flightType": "LOCAL",
  "departureLocation": {
    "name": "KJFK",
    "lat": 40.6413,
    "lon": -73.7781
  }
}
```

#### GET `/api/flights/:id`
Get single flight by ID

#### PUT `/api/flights/:id`
Update flight

#### DELETE `/api/flights/:id`
Cancel flight

#### POST `/api/flights/:id/reschedule-options`
Generate AI reschedule options (Students only, for their own flights)

**Response:**
```json
{
  "success": true,
  "data": {
    "flightId": 1,
    "currentScheduledDate": "2024-03-20T10:00:00Z",
    "reason": "Weather conditions unsafe",
    "options": [
      {
        "priority": 1,
        "suggestedDate": "2024-03-21T10:00:00Z",
        "reasoning": "Next available clear weather window...",
        "weatherForecast": "Clear skies, visibility 10 mi",
        "confidence": 0.95
      }
    ]
  }
}
```

#### POST `/api/flights/:id/confirm-reschedule`
Confirm reschedule option (Students only)

**Request:**
```json
{
  "newScheduledDate": "2024-03-21T10:00:00Z",
  "aiReasoning": "Next available clear weather window..."
}
```

### Weather (`/api/weather`)

#### GET `/api/weather/demo-scenarios`
Get available demo scenarios

**Response:**
```json
{
  "success": true,
  "data": {
    "demoModeEnabled": true,
    "scenarios": [
      {
        "id": "clear-skies",
        "name": "Clear Skies",
        "description": "Perfect flying weather",
        "affectsTrainingLevels": []
      }
    ]
  }
}
```

#### POST `/api/weather/toggle-demo`
Toggle demo mode (Admin only)

#### POST `/api/weather/trigger-check`
Manually trigger weather check (Admin only)

### Students (`/api/students`)

#### GET `/api/students`
Get all students (Instructors and Admins)

#### POST `/api/students`
Create new student (Admins only)

#### GET `/api/students/:id`
Get single student

#### PUT `/api/students/:id`
Update student

#### DELETE `/api/students/:id`
Delete student (Admins only)

### Notifications (`/api/notifications`)

#### GET `/api/notifications`
Get user's notifications

#### GET `/api/notifications/unread-count`
Get unread notification count

#### PUT `/api/notifications/:id/read`
Mark notification as read

#### PUT `/api/notifications/read-all`
Mark all notifications as read

#### DELETE `/api/notifications/:id`
Delete notification

## 🤖 Services

### Weather Service
- Integrates with OpenWeatherMap API
- Supports demo mode with 5 pre-built scenarios
- Converts weather data to standard format

### AI Service
- Uses OpenAI GPT-4o-mini for reschedule suggestions
- Generates 3 prioritized options
- Considers: weather forecast, availability, student training level

### Conflict Detection Service
- Evaluates flights against weather minimums
- Training-level-aware checks
- Returns safety status and violations

### Scheduling Service
- Checks instructor availability
- Checks aircraft availability
- Generates available time slots

### Notification Service
- Creates in-app notifications
- Event-driven architecture
- Supports multiple notification types:
  - `FLIGHT_CONFIRMED`
  - `FLIGHT_CANCELLED`
  - `WEATHER_ALERT`
  - `RESCHEDULE_AVAILABLE`
  - `RESCHEDULE_CONFIRMED`

## ⏰ Scheduled Jobs

### Weather Check Cron Job
- Runs hourly (configurable)
- Checks all flights scheduled in next 48 hours
- Automatically detects conflicts
- Updates flight status to `WEATHER_HOLD`
- Sends notifications to affected users

**Manual Trigger:**
```bash
# Via API (Admin only)
POST /api/weather/trigger-check
```

## 🌤️ Weather Minimums

### Student Pilot
- Visibility: > 5 miles
- Ceiling: Clear skies (no ceiling or > 10000 ft)
- Wind Speed: < 10 knots
- No precipitation, thunderstorms, or icing

### Private Pilot
- Visibility: > 3 miles
- Ceiling: > 1000 feet
- Wind Speed: < 15 knots
- No thunderstorms or icing

### Instrument Rated
- Wind Speed: < 25 knots
- No thunderstorms or icing
- Can fly in IMC conditions

## 🧪 Demo Mode

Demo mode allows testing without consuming API credits:

1. Enable via admin dashboard
2. Select a weather scenario
3. Trigger manual weather check
4. System applies scenario to all flights in next 48 hours

**Demo Scenarios:**
- Clear Skies
- Student Conflict
- Private Conflict
- Instrument Conflict
- Marginal

## 🛠️ Development

### Running the Backend

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Run specific test file
npm test -- weatherMinimums.test.ts
```

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

### Environment Variables

See `.env.template` for all required variables:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `OPENAI_API_KEY` - OpenAI API key

**Optional:**
- `PORT` - Server port (default: 3000)
- `JWT_EXPIRES_IN` - Token expiration (default: 24h)
- `SMTP_*` - Email configuration (deferred feature)

## 🔍 Error Handling

All errors are handled by centralized middleware:

```typescript
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

Tests are written with Jest and cover:
- Unit tests for utilities and services
- Integration tests for controllers
- Database mocking with Prisma

Run tests:
```bash
npm test
```

See `src/tests/README.md` for more details.

## 📦 Dependencies

### Core
- `express` - Web framework
- `@prisma/client` - Database ORM
- `typescript` - Type safety

### Authentication
- `jsonwebtoken` - JWT tokens
- `bcrypt` - Password hashing

### External Services
- `axios` - HTTP client
- `ai` - Vercel AI SDK
- `@ai-sdk/openai` - OpenAI integration

### Scheduled Jobs
- `node-cron` - Cron job scheduler

### Development
- `tsx` - TypeScript execution
- `jest` - Testing framework
- `ts-jest` - Jest TypeScript support

## 📄 License

[Add license information]

