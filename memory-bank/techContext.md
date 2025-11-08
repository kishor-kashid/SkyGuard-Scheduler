# Technical Context: SkyGuard-Scheduler

## Technology Stack

### Frontend Technologies
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcrypt** - Password hashing
- **node-cron** - Scheduled job execution
- **Nodemailer** - Email sending
- **Zod** - Schema validation

### AI & External Services
- **Vercel AI SDK** - AI integration framework
- **OpenAI API** - AI model provider (GPT-4 or GPT-3.5-turbo)
- **OpenWeatherMap API** - Weather data provider

### Development Tools
- **Docker & Docker Compose** - Local PostgreSQL database
- **Git** - Version control
- **npm/yarn** - Package management

### Deployment & Infrastructure
- **AWS** - Cloud platform (primary target)
  - **RDS** - Managed PostgreSQL database
  - **EC2/Elastic Beanstalk** - Backend hosting
  - **S3 + CloudFront** - Frontend hosting
  - **CloudWatch** - Logging and monitoring
- **Alternative:** Azure or GCP (as specified in PRD)

## Development Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Docker Desktop** (for local PostgreSQL)
- **Git**
- **Code Editor** (VS Code recommended)

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flight_schedule_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV="development"

# Weather API
OPENWEATHER_API_KEY="your-api-key"

# AI
OPENAI_API_KEY="your-openai-key"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Demo Mode
DEMO_MODE=false
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000/api"
```

### Local Development Workflow

1. **Start Database:**
   ```bash
   docker-compose up -d
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Prisma Studio: `npx prisma studio`

## Project Structure

```
flight-schedule-pro/
├── .gitignore
├── .env.template
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── index.ts          # Entry point
│       ├── app.ts            # Express app setup
│       ├── config/          # Configuration
│       ├── middleware/       # Auth, validation, errors
│       ├── routes/          # API routes
│       ├── controllers/     # Route handlers
│       ├── services/        # Business logic
│       ├── utils/           # Utilities
│       ├── types/           # TypeScript types
│       └── jobs/            # Cron jobs
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env
    └── src/
        ├── main.tsx         # Entry point
        ├── App.tsx          # Root component with routing
        ├── components/      # React components
        │   ├── auth/        # Authentication components
        │   ├── common/      # Reusable UI components
        │   ├── flights/     # Flight-related components
        │   ├── layout/      # Layout components
        │   └── weather/     # Weather-related components
        ├── pages/           # Page components
        ├── hooks/           # Custom hooks
        ├── services/        # API clients
        ├── store/           # Zustand stores
        ├── types/           # TypeScript types
        ├── styles/          # CSS files
        └── utils/           # Utility functions
```

## Database Configuration

### PostgreSQL Setup
- **Local:** Docker Compose with volume persistence
- **Production:** AWS RDS PostgreSQL instance
- **Connection:** Prisma manages connections via DATABASE_URL

### Prisma Configuration
- **Schema Location:** `backend/prisma/schema.prisma`
- **Migrations:** `backend/prisma/migrations/`
- **Client Generation:** `npx prisma generate`
- **Studio:** `npx prisma studio` (database GUI)

## API Configuration

### Backend API Structure
- **Base URL:** `/api`
- **Routes:**
  - `/api/auth/*` - Authentication (login, register, getCurrentUser)
  - `/api/flights/*` - Flight management (CRUD, reschedule, weather check)
  - `/api/weather/*` - Weather operations (check, demo mode, scenarios, trigger-check)
  - `/api/notifications/*` - In-app notifications (get, mark read, delete, unread count)
  - `/api/students/*` - Student management (CRUD operations)
  - `/api/instructors/*` - Instructor management (CRUD operations, admin only)
  - `/api/aircraft/*` - Aircraft management (list, get by ID, admin only)
  - `/api/airports/*` - Airports management (list, admin only)
  - `/health` - Health check endpoint

### CORS Configuration
- **Development:** Allow `http://localhost:5173`
- **Production:** Allow production frontend URL
- **Credentials:** Include cookies/auth headers

## Build & Deployment

### Backend Build
```bash
cd backend
npm run build        # Compile TypeScript
npm start            # Run production server
```

### Frontend Build
```bash
cd frontend
npm run build        # Create production build
# Output: dist/ directory
```

### Docker (Optional)
- Backend Dockerfile for containerized deployment
- Frontend can be served via S3 + CloudFront (static hosting)

## Dependencies

### Critical Backend Dependencies
- `express` - Web framework
- `@prisma/client` - Database client (v6.19.0)
- `prisma` - Prisma CLI (v6.19.0)
- `jsonwebtoken` - JWT handling
- `bcrypt` - Password hashing
- `node-cron` - Scheduled jobs (for PR #8)
- `nodemailer` - Email sending (installed, not yet implemented)
- `ai` - Vercel AI SDK (v2.2.31)
- `@ai-sdk/openai` - OpenAI provider (v0.0.10)
- `zod` - Schema validation (v3.22.4)
- `axios` - HTTP client (for weather API)
- `tsx` - TypeScript execution (for dev and seed scripts)

### Critical Frontend Dependencies
- `react` & `react-dom` - React library
- `react-router-dom` - Routing
- `zustand` - State management
- `axios` - HTTP client
- `react-hot-toast` - Toast notifications
- `lucide-react` - Icon library
- `tailwindcss` - Utility-first CSS framework
- `@types/node` - TypeScript types for Node.js
- `autoprefixer` & `postcss` - CSS processing for Tailwind

## Technical Constraints

### API Rate Limits
- **OpenWeatherMap:** Free tier: 60 calls/minute, 1,000,000 calls/month
- **OpenAI:** Varies by plan, typically 3,500 requests/minute for GPT-4

### Database Constraints
- PostgreSQL connection limits (manage with connection pooling)
- Migration strategy must be reversible
- Seed data should be idempotent

### Frontend Constraints
- Must work in modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop and tablet
- No mobile app (web-only)

## Development Best Practices

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Shared types between frontend/backend where possible

### Code Organization
- Feature-based organization in services
- Single responsibility principle
- DRY (Don't Repeat Yourself)
- Consistent naming conventions

### Git Workflow
- Feature branches for each PR
- Descriptive commit messages
- PR-based development (20 PRs planned)

### Testing Approach
- Unit tests for business logic
- Integration tests for API endpoints
- Manual testing for UI flows
- Demo mode for predictable testing

## Security Considerations

### Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Token stored in memory (not localStorage for production)

### API Security
- CORS configuration
- Input validation on all endpoints
- SQL injection prevention (Prisma handles this)
- Rate limiting (consider for production)

### Environment Variables
- Never commit .env files
- Use .env.template for documentation
- Different secrets for dev/prod

## Monitoring & Logging

### Development
- Console logging for debugging
- Prisma query logging in development

### Production
- Structured logging (consider Winston or Pino)
- CloudWatch integration for AWS
- Error tracking (consider Sentry)

## Performance Targets

### API Response Times
- Weather check: < 2 seconds
- AI reschedule generation: < 5 seconds
- Flight list: < 500ms
- Authentication: < 200ms

### Frontend Performance
- Initial load: < 3 seconds
- Route transitions: < 200ms
- Component renders: < 100ms

## Known Technical Challenges

1. **Weather API Reliability** - ✅ Solved with demo mode
2. **AI Response Consistency** - ✅ Solved with Zod schemas
3. **Real-time Updates** - Polling vs WebSocket decision pending (currently using polling)
4. **Database Migrations** - Careful planning required for production
5. **Email Delivery** - SMTP configuration deferred (in-app notifications implemented)
6. **TypeScript Return Types** - Minor warning in getFlights controller (non-blocking)

## Future Technical Considerations

- WebSocket for real-time notifications
- Redis for caching weather data
- Queue system (Bull/BullMQ) for background jobs
- GraphQL API (if needed for complex queries)
- Microservices architecture (if scaling required)

