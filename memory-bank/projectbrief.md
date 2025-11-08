# Project Brief: SkyGuard-Scheduler

## Project Identity
- **Project Name:** SkyGuard-Scheduler (Flight Schedule Pro)
- **Organization:** Flight Schedule Pro
- **Category:** AI Solution
- **Estimated Timeline:** 3-5 days
- **Status:** ✅ COMPLETE - Production Ready (All Core Features Implemented: 28 PRs completed, 2 future enhancement PRs documented)

## Core Mission
Build an intelligent, automated system that monitors weather conditions for scheduled flight lessons, detects conflicts based on student training levels, and uses AI to suggest optimal rescheduling options. The system must provide real-time notifications and maintain a comprehensive dashboard for all stakeholders.

## Primary Goals

### Functional Objectives
1. **Automate Weather Monitoring** - Continuous hourly checks of weather at departure, destination, and flight corridor locations
2. **Intelligent Conflict Detection** - Apply training-level-specific weather minimums to determine flight safety
3. **Real-Time Notifications** - Multi-channel alerts (email + in-app) to students and instructors
4. **AI-Powered Rescheduling** - Generate 3 optimal reschedule options considering multiple factors
5. **Comprehensive Tracking** - Log all bookings, cancellations, and reschedules for analytics
6. **Dashboard Visualization** - Real-time display of alerts, flight statuses, and metrics

### Technical Objectives
- Build event-driven notification and scheduling system
- Integrate real-time weather data APIs (OpenWeatherMap)
- Implement AI reasoning using Vercel AI SDK with OpenAI
- Design normalized database schemas for flight scheduling
- Create role-based access control (Student, Instructor, Admin)

## Success Criteria

The project is successful when:
- ✅ Weather conflicts are automatically and accurately detected
- ✅ Notifications are successfully sent to all affected parties
- ✅ AI generates at least 3 valid reschedule options
- ✅ Database accurately updates bookings and logs all actions
- ✅ Dashboard displays live weather alerts and flight statuses
- ✅ AI logic correctly applies training-level-specific weather minimums

## Key Constraints
- Must support demo mode with 5 pre-built weather scenarios for testing
- Must handle three training levels with different weather minimums
- Must provide role-based dashboards (Student/Instructor/Admin)
- Must be deployable to AWS (or Azure/GCP)
- Must include comprehensive documentation and demo video

## Deliverables
1. **GitHub Repository** - Clean, well-documented codebase
2. **README** - Complete setup and usage instructions
3. **.env.template** - Environment variable documentation
4. **Demo Video** - 5-10 minute walkthrough of core features
5. **Production Deployment** - Working system on AWS

## Project Scope Boundaries

### In Scope
- Weather monitoring and conflict detection
- AI-powered rescheduling suggestions
- Email and in-app notifications
- Role-based dashboards
- Flight booking management
- Demo mode for testing

### Out of Scope (Bonus Features)
- SMS notifications
- Google Calendar integration
- Predictive cancellation model (ML)
- Mobile app with push notifications

### ✅ Completed Features
- **Feature 3: AI Weather Briefings** (PRs 27-28) - ✅ COMPLETED
  - Natural language briefings personalized by training level
  - Risk assessment and recommendations
  - Historical weather comparisons
  - Briefing caching with cache invalidation
  - Integrated into Flight Details page

### 🚀 Future Implementation (from new_features_tasklist.md)
The following features are documented for future releases:

- **Feature 2: Advanced Scheduling** (PRs 24-26) - Future Enhancement
  - Recurring bookings, bulk creation, templates, availability calendars
  
- **Feature 4: Smart Conflict Resolution** (PRs 29-30) - Future Enhancement
  - AI-powered automatic conflict detection and resolution
  - Batch conflict resolution
  - Auto-resolve preview and application

## Project Structure
The project follows a monorepo structure:
- `backend/` - Node.js/Express API with Prisma ORM
- `frontend/` - React/TypeScript application with Vite
- `memory-bank/` - Project documentation and context
- Root level - Docker, configuration, and documentation files

