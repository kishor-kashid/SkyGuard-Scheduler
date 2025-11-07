# Product Context: SkyGuard-Scheduler

## Why This Project Exists

Flight training schools face a critical challenge: weather-related cancellations disrupt schedules, create communication overhead, and waste valuable training time. Manual weather monitoring and rescheduling is time-consuming, error-prone, and doesn't scale.

**The Problem:**
- Flight instructors and schedulers must manually check weather for each scheduled lesson
- Weather minimums vary by student training level, requiring careful evaluation
- Rescheduling requires coordinating student, instructor, and aircraft availability
- Late cancellations waste time and resources
- No centralized system to track weather patterns and optimize scheduling

## Problems This System Solves

### 1. Automated Weather Monitoring
**Before:** Manual weather checks for each flight, often forgotten or done too late
**After:** Hourly automated checks of all upcoming flights with real-time conflict detection

### 2. Training-Level-Aware Safety
**Before:** Generic weather checks that don't account for student certification levels
**After:** AI applies appropriate weather minimums based on student's training level:
- **Student Pilot:** Clear skies, visibility > 5 mi, winds < 10 kt
- **Private Pilot:** Visibility > 3 mi, ceiling > 1000 ft
- **Instrument Rated:** IMC acceptable, but no thunderstorms or icing

### 3. Intelligent Rescheduling
**Before:** Manual back-and-forth to find available time slots
**After:** AI analyzes availability, weather patterns, and training needs to suggest 3 optimal options

### 4. Real-Time Communication
**Before:** Phone calls, emails, or missed notifications
**After:** Automated email and in-app notifications to all affected parties immediately upon conflict detection

### 5. Centralized Visibility
**Before:** Scattered information across emails, calendars, and phone calls
**After:** Single dashboard showing all flights, alerts, and metrics

## How It Should Work

### User Experience Flow

#### For Students
1. Receive flight booking confirmation via email
2. View upcoming flights in personal dashboard
3. Receive immediate notification if weather conflict detected
4. Review 3 AI-suggested reschedule options
5. Select preferred option with one click
6. Receive confirmation of new flight time

#### For Instructors
1. Receive notification of assigned flights
2. View schedule in instructor dashboard
3. Receive alerts when student flights have weather conflicts
4. See reschedule confirmations automatically

#### For Admins/Schedulers
1. Create new flight bookings through admin interface
2. View comprehensive dashboard with all flights and alerts
3. Monitor system metrics (bookings, conflicts, reschedules)
4. Access demo mode to test weather scenarios
5. Manage students and instructors

### System Behavior

**Continuous Monitoring:**
- Background job runs every hour
- Checks all flights scheduled within next 48 hours
- Queries weather for departure, destination, and flight corridor
- Evaluates conditions against training-level minimums

**Conflict Detection:**
- Retrieves student's training level from database
- Applies appropriate weather minimums
- Flags conflicts immediately
- Updates flight status to "CANCELLED" or "WEATHER_HOLD"

**AI Rescheduling:**
- Analyzes student availability
- Checks instructor availability
- Verifies aircraft availability
- Considers historical weather patterns
- Generates 3 options with justifications

**Notifications:**
- In-app notifications sent immediately upon conflict (email notifications deferred)
- In-app notification appears in notification bell
- Both student and instructor notified
- Confirmation sent when reschedule selected
- Automatic notifications for: flight confirmation, weather alerts, reschedule options, reschedule confirmation, cancellation

## User Experience Goals

### Clarity
- Clear visual indicators for flight status and weather risk
- Intuitive navigation between dashboards
- Obvious action buttons for rescheduling

### Speed
- Fast conflict detection (within 1 hour of scheduled check)
- Quick reschedule option generation (< 5 seconds)
- Instant notification delivery

### Reliability
- Accurate weather conflict detection
- Consistent notification delivery
- Reliable database updates

### Flexibility
- Demo mode for testing without real weather API calls
- Manual reschedule option if AI suggestions don't work
- Role-based access ensures users see only relevant information

## Key User Scenarios

### Scenario 1: Weather Conflict Detected
1. System detects low visibility for Student Pilot's flight tomorrow
2. Student receives email: "Weather Alert: Flight Cancelled"
3. Student logs into dashboard, sees alert banner
4. Clicks "View Reschedule Options"
5. Reviews 3 AI suggestions with weather forecasts
6. Selects option for next day at 2 PM
7. Confirmation sent to student and instructor

### Scenario 2: Admin Creates Flight
1. Admin navigates to "Create Flight" page
2. Selects student, instructor, aircraft, date/time
3. System validates availability and training level requirements
4. Flight created, confirmation emails sent
5. Initial weather check queued
6. Flight appears in all relevant dashboards

### Scenario 3: Demo Mode Testing
1. Admin enables demo mode toggle
2. Selects "Student Conflict" scenario
3. Triggers weather check manually
4. System simulates weather conditions that violate Student Pilot minimums
5. Conflict detected, notifications sent
6. AI generates reschedule options
7. Full workflow tested without real weather API

