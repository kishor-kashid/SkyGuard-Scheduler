# New Features Task List: SkyGuard-Scheduler

## Overview

This document outlines the implementation plan for 4 major feature enhancements to the SkyGuard-Scheduler system. Each feature is broken down into detailed subtasks organized by PR (Pull Request) for systematic implementation.

---

## Feature 1: Flight History and Logs

**Goal:** Complete flight history tracking, audit trails, notes system, and training hour tracking for students and instructors.

### PR #21: Database Schema Updates for Flight History

**Subtasks:**
- [ ] **21.1** Create FlightHistory model
  - Fields: id, flightId, action (CREATED, UPDATED, CANCELLED, COMPLETED, RESCHEDULED), changedBy (userId), changes (JSON), timestamp, notes
  - Relation to FlightBooking
  - Relation to User (who made the change)
  
- [ ] **21.2** Create FlightNotes model
  - Fields: id, flightId, authorId (userId), noteType (PRE_FLIGHT, POST_FLIGHT, DEBRIEF, GENERAL), content, createdAt, updatedAt
  - Relation to FlightBooking
  - Relation to User (author)
  
- [ ] **21.3** Create TrainingHours model
  - Fields: id, studentId, flightId, hours (decimal), category (GROUND, FLIGHT, SIMULATOR), date, instructorId, notes
  - Relations to Student, FlightBooking, Instructor
  - Index on studentId and date for quick queries
  
- [ ] **21.4** Add audit fields to FlightBooking model
  - Add: createdBy, lastModifiedBy, version (for optimistic locking)
  - Track all status changes
  
- [ ] **21.5** Run migration
  - Command: `npx prisma migrate dev --name add_flight_history_models`
  
- [ ] **21.6** Update seed script
  - Add sample flight history records
  - Add sample flight notes
  - Add sample training hours

**Files Created/Modified:**
```
/backend/prisma/schema.prisma
/backend/prisma/migrations/
/backend/prisma/seed.ts
```

---

### PR #22: Flight History Service and API

**Subtasks:**
- [ ] **22.1** Create flightHistoryService
  - Functions: `logFlightAction()`, `getFlightHistory()`, `getStudentFlightHistory()`, `getInstructorFlightHistory()`
  - Track all CRUD operations on flights
  - Format change diffs for display
  
- [ ] **22.2** Create flightNotesService
  - Functions: `createNote()`, `getFlightNotes()`, `updateNote()`, `deleteNote()`
  - Support different note types
  - Role-based access (students see their notes, instructors see all)
  
- [ ] **22.3** Create trainingHoursService
  - Functions: `logTrainingHours()`, `getStudentHours()`, `getTotalHours()`, `getHoursByCategory()`, `getHoursByDateRange()`
  - Calculate totals and statistics
  - Support filtering by category and date range
  
- [ ] **22.4** Create flightHistoryController
  - Endpoints:
    - `GET /api/flights/:id/history` - Get history for a flight
    - `GET /api/students/:id/flight-history` - Get all flights for a student
    - `GET /api/instructors/:id/flight-history` - Get all flights for an instructor
    - `GET /api/flights/:id/notes` - Get notes for a flight
    - `POST /api/flights/:id/notes` - Create a note
    - `PUT /api/notes/:id` - Update a note
    - `DELETE /api/notes/:id` - Delete a note
    - `POST /api/flights/:id/training-hours` - Log training hours
    - `GET /api/students/:id/training-hours` - Get training hours summary
  
- [ ] **22.5** Create flightHistoryRoutes
  - Mount routes under `/api/flights` and `/api/students` and `/api/instructors`
  - Add authentication and authorization middleware
  
- [ ] **22.6** Integrate history logging into flights controller
  - Log all create, update, cancel, reschedule actions
  - Capture who made the change and what changed
  
- [ ] **22.7** Add types for flight history
  - Types: `FlightHistory`, `FlightNote`, `TrainingHours`, `FlightHistoryAction`, `NoteType`

**Files Created/Modified:**
```
/backend/src/services/flightHistoryService.ts
/backend/src/services/flightNotesService.ts
/backend/src/services/trainingHoursService.ts
/backend/src/controllers/flightHistory.controller.ts
/backend/src/routes/flightHistory.routes.ts
/backend/src/controllers/flights.controller.ts (integration)
/backend/src/types/index.ts
```

---

### PR #23: Frontend - Flight History UI

**Subtasks:**
- [ ] **23.1** Create flight history service
  - Files: `frontend/src/services/flightHistory.service.ts`
  - Functions: `getFlightHistory()`, `getStudentHistory()`, `getInstructorHistory()`, `getFlightNotes()`, `createNote()`, `updateNote()`, `deleteNote()`, `logTrainingHours()`, `getTrainingHours()`
  
- [ ] **23.2** Create flight history store
  - Files: `frontend/src/store/flightHistoryStore.ts`
  - State: history, notes, trainingHours, loading, error
  - Methods: fetchHistory, fetchNotes, createNote, updateNote, deleteNote, fetchTrainingHours
  
- [ ] **23.3** Create FlightHistoryTimeline component
  - Display chronological history of flight changes
  - Show who made changes and when
  - Visual timeline with icons for different action types
  - Expandable change details
  
- [ ] **23.4** Create FlightNotes component
  - Display list of notes for a flight
  - Create/edit/delete notes (role-based)
  - Filter by note type
  - Rich text editor for note content
  
- [ ] **23.5** Create TrainingHoursCard component
  - Display training hours summary for a student
  - Show totals by category (ground, flight, simulator)
  - Show hours by date range
  - Progress indicators
  
- [ ] **23.6** Create FlightHistoryPage
  - Tabbed interface: History, Notes, Training Hours
  - Filter by date range, flight type, status
  - Search functionality
  - Export to CSV/PDF (optional)
  
- [ ] **23.7** Integrate into FlightDetails page
  - Add "History" tab to flight details modal/page
  - Show notes section
  - Show training hours if applicable
  
- [ ] **23.8** Add to Student and Instructor dashboards
  - Student: "My Flight History" section
  - Instructor: "Student Training Hours" section
  - Quick stats and recent history

**Files Created/Modified:**
```
/frontend/src/services/flightHistory.service.ts
/frontend/src/store/flightHistoryStore.ts
/frontend/src/components/flights/FlightHistoryTimeline.tsx
/frontend/src/components/flights/FlightNotes.tsx
/frontend/src/components/flights/TrainingHoursCard.tsx
/frontend/src/pages/FlightHistory.tsx
/frontend/src/components/flights/FlightDetails.tsx (integration)
/frontend/src/components/dashboard/StudentDashboard.tsx (integration)
/frontend/src/components/dashboard/InstructorDashboard.tsx (integration)
/frontend/src/types/index.ts
```

---

## Feature 2: Advanced Scheduling Features

**Goal:** Recurring bookings, bulk creation, templates, availability calendars, and preference enforcement.

### PR #24: Database Schema for Advanced Scheduling

**Subtasks:**
- [ ] **24.1** Create RecurringFlightTemplate model
  - Fields: id, name, description, studentId, instructorId, aircraftId, dayOfWeek, time, frequency (WEEKLY, BIWEEKLY, MONTHLY), startDate, endDate, isActive, createdAt, updatedAt
  - Relations to Student, Instructor, Aircraft
  
- [ ] **24.2** Create ScheduleTemplate model
  - Fields: id, name, description, templateData (JSON), createdBy, createdAt, updatedAt
  - Store reusable schedule patterns
  
- [ ] **24.3** Add availability fields to Student model
  - Add: availabilityPreferences (JSON) - detailed availability schedule
  - Add: preferredInstructors (JSON array of IDs)
  - Add: blackoutDates (JSON array of date ranges)
  
- [ ] **24.4** Add availability fields to Instructor model
  - Add: availabilitySchedule (JSON) - weekly availability
  - Add: blackoutDates (JSON array of date ranges)
  - Add: maxFlightsPerDay (integer)
  
- [ ] **24.5** Create AvailabilityBlock model
  - Fields: id, userId (student or instructor), startTime, endTime, dayOfWeek, isRecurring, specificDate (nullable), createdAt, updatedAt
  - Generic availability tracking
  
- [ ] **24.6** Run migration
  - Command: `npx prisma migrate dev --name add_advanced_scheduling_models`
  
- [ ] **24.7** Update seed script
  - Add sample recurring flight templates
  - Add sample availability preferences
  - Add sample schedule templates

**Files Created/Modified:**
```
/backend/prisma/schema.prisma
/backend/prisma/migrations/
/backend/prisma/seed.ts
```

---

### PR #25: Advanced Scheduling Services

**Subtasks:**
- [ ] **25.1** Create recurringFlightService
  - Functions: `createRecurringTemplate()`, `generateFlightsFromTemplate()`, `updateRecurringTemplate()`, `cancelRecurringTemplate()`, `getRecurringTemplates()`
  - Logic to generate flights based on frequency and date range
  - Handle conflicts and skip dates
  
- [ ] **25.2** Create bulkFlightService
  - Functions: `createBulkFlights()`, `validateBulkFlightData()`, `processBulkCreation()`
  - Accept array of flight data
  - Batch processing with error handling
  - Return success/failure for each flight
  
- [ ] **25.3** Create scheduleTemplateService
  - Functions: `createTemplate()`, `getTemplates()`, `applyTemplate()`, `updateTemplate()`, `deleteTemplate()`
  - Store and retrieve reusable schedule patterns
  - Apply template to generate multiple flights
  
- [ ] **25.4** Create availabilityService
  - Functions: `setStudentAvailability()`, `setInstructorAvailability()`, `checkAvailability()`, `getAvailabilityCalendar()`, `findAvailableSlots()`
  - Enforce availability preferences
  - Generate availability calendar views
  - Find slots that match all constraints
  
- [ ] **25.5** Enhance schedulingService
  - Add: `enforceAvailabilityPreferences()`, `checkRecurringConflicts()`, `generateRecurringSlots()`
  - Integrate availability checking into existing scheduling logic
  
- [ ] **25.6** Create advancedSchedulingController
  - Endpoints:
    - `POST /api/recurring-flights` - Create recurring flight template
    - `GET /api/recurring-flights` - List recurring templates
    - `PUT /api/recurring-flights/:id` - Update template
    - `DELETE /api/recurring-flights/:id` - Cancel template
    - `POST /api/recurring-flights/:id/generate` - Generate flights from template
    - `POST /api/flights/bulk` - Create multiple flights at once
    - `GET /api/schedule-templates` - List templates
    - `POST /api/schedule-templates` - Create template
    - `POST /api/schedule-templates/:id/apply` - Apply template
    - `PUT /api/students/:id/availability` - Set student availability
    - `PUT /api/instructors/:id/availability` - Set instructor availability
    - `GET /api/availability/calendar` - Get availability calendar
    - `GET /api/availability/slots` - Find available slots
  
- [ ] **25.7** Create advancedSchedulingRoutes
  - Mount routes under `/api/recurring-flights`, `/api/schedule-templates`, `/api/availability`
  - Add authentication and authorization (admin/instructor for most)
  
- [ ] **25.8** Add types for advanced scheduling
  - Types: `RecurringFlightTemplate`, `ScheduleTemplate`, `AvailabilityBlock`, `BulkFlightRequest`, `AvailabilityCalendar`, `AvailableSlot`

**Files Created/Modified:**
```
/backend/src/services/recurringFlightService.ts
/backend/src/services/bulkFlightService.ts
/backend/src/services/scheduleTemplateService.ts
/backend/src/services/availabilityService.ts
/backend/src/services/schedulingService.ts (enhancements)
/backend/src/controllers/advancedScheduling.controller.ts
/backend/src/routes/advancedScheduling.routes.ts
/backend/src/types/index.ts
```

---

### PR #26: Frontend - Advanced Scheduling UI

**Subtasks:**
- [ ] **26.1** Create advanced scheduling services
  - Files: `frontend/src/services/recurringFlights.service.ts`, `frontend/src/services/bulkFlights.service.ts`, `frontend/src/services/scheduleTemplates.service.ts`, `frontend/src/services/availability.service.ts`
  - All CRUD operations for each feature
  
- [ ] **26.2** Create recurring flights components
  - Files: `frontend/src/components/scheduling/RecurringFlightForm.tsx` - Create/edit recurring template
  - Files: `frontend/src/components/scheduling/RecurringFlightList.tsx` - List and manage templates
  - Files: `frontend/src/components/scheduling/RecurringFlightCard.tsx` - Display template details
  
- [ ] **26.3** Create bulk flight creation component
  - Files: `frontend/src/components/scheduling/BulkFlightForm.tsx`
  - CSV import/export functionality
  - Table view for bulk data entry
  - Validation and preview before submission
  - Progress indicator for bulk creation
  
- [ ] **26.4** Create schedule templates components
  - Files: `frontend/src/components/scheduling/ScheduleTemplateForm.tsx` - Create template
  - Files: `frontend/src/components/scheduling/ScheduleTemplateList.tsx` - Browse templates
  - Files: `frontend/src/components/scheduling/ApplyTemplateModal.tsx` - Apply template wizard
  
- [ ] **26.5** Create availability calendar components
  - Files: `frontend/src/components/scheduling/AvailabilityCalendar.tsx` - Visual calendar view
  - Files: `frontend/src/components/scheduling/AvailabilityEditor.tsx` - Edit availability preferences
  - Files: `frontend/src/components/scheduling/AvailabilitySlot.tsx` - Individual time slot
  - Weekly view with drag-and-drop (optional)
  - Color coding for available/unavailable
  
- [ ] **26.6** Create advanced scheduling pages
  - Files: `frontend/src/pages/RecurringFlights.tsx` - Manage recurring flights
  - Files: `frontend/src/pages/BulkFlights.tsx` - Bulk creation page
  - Files: `frontend/src/pages/ScheduleTemplates.tsx` - Template management
  - Files: `frontend/src/pages/Availability.tsx` - Availability management (for students/instructors)
  
- [ ] **26.7** Integrate into existing pages
  - Add "Create Recurring" option to Flights page
  - Add "Bulk Create" button to Flights page (admin only)
  - Add availability link to Student/Instructor profile pages
  - Add template selector to CreateFlightForm
  
- [ ] **26.8** Add availability enforcement to CreateFlightForm
  - Show warnings if selected time conflicts with availability
  - Highlight available time slots
  - Auto-suggest available times

**Files Created/Modified:**
```
/frontend/src/services/recurringFlights.service.ts
/frontend/src/services/bulkFlights.service.ts
/frontend/src/services/scheduleTemplates.service.ts
/frontend/src/services/availability.service.ts
/frontend/src/components/scheduling/RecurringFlightForm.tsx
/frontend/src/components/scheduling/RecurringFlightList.tsx
/frontend/src/components/scheduling/RecurringFlightCard.tsx
/frontend/src/components/scheduling/BulkFlightForm.tsx
/frontend/src/components/scheduling/ScheduleTemplateForm.tsx
/frontend/src/components/scheduling/ScheduleTemplateList.tsx
/frontend/src/components/scheduling/ApplyTemplateModal.tsx
/frontend/src/components/scheduling/AvailabilityCalendar.tsx
/frontend/src/components/scheduling/AvailabilityEditor.tsx
/frontend/src/components/scheduling/AvailabilitySlot.tsx
/frontend/src/pages/RecurringFlights.tsx
/frontend/src/pages/BulkFlights.tsx
/frontend/src/pages/ScheduleTemplates.tsx
/frontend/src/pages/Availability.tsx
/frontend/src/components/flights/CreateFlightForm.tsx (enhancements)
/frontend/src/pages/Flights.tsx (integration)
/frontend/src/types/index.ts
```

---

## Feature 3: AI-Powered Weather Briefings

**Goal:** Generate natural language weather briefings personalized by training level and flight context.

### PR #27: AI Weather Briefing Service

**Subtasks:**
- [ ] **27.1** Create weatherBriefingService
  - Functions: `generateWeatherBriefing()`, `generateRiskAssessment()`, `generateRecommendation()`, `compareHistoricalWeather()`
  - Use Vercel AI SDK with OpenAI
  - Structured prompts for consistent output
  
- [ ] **27.2** Create briefing prompt builder
  - Functions: `buildBriefingPrompt()`, `formatWeatherData()`, `formatTrainingLevelContext()`, `formatFlightContext()`
  - Include: current weather, forecast, training level, flight route, historical comparisons
  
- [ ] **27.3** Create Zod schema for briefing response
  - Schema: `weatherBriefingSchema`
  - Fields: summary, currentConditions, forecast, riskAssessment, recommendation, historicalComparison, confidence
  - Ensure structured, consistent output
  
- [ ] **27.4** Integrate historical weather data
  - Functions: `getHistoricalWeather()`, `findSimilarConditions()`
  - Query past weather checks for same location/time
  - Compare current conditions to historical patterns
  
- [ ] **27.5** Create weatherBriefingController
  - Endpoints:
    - `POST /api/flights/:id/weather-briefing` - Generate briefing for a flight
    - `GET /api/flights/:id/weather-briefing` - Get cached briefing
    - `POST /api/weather/briefing` - Generate briefing for custom location/time
  
- [ ] **27.6** Create weatherBriefingRoutes
  - Mount routes under `/api/flights` and `/api/weather`
  - Add authentication middleware
  
- [ ] **27.7** Add briefing caching
  - Cache briefings for 1 hour (weather changes frequently)
  - Store in database or Redis (if available)
  - Invalidate on weather updates
  
- [ ] **27.8** Add types for weather briefings
  - Types: `WeatherBriefing`, `RiskAssessment`, `WeatherRecommendation`, `HistoricalComparison`

**Files Created/Modified:**
```
/backend/src/services/weatherBriefingService.ts
/backend/src/controllers/weatherBriefing.controller.ts
/backend/src/routes/weatherBriefing.routes.ts
/backend/src/types/index.ts
```

---

### PR #28: Frontend - Weather Briefing UI

**Subtasks:**
- [ ] **28.1** Create weather briefing service
  - Files: `frontend/src/services/weatherBriefing.service.ts`
  - Functions: `getWeatherBriefing()`, `generateBriefing()`, `getCachedBriefing()`
  
- [ ] **28.2** Create WeatherBriefingCard component
  - Display formatted briefing
  - Sections: Summary, Current Conditions, Forecast, Risk Assessment, Recommendation
  - Color-coded risk levels
  - Historical comparison section
  
- [ ] **28.3** Create WeatherBriefingModal component
  - Full-screen or modal view of briefing
  - Print-friendly format
  - Share functionality (optional)
  
- [ ] **28.4** Integrate into FlightDetails page
  - Add "Weather Briefing" button/tab
  - Show briefing for upcoming flights
  - Auto-generate on flight creation (optional)
  
- [ ] **28.5** Add to Student Dashboard
  - Show briefings for upcoming flights
  - Quick view of weather conditions
  - Alert if briefing recommends cancellation
  
- [ ] **28.6** Add to Instructor Dashboard
  - Show briefings for all assigned flights
  - Batch briefing view (optional)
  
- [ ] **28.7** Create standalone Weather Briefing page
  - Files: `frontend/src/pages/WeatherBriefing.tsx`
  - Generate briefing for custom location/time
  - Historical briefing archive (optional)
  
- [ ] **28.8** Add briefing generation to weather check flow
  - Auto-generate briefing when weather conflict detected
  - Include in weather alert notifications
  - Link to full briefing from alert

**Files Created/Modified:**
```
/frontend/src/services/weatherBriefing.service.ts
/frontend/src/components/weather/WeatherBriefingCard.tsx
/frontend/src/components/weather/WeatherBriefingModal.tsx
/frontend/src/components/flights/FlightDetails.tsx (integration)
/frontend/src/components/dashboard/StudentDashboard.tsx (integration)
/frontend/src/components/dashboard/InstructorDashboard.tsx (integration)
/frontend/src/pages/WeatherBriefing.tsx
/frontend/src/components/weather/WeatherAlertCard.tsx (enhancements)
/frontend/src/types/index.ts
```

---

## Feature 4: Smart Conflict Resolution

**Goal:** AI-powered automatic conflict detection and resolution suggestions.

### PR #29: Smart Conflict Detection Service

**Subtasks:**
- [ ] **29.1** Enhance conflictDetectionService
  - Add: `detectAllConflicts()`, `categorizeConflict()`, `calculateConflictSeverity()`
  - Detect: double-bookings, resource conflicts, availability violations, weather conflicts
  - Return structured conflict data with severity levels
  
- [ ] **29.2** Create conflictResolutionService
  - Functions: `generateResolutionOptions()`, `evaluateResolution()`, `autoResolveConflict()`, `suggestSwaps()`, `suggestAlternatives()`
  - Use AI to analyze conflicts and generate solutions
  - Consider: instructor preferences, student training needs, aircraft availability, weather
  
- [ ] **29.3** Create AI prompt for conflict resolution
  - Functions: `buildResolutionPrompt()`, `formatConflictContext()`, `formatAvailableResources()`
  - Include: conflict details, available resources, constraints, preferences
  
- [ ] **29.4** Create Zod schema for resolution options
  - Schema: `conflictResolutionSchema`
  - Fields: resolutionType (SWAP, RESCHEDULE, REASSIGN, CANCEL), description, affectedFlights, confidence, impact
  - Multiple resolution options per conflict
  
- [ ] **29.5** Create batch conflict detection
  - Functions: `detectBatchConflicts()`, `prioritizeConflicts()`, `resolveBatchConflicts()`
  - Process multiple conflicts at once
  - Optimize resolution order
  
- [ ] **29.6** Create conflictResolutionController
  - Endpoints:
    - `GET /api/conflicts` - List all active conflicts
    - `GET /api/conflicts/:id` - Get conflict details
    - `POST /api/conflicts/:id/resolutions` - Generate resolution options
    - `POST /api/conflicts/:id/resolve` - Apply resolution
    - `POST /api/conflicts/batch-detect` - Detect conflicts in date range
    - `POST /api/conflicts/batch-resolve` - Resolve multiple conflicts
    - `GET /api/conflicts/auto-resolve` - Get auto-resolved conflicts (preview)
    - `POST /api/conflicts/auto-resolve` - Apply auto-resolutions
  
- [ ] **29.7** Create conflictResolutionRoutes
  - Mount routes under `/api/conflicts`
  - Add authentication and authorization (admin/instructor)
  
- [ ] **29.8** Add conflict logging
  - Log all conflicts and resolutions
  - Track resolution success rate
  - Store in FlightHistory for audit trail
  
- [ ] **29.9** Add types for conflict resolution
  - Types: `Conflict`, `ConflictResolution`, `ResolutionOption`, `ConflictType`, `ConflictSeverity`

**Files Created/Modified:**
```
/backend/src/services/conflictDetectionService.ts (enhancements)
/backend/src/services/conflictResolutionService.ts
/backend/src/controllers/conflictResolution.controller.ts
/backend/src/routes/conflictResolution.routes.ts
/backend/src/services/flightHistoryService.ts (integration)
/backend/src/types/index.ts
```

---

### PR #30: Frontend - Smart Conflict Resolution UI

**Subtasks:**
- [ ] **30.1** Create conflict resolution service
  - Files: `frontend/src/services/conflictResolution.service.ts`
  - Functions: `getConflicts()`, `getConflictDetails()`, `generateResolutions()`, `applyResolution()`, `batchDetectConflicts()`, `batchResolveConflicts()`, `getAutoResolutions()`
  
- [ ] **30.2** Create conflict resolution store
  - Files: `frontend/src/store/conflictResolutionStore.ts`
  - State: conflicts, resolutions, loading, error
  - Methods: fetchConflicts, generateResolutions, applyResolution, batchResolve
  
- [ ] **30.3** Create ConflictCard component
  - Display conflict details
  - Show severity indicator
  - Show affected flights/resources
  - Action buttons: View Details, Generate Resolutions, Resolve
  
- [ ] **30.4** Create ConflictList component
  - List all active conflicts
  - Filter by type, severity, date
  - Sort options
  - Bulk selection for batch resolution
  
- [ ] **30.5** Create ResolutionOptionsModal component
  - Display AI-generated resolution options
  - Show confidence scores and impact analysis
  - Compare multiple options side-by-side
  - Preview changes before applying
  
- [ ] **30.6** Create BatchResolutionWizard component
  - Step 1: Select conflicts
  - Step 2: Review auto-generated resolutions
  - Step 3: Confirm and apply
  - Progress indicator
  
- [ ] **30.7** Create ConflictsPage
  - Files: `frontend/src/pages/Conflicts.tsx`
  - Main conflicts management interface
  - Tabs: Active Conflicts, Resolved Conflicts, Auto-Resolve Preview
  - Statistics dashboard
  
- [ ] **30.8** Integrate into existing pages
  - Add conflict alerts to Admin Dashboard
  - Show conflicts in Flights page (admin view)
  - Add "Resolve Conflicts" quick action
  - Show conflict indicators on flight cards
  
- [ ] **30.9** Add conflict notifications
  - Notify admins/instructors when conflicts detected
  - Show conflict count in notification bell
  - Email alerts for critical conflicts (optional)

**Files Created/Modified:**
```
/frontend/src/services/conflictResolution.service.ts
/frontend/src/store/conflictResolutionStore.ts
/frontend/src/components/conflicts/ConflictCard.tsx
/frontend/src/components/conflicts/ConflictList.tsx
/frontend/src/components/conflicts/ResolutionOptionsModal.tsx
/frontend/src/components/conflicts/BatchResolutionWizard.tsx
/frontend/src/pages/Conflicts.tsx
/frontend/src/components/dashboard/AdminDashboard.tsx (integration)
/frontend/src/pages/Flights.tsx (integration)
/frontend/src/components/flights/FlightCard.tsx (enhancements)
/frontend/src/types/index.ts
```

---

## Implementation Order & Dependencies

### Phase 1: Foundation (PRs 21-24)
- PR #21: Database Schema Updates for Flight History
- PR #24: Database Schema for Advanced Scheduling
- *These can be done in parallel*

### Phase 2: Backend Services (PRs 22, 25, 27, 29)
- PR #22: Flight History Service and API
- PR #25: Advanced Scheduling Services
- PR #27: AI Weather Briefing Service
- PR #29: Smart Conflict Detection Service
- *Can be done in parallel after Phase 1*

### Phase 3: Frontend Implementation (PRs 23, 26, 28, 30)
- PR #23: Frontend - Flight History UI
- PR #26: Frontend - Advanced Scheduling UI
- PR #28: Frontend - Weather Briefing UI
- PR #30: Frontend - Smart Conflict Resolution UI
- *Can be done in parallel after Phase 2*

## Testing Strategy

### Backend Testing
- Unit tests for all new services
- Integration tests for API endpoints
- Test AI service responses (mock OpenAI calls)
- Test conflict detection and resolution logic
- Test bulk operations and edge cases

### Frontend Testing
- Component tests for new UI components
- Integration tests for user flows
- Test form validation and error handling
- Test calendar and scheduling interactions
- Test conflict resolution workflows

## Success Criteria

### Feature 1: Flight History and Logs
- ✅ Complete audit trail for all flight changes
- ✅ Notes system functional for all roles
- ✅ Training hours accurately tracked and displayed
- ✅ History accessible from flight details and dashboards

### Feature 2: Advanced Scheduling
- ✅ Recurring flights generate correctly
- ✅ Bulk creation handles 50+ flights efficiently
- ✅ Templates can be created and applied
- ✅ Availability preferences enforced in scheduling
- ✅ Calendar views display correctly

### Feature 3: AI Weather Briefings
- ✅ Briefings generated in < 5 seconds
- ✅ Briefings are training-level appropriate
- ✅ Risk assessments are accurate
- ✅ Historical comparisons work correctly
- ✅ Briefings accessible from flight details

### Feature 4: Smart Conflict Resolution
- ✅ All conflict types detected automatically
- ✅ AI generates 3+ resolution options per conflict
- ✅ Batch resolution handles 10+ conflicts
- ✅ Auto-resolve suggestions are accurate
- ✅ Resolution success rate > 80%

