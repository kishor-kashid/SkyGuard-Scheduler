# Flight Schedule Pro - Complete Task List

## Project Overview
- **Organization:** Flight Schedule Pro
- **Category:** AI Solution
- **Tech Stack:** React (TypeScript), Node.js (TypeScript), Vercel AI SDK with OpenAI, AWS, PostgreSQL (Docker), OpenWeatherMap API

---

## Project File Structure

```
flight-schedule-pro/
├── README.md
├── .gitignore
├── docker-compose.yml
├── .env.template
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── flights.routes.ts
│   │   │   ├── students.routes.ts
│   │   │   ├── weather.routes.ts
│   │   │   └── notifications.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── flights.controller.ts
│   │   │   ├── students.controller.ts
│   │   │   └── weather.controller.ts
│   │   ├── services/
│   │   │   ├── aiService.ts
│   │   │   ├── weatherService.ts
│   │   │   ├── conflictDetectionService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── schedulingService.ts
│   │   │   └── authService.ts
│   │   ├── utils/
│   │   │   ├── weatherMinimums.ts
│   │   │   ├── demoScenarios.ts
│   │   │   └── logger.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── jobs/
│   │       └── weatherCheckCron.ts
│   └── tests/
│       ├── services/
│       └── routes/
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── .env
    ├── public/
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── vite-env.d.ts
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Button.tsx
    │   │   │   ├── Card.tsx
    │   │   │   ├── Input.tsx
    │   │   │   ├── Select.tsx
    │   │   │   ├── Modal.tsx
    │   │   │   └── Toast.tsx
    │   │   ├── layout/
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── Layout.tsx
    │   │   ├── auth/
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── ProtectedRoute.tsx
    │   │   ├── flights/
    │   │   │   ├── FlightCard.tsx
    │   │   │   ├── FlightList.tsx
    │   │   │   ├── CreateFlightForm.tsx
    │   │   │   └── FlightDetails.tsx
    │   │   ├── weather/
    │   │   │   ├── WeatherAlertCard.tsx
    │   │   │   ├── WeatherAlertList.tsx
    │   │   │   ├── DemoModeToggle.tsx
    │   │   │   └── WeatherScenarioSelector.tsx
    │   │   ├── reschedule/
    │   │   │   ├── RescheduleOptionsModal.tsx
    │   │   │   └── RescheduleOptionCard.tsx
    │   │   ├── dashboard/
    │   │   │   ├── StudentDashboard.tsx
    │   │   │   ├── InstructorDashboard.tsx
    │   │   │   ├── AdminDashboard.tsx
    │   │   │   └── MetricsCard.tsx
    │   │   └── notifications/
    │   │       ├── NotificationBell.tsx
    │   │       └── NotificationList.tsx
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Flights.tsx
    │   │   └── NotFound.tsx
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   ├── useFlights.ts
    │   │   ├── useWeather.ts
    │   │   └── useNotifications.ts
    │   ├── services/
    │   │   ├── api.ts
    │   │   ├── auth.service.ts
    │   │   ├── flights.service.ts
    │   │   └── weather.service.ts
    │   ├── store/
    │   │   ├── authStore.ts
    │   │   ├── flightsStore.ts
    │   │   └── notificationsStore.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── utils/
    │   │   ├── dateFormatter.ts
    │   │   └── constants.ts
    │   └── styles/
    │       └── index.css
    └── tests/
        └── components/
```

---

## PR-Based Task Breakdown

---

## PR #1: Project Setup & Infrastructure
**Goal:** Initialize project structure, Docker, and basic configuration  

### Subtasks:
- [ ] **1.1** Create GitHub repository `SkyGuard-Scheduler`
  - Files: `README.md`, `.gitignore`
  
- [ ] **1.2** Initialize backend structure
  - Files: `backend/package.json`, `backend/tsconfig.json`, `backend/.env`
  - Install dependencies: `express`, `typescript`, `@types/node`, `@types/express`, `dotenv`, `cors`, `prisma`, `@prisma/client`
  
- [ ] **1.3** Initialize frontend structure
  - Files: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`
  - Install dependencies: `react`, `react-dom`, `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`
  
- [ ] **1.4** Setup Docker Compose for PostgreSQL
  - Files: `docker-compose.yml`, `.env.template`
  - Configure PostgreSQL container with volume persistence
  
- [ ] **1.5** Create initial README with project overview
  - Files: `README.md`
  - Include setup instructions, tech stack, project structure

**Files Created:**
```
/README.md
/.gitignore
/docker-compose.yml
/.env.template
/backend/package.json
/backend/tsconfig.json
/backend/.env
/frontend/package.json
/frontend/tsconfig.json
/frontend/vite.config.ts
```

---

## PR #2: Database Schema & Prisma Setup
**Goal:** Define database schema and setup Prisma ORM  

### Subtasks:
- [ ] **2.1** Initialize Prisma
  - Files: `backend/prisma/schema.prisma`
  - Command: `npx prisma init`
  
- [ ] **2.2** Define User model
  - Files: `backend/prisma/schema.prisma`
  - Fields: id, email, password_hash, role, created_at
  
- [ ] **2.3** Define Student model
  - Files: `backend/prisma/schema.prisma`
  - Fields: id, user_id, name, phone, training_level, availability
  
- [ ] **2.4** Define Instructor model
  - Files: `backend/prisma/schema.prisma`
  - Fields: id, user_id, name, phone, certifications
  
- [ ] **2.5** Define FlightBooking model
  - Files: `backend/prisma/schema.prisma`
  - Fields: id, student_id, instructor_id, aircraft_id, scheduled_date, departure_location, destination_location, status, flight_type, notes
  
- [ ] **2.6** Define WeatherCheck model
  - Files: `backend/prisma/schema.prisma`
  - Fields: id, booking_id, check_timestamp, weather_data, is_safe, reason
  
- [ ] **2.7** Define RescheduleEvent model
  - Files: `backend/prisma/schema.prisma`
  - Fields: id, original_booking_id, new_booking_id, suggested_options, selected_option, status, created_at, confirmed_at
  
- [ ] **2.8** Define Notification model
  - Files: `backend/prisma/schema.prisma`
  - Fields: id, user_id, booking_id, type, message, sent_at, read_at
  
- [ ] **2.9** Run initial migration
  - Command: `npx prisma migrate dev --name init`
  
- [ ] **2.10** Create seed script with test data
  - Files: `backend/prisma/seed.ts`
  - Create 3 students (different training levels), 2 instructors, 5 flights

**Files Created/Modified:**
```
/backend/prisma/schema.prisma
/backend/prisma/seed.ts
/backend/prisma/migrations/
```

---

## PR #3: Authentication System
**Goal:** Implement JWT-based authentication with role-based access  

### Subtasks:
- [ ] **3.1** Install auth dependencies
  - Packages: `bcrypt`, `jsonwebtoken`, `@types/bcrypt`, `@types/jsonwebtoken`
  
- [ ] **3.2** Create auth service
  - Files: `backend/src/services/authService.ts`
  - Functions: `hashPassword()`, `comparePassword()`, `generateToken()`, `verifyToken()`
  
- [ ] **3.3** Create auth controller
  - Files: `backend/src/controllers/auth.controller.ts`
  - Endpoints: `login()`, `register()`, `getCurrentUser()`
  
- [ ] **3.4** Create auth middleware
  - Files: `backend/src/middleware/auth.ts`
  - Functions: `authenticateToken()`, `authorizeRoles()`
  
- [ ] **3.5** Create auth routes
  - Files: `backend/src/routes/auth.routes.ts`
  - Routes: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
  
- [ ] **3.6** Create TypeScript types for auth
  - Files: `backend/src/types/index.ts`
  - Types: `User`, `LoginRequest`, `JWTPayload`
  
- [ ] **3.7** Setup error handler middleware
  - Files: `backend/src/middleware/errorHandler.ts`
  
- [ ] **3.8** Create main Express app
  - Files: `backend/src/app.ts`, `backend/src/index.ts`
  - Configure CORS, body parser, routes, error handling

**Files Created/Modified:**
```
/backend/src/services/authService.ts
/backend/src/controllers/auth.controller.ts
/backend/src/middleware/auth.ts
/backend/src/middleware/errorHandler.ts
/backend/src/routes/auth.routes.ts
/backend/src/types/index.ts
/backend/src/app.ts
/backend/src/index.ts
```

---

## PR #4: Weather Service Integration
**Goal:** Integrate OpenWeatherMap API and create weather checking logic  

### Subtasks:
- [ ] **4.1** Create weather service
  - Files: `backend/src/services/weatherService.ts`
  - Functions: `getWeather()`, `getWeatherForecast()`, `fetchFromOpenWeather()`
  
- [ ] **4.2** Create weather minimums utility
  - Files: `backend/src/utils/weatherMinimums.ts`
  - Define minimums for each training level (student, private, instrument)
  
- [ ] **4.3** Create demo scenarios
  - Files: `backend/src/utils/demoScenarios.ts`
  - Define 5 pre-built weather scenarios (clear skies, student conflict, private conflict, instrument conflict, marginal)
  
- [ ] **4.4** Add demo mode toggle to weather service
  - Files: `backend/src/services/weatherService.ts`
  - Support switching between real API and demo scenarios
  
- [ ] **4.5** Create conflict detection service
  - Files: `backend/src/services/conflictDetectionService.ts`
  - Functions: `checkFlightSafety()`, `evaluateWeatherAgainstMinimums()`
  
- [ ] **4.6** Create weather controller
  - Files: `backend/src/controllers/weather.controller.ts`
  - Endpoints: `checkWeather()`, `getDemoScenarios()`, `setDemoMode()`
  
- [ ] **4.7** Create weather routes
  - Files: `backend/src/routes/weather.routes.ts`
  - Routes: `POST /api/weather/check`, `GET /api/weather/scenarios`, `POST /api/weather/demo-mode`
  
- [ ] **4.8** Add weather types
  - Files: `backend/src/types/index.ts`
  - Types: `WeatherData`, `WeatherConditions`, `DemoScenario`

**Files Created/Modified:**
```
/backend/src/services/weatherService.ts
/backend/src/services/conflictDetectionService.ts
/backend/src/utils/weatherMinimums.ts
/backend/src/utils/demoScenarios.ts
/backend/src/controllers/weather.controller.ts
/backend/src/routes/weather.routes.ts
/backend/src/types/index.ts
```

---

## PR #5: AI Rescheduling Service
**Goal:** Implement AI-powered reschedule suggestion using Vercel AI SDK  

### Subtasks:
- [ ] **5.1** Install AI dependencies
  - Packages: `ai`, `@ai-sdk/openai`, `zod`, `openai`
  
- [ ] **5.2** Create scheduling service
  - Files: `backend/src/services/schedulingService.ts`
  - Functions: `getAvailableSlots()`, `checkInstructorAvailability()`, `checkAircraftAvailability()`
  
- [ ] **5.3** Create AI service with Zod schema
  - Files: `backend/src/services/aiService.ts`
  - Define `rescheduleOptionsSchema` with Zod
  - Implement `generateRescheduleOptions()` using Vercel AI SDK
  
- [ ] **5.4** Add helper functions for AI context
  - Files: `backend/src/services/aiService.ts`
  - Functions: `getWeatherMinimumsDescription()`, `formatAvailableSlots()`
  
- [ ] **5.5** Add AI types
  - Files: `backend/src/types/index.ts`
  - Types: `RescheduleOption`, `RescheduleContext`, `TimeSlot`
  
- [ ] **5.6** Create test script for AI service
  - Files: `backend/src/tests/aiService.test.ts`
  - Test with mock data to verify AI responses

**Files Created/Modified:**
```
/backend/src/services/aiService.ts
/backend/src/services/schedulingService.ts
/backend/src/types/index.ts
/backend/src/tests/aiService.test.ts
```

---

## PR #6: Flight Management System
**Goal:** CRUD operations for flights, conflict detection, and rescheduling  

### Subtasks:
- [ ] **6.1** Create flights controller
  - Files: `backend/src/controllers/flights.controller.ts`
  - Functions: `createFlight()`, `getFlights()`, `getFlightById()`, `updateFlight()`, `cancelFlight()`
  
- [ ] **6.2** Add reschedule endpoint to flights controller
  - Files: `backend/src/controllers/flights.controller.ts`
  - Function: `generateRescheduleOptions()`, `confirmReschedule()`
  
- [ ] **6.3** Create flights routes
  - Files: `backend/src/routes/flights.routes.ts`
  - Routes: 
    - `POST /api/flights` (create)
    - `GET /api/flights` (list with filters)
    - `GET /api/flights/:id` (get one)
    - `PUT /api/flights/:id` (update)
    - `DELETE /api/flights/:id` (cancel)
    - `POST /api/flights/:id/reschedule-options` (generate AI options)
    - `POST /api/flights/:id/confirm-reschedule` (confirm selection)
  
- [ ] **6.4** Add request validation middleware
  - Files: `backend/src/middleware/validateRequest.ts`
  - Validate flight creation, reschedule confirmation payloads
  
- [ ] **6.5** Create manual weather check trigger endpoint
  - Files: `backend/src/controllers/flights.controller.ts`
  - Function: `triggerWeatherCheck()`
  - Route: `POST /api/flights/:id/check-weather`
  
- [ ] **6.6** Add flight types
  - Files: `backend/src/types/index.ts`
  - Types: `FlightBooking`, `CreateFlightRequest`, `RescheduleRequest`

**Files Created/Modified:**
```
/backend/src/controllers/flights.controller.ts
/backend/src/routes/flights.routes.ts
/backend/src/middleware/validateRequest.ts
/backend/src/types/index.ts
```

---

## PR #7: Notification System
**Goal:** Email and in-app notification system  

### Subtasks:
- [ ] **7.1** Install notification dependencies
  - Packages: `nodemailer`, `@types/nodemailer`
  
- [ ] **7.2** Create notification service
  - Files: `backend/src/services/notificationService.ts`
  - Functions: `sendEmail()`, `sendFlightConfirmation()`, `sendWeatherAlert()`, `sendRescheduleOptions()`, `createInAppNotification()`
  
- [ ] **7.3** Create email templates
  - Files: `backend/src/services/notificationService.ts`
  - Templates: flight confirmation, weather alert, reschedule options, reschedule confirmation
  
- [ ] **7.4** Create notifications controller
  - Files: `backend/src/controllers/notifications.controller.ts`
  - Functions: `getUserNotifications()`, `markAsRead()`, `deleteNotification()`
  
- [ ] **7.5** Create notifications routes
  - Files: `backend/src/routes/notifications.routes.ts`
  - Routes: `GET /api/notifications`, `PUT /api/notifications/:id/read`, `DELETE /api/notifications/:id`
  
- [ ] **7.6** Add notification types
  - Files: `backend/src/types/index.ts`
  - Types: `Notification`, `EmailTemplate`

**Files Created/Modified:**
```
/backend/src/services/notificationService.ts
/backend/src/controllers/notifications.controller.ts
/backend/src/routes/notifications.routes.ts
/backend/src/types/index.ts
```

---

## PR #8: Scheduled Weather Monitoring Job
**Goal:** Hourly cron job for automated weather checking  

### Subtasks:
- [ ] **8.1** Install cron dependency
  - Package: `node-cron`, `@types/node-cron`
  
- [ ] **8.2** Create weather check cron job
  - Files: `backend/src/jobs/weatherCheckCron.ts`
  - Function: `runWeatherCheck()` - checks all upcoming flights (next 48 hours)
  
- [ ] **8.3** Integrate cron with main app
  - Files: `backend/src/index.ts`
  - Start cron job on server startup
  
- [ ] **8.4** Add logging for cron executions
  - Files: `backend/src/utils/logger.ts`
  - Log each weather check cycle
  
- [ ] **8.5** Create manual trigger endpoint for testing
  - Files: `backend/src/routes/weather.routes.ts`
  - Route: `POST /api/weather/trigger-check` (admin only)

**Files Created/Modified:**
```
/backend/src/jobs/weatherCheckCron.ts
/backend/src/utils/logger.ts
/backend/src/index.ts
/backend/src/routes/weather.routes.ts
```

---

## PR #9: Students Management
**Goal:** CRUD operations for students  

### Subtasks:
- [ ] **9.1** Create students controller
  - Files: `backend/src/controllers/students.controller.ts`
  - Functions: `createStudent()`, `getStudents()`, `getStudentById()`, `updateStudent()`, `deleteStudent()`
  
- [ ] **9.2** Create students routes
  - Files: `backend/src/routes/students.routes.ts`
  - Routes: Standard CRUD endpoints
  
- [ ] **9.3** Add student types
  - Files: `backend/src/types/index.ts`
  - Types: `Student`, `CreateStudentRequest`, `UpdateStudentRequest`

**Files Created/Modified:**
```
/backend/src/controllers/students.controller.ts
/backend/src/routes/students.routes.ts
/backend/src/types/index.ts
```

---

## PR #10: Frontend - Authentication & Layout
**Goal:** Login page, auth context, and dashboard layout  

### Subtasks:
- [ ] **10.1** Install frontend dependencies
  - Packages: `react-router-dom`, `axios`, `zustand`, `react-hot-toast`, `lucide-react`
  
- [ ] **10.2** Setup Tailwind CSS
  - Files: `frontend/tailwind.config.js`, `frontend/src/styles/index.css`
  
- [ ] **10.3** Create API client
  - Files: `frontend/src/services/api.ts`
  - Setup axios with interceptors for auth tokens
  
- [ ] **10.4** Create auth service
  - Files: `frontend/src/services/auth.service.ts`
  - Functions: `login()`, `logout()`, `getCurrentUser()`
  
- [ ] **10.5** Create auth store (Zustand)
  - Files: `frontend/src/store/authStore.ts`
  - State: user, token, isAuthenticated
  
- [ ] **10.6** Create login form component
  - Files: `frontend/src/components/auth/LoginForm.tsx`
  
- [ ] **10.7** Create login page
  - Files: `frontend/src/pages/Login.tsx`
  
- [ ] **10.8** Create protected route wrapper
  - Files: `frontend/src/components/auth/ProtectedRoute.tsx`
  
- [ ] **10.9** Create layout components
  - Files: `frontend/src/components/layout/Navbar.tsx`
  - Files: `frontend/src/components/layout/Sidebar.tsx`
  - Files: `frontend/src/components/layout/Layout.tsx`
  
- [ ] **10.10** Create common UI components
  - Files: `frontend/src/components/common/Button.tsx`
  - Files: `frontend/src/components/common/Input.tsx`
  - Files: `frontend/src/components/common/Card.tsx`
  - Files: `frontend/src/components/common/Select.tsx`
  
- [ ] **10.11** Setup routing
  - Files: `frontend/src/App.tsx`
  - Routes: `/login`, `/dashboard`, `/flights`
  
- [ ] **10.12** Add TypeScript types
  - Files: `frontend/src/types/index.ts`
  - Types: `User`, `AuthState`, `LoginCredentials`

**Files Created/Modified:**
```
/frontend/tailwind.config.js
/frontend/src/styles/index.css
/frontend/src/services/api.ts
/frontend/src/services/auth.service.ts
/frontend/src/store/authStore.ts
/frontend/src/components/auth/LoginForm.tsx
/frontend/src/components/auth/ProtectedRoute.tsx
/frontend/src/components/layout/Navbar.tsx
/frontend/src/components/layout/Sidebar.tsx
/frontend/src/components/layout/Layout.tsx
/frontend/src/components/common/Button.tsx
/frontend/src/components/common/Input.tsx
/frontend/src/components/common/Card.tsx
/frontend/src/components/common/Select.tsx
/frontend/src/pages/Login.tsx
/frontend/src/App.tsx
/frontend/src/types/index.ts
```

---

## PR #11: Frontend - Flight Management UI
**Goal:** Create/view/list flights interface  

### Subtasks:
- [ ] **11.1** Create flights service
  - Files: `frontend/src/services/flights.service.ts`
  - Functions: `getFlights()`, `createFlight()`, `getFlightById()`, `cancelFlight()`
  
- [ ] **11.2** Create flights store
  - Files: `frontend/src/store/flightsStore.ts`
  - State: flights, loading, error
  
- [ ] **11.3** Create flight card component
  - Files: `frontend/src/components/flights/FlightCard.tsx`
  - Display: date, time, student, instructor, status, weather indicator
  
- [ ] **11.4** Create flight list component
  - Files: `frontend/src/components/flights/FlightList.tsx`
  
- [ ] **11.5** Create flight details component
  - Files: `frontend/src/components/flights/FlightDetails.tsx`
  
- [ ] **11.6** Create create flight form
  - Files: `frontend/src/components/flights/CreateFlightForm.tsx`
  - Fields: student, instructor, aircraft, date/time, departure, destination
  
- [ ] **11.7** Create flights page
  - Files: `frontend/src/pages/Flights.tsx`
  
- [ ] **11.8** Add useFlights hook
  - Files: `frontend/src/hooks/useFlights.ts`
  
- [ ] **11.9** Add flight types
  - Files: `frontend/src/types/index.ts`
  - Types: `Flight`, `CreateFlightPayload`, `FlightStatus`

**Files Created/Modified:**
```
/frontend/src/services/flights.service.ts
/frontend/src/store/flightsStore.ts
/frontend/src/components/flights/FlightCard.tsx
/frontend/src/components/flights/FlightList.tsx
/frontend/src/components/flights/FlightDetails.tsx
/frontend/src/components/flights/CreateFlightForm.tsx
/frontend/src/pages/Flights.tsx
/frontend/src/hooks/useFlights.ts
/frontend/src/types/index.ts
```

---

## PR #12: Frontend - Weather Alerts & Demo Mode
**Goal:** Weather alert display and demo mode controls  

### Subtasks:
- [ ] **12.1** Create weather service
  - Files: `frontend/src/services/weather.service.ts`
  - Functions: `checkWeather()`, `getDemoScenarios()`, `setDemoMode()`, `triggerWeatherCheck()`
  
- [ ] **12.2** Create weather alert card component
  - Files: `frontend/src/components/weather/WeatherAlertCard.tsx`
  - Display: flight info, weather issue, severity level
  
- [ ] **12.3** Create weather alert list component
  - Files: `frontend/src/components/weather/WeatherAlertList.tsx`
  
- [ ] **12.4** Create demo mode toggle component
  - Files: `frontend/src/components/weather/DemoModeToggle.tsx`
  - Toggle switch with label
  
- [ ] **12.5** Create weather scenario selector
  - Files: `frontend/src/components/weather/WeatherScenarioSelector.tsx`
  - Dropdown: Clear skies, Student conflict, Private conflict, Instrument conflict, Marginal
  - Button: "Trigger Weather Check"
  
- [ ] **12.6** Add useWeather hook
  - Files: `frontend/src/hooks/useWeather.ts`
  
- [ ] **12.7** Add weather types
  - Files: `frontend/src/types/index.ts`
  - Types: `WeatherAlert`, `DemoScenario`, `WeatherData`

**Files Created/Modified:**
```
/frontend/src/services/weather.service.ts
/frontend/src/components/weather/WeatherAlertCard.tsx
/frontend/src/components/weather/WeatherAlertList.tsx
/frontend/src/components/weather/DemoModeToggle.tsx
/frontend/src/components/weather/WeatherScenarioSelector.tsx
/frontend/src/hooks/useWeather.ts
/frontend/src/types/index.ts
```

---

## PR #13: Frontend - AI Rescheduling UI
**Goal:** Display AI-generated reschedule options and confirmation flow  

### Subtasks:
- [ ] **13.1** Create reschedule option card component
  - Files: `frontend/src/components/reschedule/RescheduleOptionCard.tsx`
  - Display: date/time, reasoning, weather forecast, priority badge
  
- [ ] **13.2** Create reschedule options modal
  - Files: `frontend/src/components/reschedule/RescheduleOptionsModal.tsx`
  - Show 3 AI options, allow selection, confirm button
  
- [ ] **13.3** Add reschedule functions to flights service
  - Files: `frontend/src/services/flights.service.ts`
  - Functions: `getRescheduleOptions()`, `confirmReschedule()`
  
- [ ] **13.4** Add modal component to common
  - Files: `frontend/src/components/common/Modal.tsx`
  
- [ ] **13.5** Add reschedule types
  - Files: `frontend/src/types/index.ts`
  - Types: `RescheduleOption`, `RescheduleConfirmation`

**Files Created/Modified:**
```
/frontend/src/components/reschedule/RescheduleOptionCard.tsx
/frontend/src/components/reschedule/RescheduleOptionsModal.tsx
/frontend/src/components/common/Modal.tsx
/frontend/src/services/flights.service.ts
/frontend/src/types/index.ts
```

---

## PR #14: Frontend - Dashboard Views (Student/Instructor/Admin)
**Goal:** Role-based dashboard views with metrics  

### Subtasks:
- [ ] **14.1** Create metrics card component
  - Files: `frontend/src/components/dashboard/MetricsCard.tsx`
  - Display: title, value, icon, trend indicator
  
- [ ] **14.2** Create student dashboard
  - Files: `frontend/src/components/dashboard/StudentDashboard.tsx`
  - Sections: Upcoming flights, Weather alerts, Flight history
  
- [ ] **14.3** Create instructor dashboard
  - Files: `frontend/src/components/dashboard/InstructorDashboard.tsx`
  - Sections: Today's schedule, This week's flights, Notifications
  
- [ ] **14.4** Create admin dashboard
  - Files: `frontend/src/components/dashboard/AdminDashboard.tsx`
  - Sections: Create flight button, Live weather alerts, Flight schedule board, Metrics, Demo controls
  
- [ ] **14.5** Create main dashboard page with role routing
  - Files: `frontend/src/pages/Dashboard.tsx`
  - Route to correct dashboard based on user role
  
- [ ] **14.6** Add useAuth hook
  - Files: `frontend/src/hooks/useAuth.ts`
  - Access user info and role

**Files Created/Modified:**
```
/frontend/src/components/dashboard/MetricsCard.tsx
/frontend/src/components/dashboard/StudentDashboard.tsx
/frontend/src/components/dashboard/InstructorDashboard.tsx
/frontend/src/components/dashboard/AdminDashboard.tsx
/frontend/src/pages/Dashboard.tsx
/frontend/src/hooks/useAuth.ts
```

---

## PR #15: Frontend - Notifications System
**Goal:** In-app notifications with notification bell  

### Subtasks:
- [ ] **15.1** Create notifications service
  - Files: `frontend/src/services/notifications.service.ts`
  - Functions: `getNotifications()`, `markAsRead()`, `deleteNotification()`
  
- [ ] **15.2** Create notifications store
  - Files: `frontend/src/store/notificationsStore.ts`
  - State: notifications, unreadCount
  
- [ ] **15.3** Create notification bell component
  - Files: `frontend/src/components/notifications/NotificationBell.tsx`
  - Badge with unread count
  
- [ ] **15.4** Create notification list component
  - Files: `frontend/src/components/notifications/NotificationList.tsx`
  - Dropdown list from bell icon
  
- [ ] **15.5** Add useNotifications hook
  - Files: `frontend/src/hooks/useNotifications.ts`
  
- [ ] **15.6** Integrate notification bell into navbar
  - Files: `frontend/src/components/layout/Navbar.tsx`
  
- [ ] **15.7** Add toast notifications for real-time alerts
  - Files: `frontend/src/App.tsx`
  - Setup react-hot-toast provider

**Files Created/Modified:**
```
/frontend/src/services/notifications.service.ts
/frontend/src/store/notificationsStore.ts
/frontend/src/components/notifications/NotificationBell.tsx
/frontend/src/components/notifications/NotificationList.tsx
/frontend/src/hooks/useNotifications.ts
/frontend/src/components/layout/Navbar.tsx
/frontend/src/App.tsx
```

---

## PR #16: Integration Testing & Bug Fixes
**Goal:** End-to-end testing and resolve any issues  

### Subtasks:
- [ ] **16.1** Test full workflow: Create flight → Weather conflict → AI reschedule → Confirm
  - Manual testing of complete user journey
  
- [ ] **16.2** Test demo mode scenarios
  - Verify all 5 weather scenarios work correctly
  - Test demo mode toggle on/off
  
- [ ] **16.3** Test role-based access
  - Student can only see their flights
  - Instructor can see assigned flights
  - Admin can see all flights and demo controls
  
- [ ] **16.4** Test notification system
  - Email notifications (console log in dev)
  - In-app notifications appear in bell
  
- [ ] **16.5** Fix TypeScript errors
  - Files: Any files with TS errors
  
- [ ] **16.6** Fix CORS issues
  - Files: `backend/src/app.ts`
  
- [ ] **16.7** Add error handling for API failures
  - Files: `frontend/src/services/api.ts`
  
- [ ] **16.8** Test with different training levels
  - Verify weather minimums apply correctly
  
- [ ] **16.9** Update seed data if needed
  - Files: `backend/prisma/seed.ts`

**Files Modified:**
```
Various files based on bugs found
/backend/src/app.ts
/frontend/src/services/api.ts
/backend/prisma/seed.ts
```

---

## PR #17: Documentation & Code Cleanup
**Goal:** Finalize documentation and clean up code  

### Subtasks:
- [ ] **17.1** Update main README
  - Files: `README.md`
  - Add: Setup instructions, environment variables, how to run, demo instructions
  
- [ ] **17.2** Create backend README
  - Files: `backend/README.md`
  - Document: API endpoints, database schema, services
  
- [ ] **17.3** Create frontend README
  - Files: `frontend/README.md`
  - Document: Component structure, state management, routing
  
- [ ] **17.4** Add inline code comments
  - Files: Key service files
  - Document complex logic in `aiService.ts`, `conflictDetectionService.ts`
  
- [ ] **17.5** Create .env.template files
  - Files: `.env.template`, `backend/.env.template`, `frontend/.env.template`
  
- [ ] **17.6** Add API documentation
  - Files: `backend/API.md`
  - Document all endpoints with request/response examples
  
- [ ] **17.7** Remove console.logs and debug code
  - Files: All files
  
- [ ] **17.8** Format code consistently
  - Command: `npm run format` (if prettier is setup)

**Files Created/Modified:**
```
/README.md
/backend/README.md
/frontend/README.md
/backend/API.md
/.env.template
/backend/.env.template
/frontend/.env.template
Various files (cleanup)
```

---

## PR #18: AWS Deployment Preparation
**Goal:** Prepare application for AWS deployment  

### Subtasks:
- [ ] **18.1** Create production Dockerfile for backend
  - Files: `backend/Dockerfile`
  
- [ ] **18.2** Create production build for frontend
  - Files: `frontend/vite.config.ts` (ensure proper build config)
  - Command: `npm run build`
  
- [ ] **18.3** Create AWS deployment documentation
  - Files: `DEPLOYMENT.md`
  - Document: RDS setup, EC2/Elastic Beanstalk setup, S3/CloudFront setup, environment variables
  
- [ ] **18.4** Setup production environment variables
  - Files: Document required env vars for production
  
- [ ] **18.5** Add health check endpoint
  - Files: `backend/src/routes/health.routes.ts`
  - Route: `GET /health`
  
- [ ] **18.6** Configure CORS for production
  - Files: `backend/src/app.ts`
  - Allow production frontend URL
  
- [ ] **18.7** Add production logging
  - Files: `backend/src/utils/logger.ts`
  - Use proper logging service (not console.log)
  
- [ ] **18.8** Create CI/CD workflow (optional)
  - Files: `.github/workflows/deploy.yml`

**Files Created/Modified:**
```
/backend/Dockerfile
/DEPLOYMENT.md
/backend/src/routes/health.routes.ts
/backend/src/app.ts
/backend/src/utils/logger.ts
/.github/workflows/deploy.yml (optional)
```

---

## PR #19: Demo Video Preparation
**Goal:** Prepare system for demo video recording  

### Subtasks:
- [ ] **19.1** Create demo script
  - Files: `DEMO_SCRIPT.md`
  - Outline: What to show in 5-10 min video
  
- [ ] **19.2** Seed database with demo-ready data
  - Files: `backend/prisma/seed.ts`
  - Create: 1 conflicted flight ready to demo
  
- [ ] **19.3** Test demo flow multiple times
  - Ensure smooth workflow without errors
  
- [ ] **19.4** Create demo user accounts
  - Student: demo-student@test.com
  - Instructor: demo-instructor@test.com
  - Admin: demo-admin@test.com
  
- [ ] **19.5** Polish UI styling
  - Files: Various component files
  - Ensure consistent design, good visual hierarchy
  
- [ ] **19.6** Add loading states and animations
  - Files: Various component files
  - Smooth user experience
  
- [ ] **19.7** Test on different screen sizes
  - Ensure responsive design works

**Files Modified:**
```
/DEMO_SCRIPT.md
/backend/prisma/seed.ts
Various component styling files
```

---

## PR #20: Final Deployment to AWS
**Goal:** Deploy application to AWS and verify production system  

### Subtasks:
- [ ] **20.1** Setup AWS RDS PostgreSQL instance
  - Create database, get connection string
  
- [ ] **20.2** Run migrations on production database
  - Command: Update DATABASE_URL, run `npx prisma migrate deploy`
  
- [ ] **20.3** Seed production database
  - Command: `npx prisma db seed` (with production data)
  
- [ ] **20.4** Deploy backend to AWS (EC2 or Elastic Beanstalk)
  - Upload code, set environment variables, start server
  
- [ ] **20.5** Deploy frontend to S3 + CloudFront
  - Build frontend, upload to S3, configure CloudFront
  
- [ ] **20.6** Configure environment variables in AWS
  - Set all required env vars (API keys, database URL)
  
- [ ] **20.7** Test production system end-to-end
  - Create flight, trigger weather check, generate AI options, confirm reschedule
  
- [ ] **20.8** Setup monitoring and logging
  - Configure CloudWatch or logging service
  
- [ ] **20.9** Document production URLs
  - Files: `DEPLOYMENT.md`
  - Add: Frontend URL, Backend API URL
  
- [ ] **20.10** Record demo video
  - Show all success criteria from PRD

**Files Modified:**
```
/DEPLOYMENT.md
```

---

## Summary Checklist

### Core Functionality (Must Complete):
- [ ] User authentication with role-based access
- [ ] Flight creation and management
- [ ] Real-time weather monitoring (with demo mode)
- [ ] Conflict detection based on training level
- [ ] AI-powered reschedule suggestions (3 options)
- [ ] Notification system (email + in-app)
- [ ] Scheduled hourly weather checks
- [ ] Role-based dashboards (student/instructor/admin)
- [ ] Demo mode with 5 pre-built scenarios

### Success Criteria (From PRD):
- [ ] ✅ Weather conflicts are automatically detected
- [ ] ✅ Notifications sent to affected users
- [ ] ✅ AI suggests 3 optimal reschedule options
- [ ] ✅ Database accurately updates bookings
- [ ] ✅ Dashboard displays live weather alerts
- [ ] ✅ AI logic considers training level

### Deliverables:
- [ ] GitHub repository with clean code
- [ ] README with setup instructions
- [ ] .env.template file
- [ ] Demo video (5-10 min)
- [ ] Working production deployment on AWS

---

