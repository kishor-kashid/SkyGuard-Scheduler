# Product Requirements Document: Weather Cancellation & AI Rescheduling

## Project Summary

- **Organization:** Flight Schedule Pro
- **Category:** AI Solution
- **Estimated Time:** 3–5 days
- **Overview:** This system will automatically detect potential weather conflicts for scheduled flight lessons and use AI to intelligently manage notifications and suggest optimized rescheduling options. It will monitor weather at all critical locations (takeoff, landing, and flight corridor).

---

## 1. Core Objectives

The primary goals are to automate, optimize, and track the entire weather-related flight disruption process:

- **Automate** weather monitoring and flight conflict detection.
- **Notify** affected students and instructors in real-time.
- **Generate** AI-powered rescheduling options that consider student training levels and availability.
- **Track** all booking, cancellation, and reschedule data for analysis.
- **Display** active flight and weather alerts in a central React dashboard.

---

## 2. Technical & Learning Goals

This project focuses on building a modern, robust event-driven system.

### Learning Objectives:
- Build an event-driven notification and scheduling system.
- Integrate real-time weather data APIs.
- Implement AI reasoning for decision-making (e.g., using AI SDK or LangGraph).
- Work with TypeScript, React, and Azure (or alternative cloud platforms).
- Design normalized database schemas for flight scheduling.

### Technical Stack:
- **Frontend:** React (TypeScript)
- **Backend/AI:** TypeScript, AI SDK (Vercel) or LangGraph
- **Cloud:** Azure (Alternative: AWS/GCP)
- **Database:** PostgreSQL or MongoDB
- **APIs:** OpenWeatherMap / WeatherAPI.com

---

## 3. Success Criteria

The project will be considered a success when all the following criteria are met:

- ✅ **Weather conflicts** are automatically and accurately detected.
- ✅ **Notifications** are successfully sent to all affected students and instructors.
- ✅ **AI suggests** optimal rescheduling times (e.g., 3 valid options).
- ✅ **Database** accurately updates bookings and logs all reschedule actions.
- ✅ **Dashboard** displays live weather alerts and current flight statuses.
- ✅ **AI logic** correctly considers the student's training level (e.g., applying stricter weather limits for a Student Pilot vs. an Instrument Rated pilot).

---

## 4. Mock Data & Key Specifications

The system must handle data structured as follows, with the AI specifically using **Training Level** to apply appropriate **Weather Minimums**.

### Data Types and Key Fields

| Data Type | Key Fields & Logic |
|-----------|-------------------|
| **Students** | id, name, email, phone, trainingLevel (e.g., "instrument-rated") |
| **Flight Bookings** | id, studentId, scheduledDate, departureLocation (with lat/lon), status |
| **Weather Minimums (Logic)** | **Student Pilot:** Requires clear skies, visibility > 5 mi, winds < 10 kt<br>**Private Pilot:** Requires visibility > 3 mi, ceiling > 1000 ft<br>**Instrument Rated:** IMC (Instrument Meteorological Conditions) is acceptable, but no thunderstorms or icing |

---

## 5. Testing Checklist

The following tests must pass to ensure stability and correctness:

- [ ] **Weather API Integration:** The system returns valid JSON for each required location.
- [ ] **Safety Logic:** The system correctly flags unsafe conditions based on student training level and weather minimums.
- [ ] **AI Output:** The AI successfully generates at least 3 valid reschedule options.
- [ ] **Notification:** Emails and in-app alerts are sent successfully upon a conflict.
- [ ] **Dashboard:** Displays live alerts and accurate flight statuses.
- [ ] **Database:** Reschedules are logged and tracked correctly.
- [ ] **Scheduler:** The background weather-monitoring process runs hourly.

---

## 6. Deliverables & Metrics

### Required Deliverables

- **GitHub Repository:** Clean code, README documentation, and a `.env.template` file.
- **Demo Video (5–10 min):** Must show flight creation, weather conflict detection, AI-generated reschedules, and notification/confirmation flow.

### Key Metrics to Track

- **Bookings Created**
- **Weather Conflicts Detected**
- **Successful Reschedules** (System-suggested and confirmed)
- **Average Rescheduling Time** (From cancellation to confirmation)

---

## 7. Bonus Features (Optional)

These features are for consideration if time allows after core deliverables are met:

- SMS notifications
- Google Calendar integration
- Historical weather analytics (to improve prediction)
- Predictive cancellation model (ML)
- Mobile app with push notifications

---

## System Workflow

### Phase 1: Continuous Monitoring
**Automated Weather Checking (Hourly Background Process)**
- A scheduled job runs every hour to check upcoming flight lessons
- For each scheduled flight, the system queries weather APIs for:
  - Departure location
  - Destination location
  - Flight corridor (points along the route)
- Weather data retrieved: visibility, ceiling, wind speed, precipitation, thunderstorms, icing conditions

### Phase 2: Conflict Detection
**AI-Powered Safety Analysis**
- System retrieves the student's `trainingLevel` from the database
- AI applies appropriate weather minimums based on certification
- If weather violates minimums → **CONFLICT DETECTED**

### Phase 3: Real-Time Notification
**Multi-Channel Alerts**
- System immediately notifies:
  - **Student**: Email + in-app notification
  - **Instructor**: Email + in-app notification
- Flight booking status updated to "CANCELLED" or "WEATHER_HOLD"
- Event logged in database with timestamp, reason, affected parties

### Phase 4: AI-Powered Rescheduling
**Intelligent Time Slot Generation**
- AI analyzes multiple factors:
  - Student's availability (from calendar/profile)
  - Instructor's availability
  - Aircraft availability
  - Historical weather patterns for proposed times
  - Student's training progression needs
- **Generates 3 optimal reschedule options** with:
  - Proposed date/time
  - Expected weather conditions
  - Justification for why this slot works

### Phase 5: User Interaction
**Confirmation Flow**
- Student reviews the 3 AI-suggested options in dashboard
- Student selects preferred option (or requests manual scheduling)
- System sends confirmation to both student and instructor
- Database updated:
  - Original booking marked as "CANCELLED"
  - New booking created with "CONFIRMED" status
  - Reschedule action logged with metrics (time to resolution, reason, etc.)

### Phase 6: Dashboard Visualization
**Real-Time Monitoring Interface**
- Central React dashboard displays:
  - **Active Alerts**: Current weather conflicts with severity indicators
  - **Flight Status Board**: All upcoming flights with weather risk levels
  - **Recent Actions**: Timeline of cancellations and reschedules
  - **Weather Maps**: Visual representation of conditions at key locations
  - **Metrics**: Bookings created, conflicts detected, successful reschedules, avg resolution time

---

## User Roles & Authentication

### Role Structure
1. **Students** - Book flights, receive notifications, confirm reschedules
2. **Instructors** - Receive notifications, view schedules (potentially approve bookings)
3. **Admin/Scheduler** - Create flights, manage students, view dashboard analytics

### Authentication Approach
**Single Login System with Role-Based Access**

After login, users are routed based on their role:
- **Student** → Student Dashboard (my flights, notifications)
- **Instructor** → Instructor Dashboard (students' flights, conflicts)
- **Admin** → Admin Dashboard (full system view, create flights)

---

## Flight Creation Flow

### Admin Creates a Flight

**Step 1: Admin Opens "Create Flight" Page**

Form includes:
- Student Selector (dropdown)
- Instructor Selector (dropdown)
- Aircraft Selector (dropdown)
- Date/Time Picker
- Departure Location (lat/lon + name)
- Destination Location (optional)
- Flight Type (Training, Solo, Cross-Country)
- Notes (text area)

**Step 2: Form Validation**
- Student selected
- Instructor selected (if required for training level)
- Date/time is in the future
- Departure location has valid coordinates
- Student's training level allows this flight type

**Step 3: Backend Processes the Request**
- Check for scheduling conflicts (instructor/aircraft availability)
- Create flight booking in database
- Send confirmation notifications to student and instructor
- Queue initial weather check

**Step 4: Notifications Sent**

Email to Student:
```
Subject: Flight Scheduled - Nov 10, 2025 at 2:00 PM

Hi Sarah,

Your flight training lesson has been scheduled:

📅 Date: November 10, 2025
🕐 Time: 2:00 PM CST
✈️ Aircraft: N12345 (Cessna 172)
👨‍✈️ Instructor: John Smith
🛫 Route: KAUS → KSAT
📝 Type: Training

Weather will be monitored automatically. You'll receive alerts if conditions change.

Safe flying