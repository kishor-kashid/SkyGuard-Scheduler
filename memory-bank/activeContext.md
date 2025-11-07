# Active Context: SkyGuard-Scheduler

## Current Work Focus

**Status:** PR #1 Complete - Ready for PR #2
**Phase:** Development - Database Setup
**Last Updated:** PR #1 Implementation Complete

## Current State

### What's Done
- ✅ Project requirements documented in PRD
- ✅ Complete task breakdown created (20 PRs)
- ✅ Memory Bank structure initialized
- ✅ Project structure defined

### What's Next
- [ ] PR #1: Project Setup & Infrastructure
  - Initialize GitHub repository
  - Setup backend and frontend project structures
  - Configure Docker Compose for PostgreSQL
  - Create initial README and configuration files

## Recent Changes
- Memory Bank initialized with all core documentation files
- Project context established from PRD and tasklist

## Active Decisions & Considerations

### Technical Decisions Made
1. **Tech Stack Confirmed:**
   - Frontend: React + TypeScript + Vite + Tailwind CSS
   - Backend: Node.js + Express + TypeScript
   - Database: PostgreSQL with Prisma ORM
   - AI: Vercel AI SDK with OpenAI
   - Cloud: AWS (deployment target)
   - Weather API: OpenWeatherMap

2. **Project Structure:**
   - Monorepo approach (backend/ and frontend/ directories)
   - Docker Compose for local PostgreSQL
   - Separate .env files for backend and frontend

3. **Authentication:**
   - JWT-based authentication
   - Role-based access control (Student, Instructor, Admin)
   - Single login system with role-based routing

### Decisions Pending
- Specific OpenAI model to use (likely GPT-4 or GPT-3.5-turbo)
- Email service provider (Nodemailer with SMTP or service like SendGrid)
- Production database hosting (AWS RDS vs managed PostgreSQL)
- Frontend hosting (S3 + CloudFront vs other options)

### Open Questions
- Should we implement WebSocket for real-time notifications, or is polling sufficient?
- What's the optimal frequency for weather checks? (Currently planned: hourly)
- Should demo mode be available in production, or dev-only?

## Next Steps (Immediate)

1. **PR #1 Complete ✅**
   - Project structure created
   - Backend and frontend initialized
   - Docker Compose configured
   - All configuration files in place

2. **Begin PR #2: Database Schema & Prisma Setup**
   - Initialize Prisma
   - Define all database models (User, Student, Instructor, FlightBooking, WeatherCheck, RescheduleEvent, Notification)
   - Create initial migration
   - Setup seed script with test data

3. **Install Dependencies:**
   - Run `npm install` in backend directory
   - Run `npm install` in frontend directory
   - Start Docker Compose for PostgreSQL

## Current Blockers
None at this time - project is ready to begin implementation.

## Notes & Observations
- The tasklist is very comprehensive with 20 PRs covering all aspects
- Demo mode is a key feature for testing and demonstration
- Training level weather minimums are critical for safety logic
- AI rescheduling must consider multiple factors simultaneously

## Workflow Reminders
- Follow PR-based development approach
- Each PR should be complete and testable
- Update progress.md after completing each major milestone
- Maintain clean code with proper TypeScript types
- Document complex logic (especially AI service and conflict detection)

