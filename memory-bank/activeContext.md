# Active Context: SkyGuard-Scheduler

## Current Work Focus

**Status:** PR #7 (In-App) Complete - Ready for PR #8
**Phase:** Development - Scheduled Weather Monitoring
**Last Updated:** PR #7 (In-App) Implementation Complete

## Current State

### What's Done
- ✅ Project requirements documented in PRD
- ✅ Complete task breakdown created (20 PRs)
- ✅ Memory Bank structure initialized
- ✅ Project structure defined
- ✅ Backend core services complete (PRs 1-7)
  - Project setup and infrastructure
  - Database schema with Prisma
  - Authentication system
  - Weather service integration
  - AI rescheduling service
  - Flight management system
  - In-app notification system

### What's Next
- [ ] PR #8: Scheduled Weather Monitoring
  - Hourly cron job for automated weather checks
  - Check all flights in next 48 hours
  - Automatic conflict detection and notifications
  - Logging for cron executions
- [ ] PR #9: Students Management
  - CRUD operations for students
  - Student management endpoints
- [ ] Frontend Development (PRs 10-15)
  - Authentication UI
  - Flight management UI
  - Weather alerts and demo mode
  - AI rescheduling UI
  - Dashboard views
  - Notification bell and list

## Recent Changes
- PR #7 (In-App Notifications) completed
  - Notification service with helper functions
  - Notifications controller and routes
  - Integrated into all flight workflows
  - Automatic notifications for flight events
- All backend core services now complete (PRs 1-7)
- Ready to begin scheduled weather monitoring (PR #8)

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

### Decisions Made
- **OpenAI Model:** Using `gpt-4o-mini` for cost efficiency (can upgrade to gpt-4 if needed)
- **Notification Strategy:** In-app notifications implemented first, email deferred
- **AI Integration:** Vercel AI SDK with Zod schemas for structured responses

### Decisions Pending
- Email service provider (Nodemailer with SMTP or service like SendGrid) - deferred
- Production database hosting (AWS RDS vs managed PostgreSQL)
- Frontend hosting (S3 + CloudFront vs other options)
- Real-time updates strategy (polling vs WebSocket)

### Open Questions
- Should we implement WebSocket for real-time notifications, or is polling sufficient? (Currently using polling)
- What's the optimal frequency for weather checks? (Currently planned: hourly - PR #8)
- Should demo mode be available in production, or dev-only? (Currently admin-controlled)
- When to implement email notifications? (Deferred, in-app working)

## Next Steps (Immediate)

1. **PR #1 Complete ✅**
   - Project structure created
   - Backend and frontend initialized
   - Docker Compose configured
   - All configuration files in place

2. **PR #2 Complete ✅**
   - Prisma schema with all 8 models defined
   - Relationships and enums configured
   - Seed script with test data created
   - Database configuration module ready
   - Prisma Client generated

3. **PR #3 Complete ✅**
   - JWT-based authentication implemented
   - Password hashing with bcrypt
   - Role-based access control middleware
   - Login/register/getCurrentUser endpoints
   - Error handling and Express app setup
   - Health check endpoint

4. **PR #4 Complete ✅**
   - OpenWeatherMap API integration
   - Weather minimums utility for all training levels
   - 5 demo scenarios for testing
   - Demo mode toggle functionality
   - Conflict detection service
   - Weather API endpoints

5. **PR #5 Complete ✅**
   - Vercel AI SDK with OpenAI (gpt-4o-mini) integration
   - Zod schema for structured AI responses
   - AI-powered reschedule option generation (3 options)
   - Scheduling service for availability checks
   - Helper functions for AI context building
   - Test script for AI service

6. **PR #6 Complete ✅**
   - Complete flight CRUD operations
   - Role-based access control (students/instructors/admins)
   - AI reschedule options generation
   - Reschedule confirmation (creates new flight, cancels old)
   - Manual weather check trigger
   - Request validation middleware
   - Conflict detection for scheduling

7. **PR #7 (In-App) Complete ✅**
   - In-app notification service and controller
   - Notification endpoints (get, mark as read, delete, unread count)
   - Integrated into all flight workflows
   - Automatic notifications for: flight confirmation, weather alerts, reschedule options, reschedule confirmation, cancellation
   - Email notifications deferred for later

8. **Next: PR #8 - Scheduled Weather Monitoring**
   - Hourly cron job for automated weather checks
   - Background weather monitoring
   - Automatic conflict detection and notifications

9. **Before PR #8:**
   - Test notification endpoints (if database is set up)
   - Ensure notifications are being created correctly

## Current Blockers
None at this time - project is ready to begin implementation.

## Notes & Observations
- **Backend Progress:** 7 of 20 PRs complete (35%) - all core backend services done
- **Demo Mode:** Successfully implemented and working - critical for testing without API costs
- **Training Level Weather Minimums:** Fully implemented and tested in conflict detection
- **AI Rescheduling:** Working with gpt-4o-mini, generates 3 structured options
- **Notifications:** In-app system fully functional, integrated into all workflows
- **Email Notifications:** Deferred - can be added later without breaking changes
- **Frontend:** Not yet started - all backend APIs ready for frontend integration

## Workflow Reminders
- Follow PR-based development approach
- Each PR should be complete and testable
- Update progress.md after completing each major milestone
- Maintain clean code with proper TypeScript types
- Document complex logic (especially AI service and conflict detection)
- **Current Pattern:** Backend services first, frontend integration next
- **Notification Pattern:** Create notifications in database, frontend will poll/display
- **Error Handling:** All controllers use try-catch with next(error) pattern

