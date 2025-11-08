# SkyGuard-Scheduler API Documentation

**✅ Project Status: COMPLETE - Production Ready**

Complete API reference for SkyGuard-Scheduler backend endpoints. All documented endpoints are fully implemented and tested.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://api.yourdomain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

Obtain a token by logging in via `/api/auth/login` or registering via `/api/auth/register`.

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

**Note:** Error messages are included at both the top level (`message`) and within the `error` object for easier frontend access.

### HTTP Status Codes

- `200` - OK (Success)
- `201` - Created
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST `/api/auth/register`

Register a new user account.

**Public Endpoint** (No authentication required)

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT",
  "phone": "+1234567890",
  "trainingLevel": "STUDENT_PILOT"
}
```

**Field Descriptions:**
- `email` (string, required): User email address
- `password` (string, required): Password (min 6 characters)
- `name` (string, required): Full name
- `role` (string, required): One of `STUDENT`, `INSTRUCTOR`, `ADMIN`
- `phone` (string, optional): Phone number
- `trainingLevel` (string, required if role is STUDENT): One of `STUDENT_PILOT`, `PRIVATE_PILOT`, `INSTRUMENT_RATED`

**Response (201 Created):**
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/api/auth/login`

Login with existing credentials.

**Public Endpoint** (No authentication required)

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Invalid credentials

---

### GET `/api/auth/me`

Get current authenticated user information.

**Authentication:** Required

**Response (200 OK):**
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

---

## Flight Management Endpoints

### GET `/api/flights`

Get flights based on user role and filters.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by flight status (`CONFIRMED`, `WEATHER_HOLD`, `CANCELLED`, `COMPLETED`)

**Access Control:**
- **Students**: See only their own flights
- **Instructors**: See flights assigned to them
- **Admins**: See all flights

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "scheduledDate": "2024-03-20T10:00:00.000Z",
      "duration": 120,
      "flightType": "LOCAL",
      "status": "CONFIRMED",
      "departureLocation": {
        "name": "KJFK",
        "lat": 40.6413,
        "lon": -73.7781
      },
      "destinationLocation": null,
      "notes": null,
      "createdAt": "2024-03-15T10:00:00.000Z",
      "updatedAt": "2024-03-15T10:00:00.000Z",
      "student": {
        "id": 1,
        "name": "Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "trainingLevel": "STUDENT_PILOT"
      },
      "instructor": {
        "id": 1,
        "name": "John Smith",
        "email": "john.smith@flightpro.com"
      },
      "aircraft": {
        "id": 1,
        "registration": "N12345",
        "make": "Cessna",
        "model": "172"
      },
      "weatherChecks": [
        {
          "id": 1,
          "isSafe": true,
          "reason": null,
          "weatherData": { /* weather data object */ },
          "checkTimestamp": "2024-03-19T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

### GET `/api/flights/:id`

Get a single flight by ID.

**Authentication:** Required

**Access Control:**
- **Students**: Can only view their own flights
- **Instructors**: Can view flights assigned to them
- **Admins**: Can view any flight

**URL Parameters:**
- `id` (number): Flight booking ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "scheduledDate": "2024-03-20T10:00:00.000Z",
    "duration": 120,
    "flightType": "LOCAL",
    "status": "CONFIRMED",
    "departureLocation": {
      "name": "KJFK",
      "lat": 40.6413,
      "lon": -73.7781
    },
    "destinationLocation": null,
    "notes": null,
    "createdAt": "2024-03-15T10:00:00.000Z",
    "updatedAt": "2024-03-15T10:00:00.000Z",
    "student": { /* student object */ },
    "instructor": { /* instructor object */ },
    "aircraft": { /* aircraft object */ },
    "weatherChecks": [ /* weather check array */ ]
  }
}
```

**Error Responses:**
- `404` - Flight not found
- `403` - Not authorized to view this flight

---

### POST `/api/flights`

Create a new flight booking.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN`

**Request Body:**
```json
{
  "studentId": 1,
  "instructorId": 1,
  "aircraftId": 1,
  "scheduledDate": "2024-03-20T10:00:00.000Z",
  "duration": 120,
  "flightType": "LOCAL",
  "departureLocation": {
    "name": "KJFK",
    "lat": 40.6413,
    "lon": -73.7781
  },
  "destinationLocation": {
    "name": "KLGA",
    "lat": 40.7769,
    "lon": -73.8740
  },
  "notes": "Cross-country navigation training"
}
```

**Field Descriptions:**
- `studentId` (number, required): Student ID
- `instructorId` (number, required): Instructor ID
- `aircraftId` (number, required): Aircraft ID
- `scheduledDate` (string, required): ISO 8601 datetime
- `duration` (number, required): Duration in minutes
- `flightType` (string, required): `LOCAL`, `CROSS_COUNTRY`, or `SOLO`
- `departureLocation` (object, required): Airport code with lat/lon
- `destinationLocation` (object, optional): Destination airport
- `notes` (string, optional): Additional notes

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "scheduledDate": "2024-03-20T10:00:00.000Z",
    "status": "CONFIRMED",
    /* ... flight details ... */
  }
}
```

**Error Responses:**
- `400` - Validation error, instructor/aircraft conflict, invalid flightType or scheduledDate format
- `404` - Student, instructor, or aircraft not found (validated before creation)
- `409` - Conflict detected (student, instructor, or aircraft not available)

**Validation Notes:**
- System validates that student, instructor, and aircraft exist before creating flight
- Validates flightType enum value
- Validates scheduledDate format
- Checks for conflicts in 2-hour window for student, instructor, and aircraft

---

### PUT `/api/flights/:id`

Update an existing flight.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN`

**URL Parameters:**
- `id` (number): Flight booking ID

**Request Body:** (Same as POST, all fields optional)
```json
{
  "scheduledDate": "2024-03-21T10:00:00.000Z",
  "duration": 90,
  "notes": "Updated training plan"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    /* updated flight object */
  }
}
```

---

### DELETE `/api/flights/:id`

Cancel a flight booking.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN`

**URL Parameters:**
- `id` (number): Flight booking ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Flight cancelled successfully"
  }
}
```

---

### POST `/api/flights/:id/reschedule-options`

Generate AI-powered reschedule options for a flight.

**Authentication:** Required  
**Roles:** `STUDENT` (only for their own flights)

**URL Parameters:**
- `id` (number): Flight booking ID

**Prerequisites:**
- Flight must be in `WEATHER_HOLD` status OR have an unsafe weather check
- Must have an active weather conflict

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "flightId": 1,
    "currentScheduledDate": "2024-03-20T10:00:00.000Z",
    "reason": "Weather conditions do not meet minimums for student pilot",
    "options": [
      {
        "priority": 1,
        "suggestedDate": "2024-03-21T10:00:00.000Z",
        "reasoning": "Next available weather window with clear skies, same instructor and aircraft available",
        "weatherForecast": "Clear skies, visibility 10 mi, winds 5 kt",
        "confidence": 0.95,
        "instructorAvailable": true,
        "aircraftAvailable": true
      },
      {
        "priority": 2,
        "suggestedDate": "2024-03-21T14:00:00.000Z",
        "reasoning": "Afternoon slot with excellent conditions, same day as priority 1",
        "weatherForecast": "Clear skies, visibility 10 mi, winds 7 kt",
        "confidence": 0.90,
        "instructorAvailable": true,
        "aircraftAvailable": true
      },
      {
        "priority": 3,
        "suggestedDate": "2024-03-22T10:00:00.000Z",
        "reasoning": "Next day option with similar conditions",
        "weatherForecast": "Few clouds at 5000 ft, visibility 10 mi, winds 6 kt",
        "confidence": 0.85,
        "instructorAvailable": true,
        "aircraftAvailable": true
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Flight is safe (no weather conflict detected)
- `403` - Not authorized (not the student who owns the flight)
- `404` - Flight not found

---

### POST `/api/flights/:id/confirm-reschedule`

Confirm a reschedule option and create a new flight.

**Authentication:** Required  
**Roles:** `STUDENT` (only for their own flights)

**URL Parameters:**
- `id` (number): Original flight booking ID

**Request Body:**
```json
{
  "newScheduledDate": "2024-03-21T10:00:00.000Z",
  "aiReasoning": "Next available weather window with clear skies, same instructor and aircraft available"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "originalFlight": {
      "id": 1,
      "status": "CANCELLED"
    },
    "newFlight": {
      "id": 5,
      "scheduledDate": "2024-03-21T10:00:00.000Z",
      "status": "CONFIRMED",
      /* ... full flight details ... */
    },
    "rescheduleEvent": {
      "id": 1,
      "reason": "WEATHER",
      "aiReasoning": "Next available weather window with clear skies..."
    }
  }
}
```

**Error Responses:**
- `400` - Validation error, availability conflict
- `403` - Not authorized
- `404` - Flight not found

---

### GET `/api/flights/:id/history`

Get complete flight history timeline (all changes and actions).

**Authentication:** Required

**Access Control:**
- **Students**: Can view history for their own flights
- **Instructors**: Can view history for flights assigned to them
- **Admins**: Can view history for any flight

**URL Parameters:**
- `id` (number): Flight booking ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "CREATED",
      "description": "Flight created",
      "changes": null,
      "performedBy": {
        "id": 1,
        "name": "Admin User",
        "role": "ADMIN"
      },
      "timestamp": "2024-03-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "action": "STATUS_CHANGED",
      "description": "Status changed from CONFIRMED to WEATHER_HOLD",
      "changes": {
        "status": {
          "old": "CONFIRMED",
          "new": "WEATHER_HOLD"
        }
      },
      "performedBy": {
        "id": 1,
        "name": "System",
        "role": "SYSTEM"
      },
      "timestamp": "2024-03-19T15:30:00.000Z"
    }
  ]
}
```

**Action Types:**
- `CREATED` - Flight was created
- `UPDATED` - Flight details were updated
- `CANCELLED` - Flight was cancelled
- `COMPLETED` - Flight was completed
- `RESCHEDULED` - Flight was rescheduled
- `STATUS_CHANGED` - Flight status changed

---

### GET `/api/flights/:id/notes`

Get all notes for a flight.

**Authentication:** Required

**Access Control:** Same as flight history

**URL Parameters:**
- `id` (number): Flight booking ID

**Query Parameters:**
- `noteType` (optional): Filter by note type (`PRE_FLIGHT`, `POST_FLIGHT`, `DEBRIEF`, `GENERAL`, `INSTRUCTOR_NOTES`, `STUDENT_NOTES`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "noteType": "PRE_FLIGHT",
      "content": "Pre-flight inspection completed. All systems normal.",
      "createdBy": {
        "id": 1,
        "name": "John Smith",
        "role": "INSTRUCTOR"
      },
      "createdAt": "2024-03-20T09:30:00.000Z",
      "updatedAt": "2024-03-20T09:30:00.000Z"
    }
  ]
}
```

---

### POST `/api/flights/:id/notes`

Create a new flight note.

**Authentication:** Required

**URL Parameters:**
- `id` (number): Flight booking ID

**Request Body:**
```json
{
  "noteType": "POST_FLIGHT",
  "content": "Excellent performance on crosswind landing. Continue practicing."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "noteType": "POST_FLIGHT",
    "content": "Excellent performance on crosswind landing. Continue practicing.",
    "createdBy": { /* user object */ },
    "createdAt": "2024-03-20T12:00:00.000Z",
    "updatedAt": "2024-03-20T12:00:00.000Z"
  }
}
```

---

### POST `/api/flights/:id/training-hours`

Log training hours for a completed flight.

**Authentication:** Required

**URL Parameters:**
- `id` (number): Flight booking ID

**Request Body:**
```json
{
  "category": "FLIGHT",
  "hours": 2.0,
  "notes": "Cross-country navigation training"
}
```

**Field Descriptions:**
- `category` (string, required): One of `GROUND`, `FLIGHT`, `SIMULATOR`
- `hours` (number, required): Hours logged (decimal allowed)
- `notes` (string, optional): Additional notes

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": "FLIGHT",
    "hours": 2.0,
    "notes": "Cross-country navigation training",
    "flightId": 1,
    "createdAt": "2024-03-20T12:00:00.000Z"
  }
}
```

---

### POST `/api/flights/:id/weather-briefing`

Generate AI-powered weather briefing for a flight.

**Authentication:** Required

**Access Control:**
- **Students**: Can generate briefings for their own flights
- **Instructors**: Can generate briefings for flights assigned to them
- **Admins**: Can generate briefings for any flight

**URL Parameters:**
- `id` (number): Flight booking ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": "The current weather at Houston Hobby (KHOU) is clear with good visibility...",
    "currentConditions": {
      "description": "Clear skies with no cloud cover...",
      "visibility": 6.21,
      "ceiling": null,
      "windSpeed": 9.99,
      "temperature": 71,
      "precipitation": false,
      "thunderstorms": false,
      "icing": false
    },
    "forecast": {
      "description": "The forecast indicates clear skies...",
      "expectedChanges": ["No significant changes expected..."],
      "timeRange": "2:58 AM - 5:00 AM"
    },
    "riskAssessment": {
      "level": "LOW",
      "factors": ["Clear skies", "Visibility above minimum", "No precipitation"],
      "summary": "The risk level for this flight is LOW..."
    },
    "recommendation": {
      "action": "PROCEED",
      "reasoning": "Current conditions are within your training limits...",
      "alternatives": []
    },
    "historicalComparison": {
      "similarConditions": [
        {
          "date": "8/11/2023",
          "conditions": "Clear skies, light winds",
          "outcome": "Flight completed successfully"
        }
      ],
      "trends": "Similar weather conditions have historically supported safe flight operations.",
      "confidence": 0.85
    },
    "confidence": 0.95,
    "generatedAt": "2024-03-20T10:00:00.000Z",
    "expiresAt": "2024-03-20T11:00:00.000Z"
  }
}
```

**Notes:**
- Briefings are cached for 1 hour (TTL)
- Cache is automatically invalidated when weather data updates
- Uses OpenAI GPT-4o-mini for natural language generation
- Personalized based on student's training level

---

### GET `/api/flights/:id/weather-briefing`

Get cached weather briefing for a flight (if available and not expired).

**Authentication:** Required

**Access Control:** Same as POST endpoint

**URL Parameters:**
- `id` (number): Flight booking ID

**Response (200 OK):**
Same format as POST endpoint, or returns cached briefing if available.

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No cached briefing available. Generate a new briefing first.",
  "error": {
    "message": "No cached briefing available. Generate a new briefing first.",
    "statusCode": 404
  }
}
```

---

## Weather Endpoints

### GET `/api/weather/demo-scenarios`

Get available demo weather scenarios and current demo mode status.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "demoModeEnabled": true,
    "scenarios": [
      {
        "id": "clear-skies",
        "name": "Clear Skies",
        "description": "Perfect flying weather for all training levels",
        "affectsTrainingLevels": []
      },
      {
        "id": "student-conflict",
        "name": "Student Pilot Conflict",
        "description": "Conditions unsafe for student pilots (low ceiling/visibility)",
        "affectsTrainingLevels": ["STUDENT_PILOT"]
      },
      {
        "id": "private-conflict",
        "name": "Private Pilot Conflict",
        "description": "Marginal VFR conditions unsafe for private pilots",
        "affectsTrainingLevels": ["STUDENT_PILOT", "PRIVATE_PILOT"]
      },
      {
        "id": "instrument-conflict",
        "name": "Instrument Conflict",
        "description": "Severe weather - unsafe for all pilots",
        "affectsTrainingLevels": ["STUDENT_PILOT", "PRIVATE_PILOT", "INSTRUMENT_RATED"]
      },
      {
        "id": "marginal",
        "name": "Marginal Conditions",
        "description": "Borderline flyable - tests weather minimum thresholds",
        "affectsTrainingLevels": []
      }
    ]
  }
}
```

---

### POST `/api/weather/toggle-demo`

Toggle demo mode on/off.

**Authentication:** Required  
**Roles:** `ADMIN`

**Request Body:**
```json
{
  "enabled": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "demoModeEnabled": true,
    "message": "Demo mode enabled"
  }
}
```

---

### POST `/api/weather/briefing`

Generate custom AI weather briefing for any location and time.

**Authentication:** Required

**Request Body:**
```json
{
  "location": {
    "name": "KHOU",
    "lat": 29.6454,
    "lon": -95.2789
  },
  "dateTime": "2024-03-20T10:00:00.000Z",
  "trainingLevel": "STUDENT_PILOT"
}
```

**Field Descriptions:**
- `location` (object, required): Airport location with name, lat, lon
- `dateTime` (string, required): ISO 8601 datetime for the flight
- `trainingLevel` (string, required): One of `STUDENT_PILOT`, `PRIVATE_PILOT`, `INSTRUMENT_RATED`

**Response (200 OK):**
Same format as flight-specific weather briefing endpoint.

**Notes:**
- Generates personalized briefing based on training level
- Includes risk assessment and recommendations
- Compares with historical weather data when available
- Briefings are cached with 1-hour TTL

---

### POST `/api/weather/trigger-check`

Manually trigger a weather check for all flights.

**Authentication:** Required  
**Roles:** `ADMIN`

**Request Body (Optional):**
```json
{
  "demoScenarioId": "student-conflict"
}
```

**Field Descriptions:**
- `demoScenarioId` (string, optional): ID of demo scenario to apply (requires demo mode enabled)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Weather check triggered successfully",
    "flightsChecked": 12,
    "conflictsDetected": 3,
    "notificationsSent": 6,
    "results": [
      {
        "flightId": 1,
        "status": "WEATHER_HOLD",
        "reason": "Visibility below minimums for student pilot"
      },
      {
        "flightId": 2,
        "status": "CONFIRMED",
        "reason": "Weather conditions acceptable"
      }
    ]
  }
}
```

**Notes:**
- Checks all flights scheduled in the next 48 hours
- Applies the specified demo scenario if demo mode is enabled
- Sends notifications to affected students and instructors
- Updates flight status to `WEATHER_HOLD` for unsafe flights

---

## Student Management Endpoints

### GET `/api/students`

Get all students.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "phone": "+1234567890",
      "trainingLevel": "STUDENT_PILOT",
      "medicalCertificateExpiry": "2025-03-15T00:00:00.000Z",
      "totalFlightHours": 25.5,
      "soloHours": 5.0,
      "userId": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-03-15T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/students/:id`

Get a single student by ID.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN`, `STUDENT` (only own profile)

**URL Parameters:**
- `id` (number): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sarah Johnson",
    "email": "sarah.johnson@example.com",
    "phone": "+1234567890",
    "trainingLevel": "STUDENT_PILOT",
    "medicalCertificateExpiry": "2025-03-15T00:00:00.000Z",
    "totalFlightHours": 25.5,
    "soloHours": 5.0,
    "userId": 2,
    "user": {
      "id": 2,
      "email": "sarah.johnson@example.com",
      "role": "STUDENT"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-03-15T00:00:00.000Z"
  }
}
```

---

### POST `/api/students`

Create a new student.

**Authentication:** Required  
**Roles:** `ADMIN`

**Request Body:**
```json
{
  "email": "newstudent@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+1987654321",
  "trainingLevel": "PRIVATE_PILOT",
  "medicalCertificateExpiry": "2025-12-31T00:00:00.000Z",
  "totalFlightHours": 50.0,
  "soloHours": 10.0
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Jane Doe",
    "email": "newstudent@example.com",
    /* ... student details ... */
  }
}
```

---

### PUT `/api/students/:id`

Update a student.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN`

**URL Parameters:**
- `id` (number): Student ID

**Request Body:** (All fields optional)
```json
{
  "name": "Jane Doe Updated",
  "phone": "+1555555555",
  "trainingLevel": "INSTRUMENT_RATED",
  "totalFlightHours": 75.5,
  "soloHours": 20.0
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    /* updated student object */
  }
}
```

---

### DELETE `/api/students/:id`

Delete a student.

**Authentication:** Required  
**Roles:** `ADMIN`

**URL Parameters:**
- `id` (number): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Student deleted successfully"
  }
}
```

---

### GET `/api/students/:id/flight-history`

Get complete flight history for a student.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN`, `STUDENT` (only own history)

**URL Parameters:**
- `id` (number): Student ID

**Query Parameters:**
- `action` (optional): Filter by action type
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "CREATED",
      "description": "Flight created",
      "flight": { /* flight object */ },
      "performedBy": { /* user object */ },
      "timestamp": "2024-03-15T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/students/:id/training-hours`

Get training hours summary for a student.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN`, `STUDENT` (only own hours)

**URL Parameters:**
- `id` (number): Student ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalHours": 45.5,
    "categories": {
      "GROUND": 10.0,
      "FLIGHT": 30.5,
      "SIMULATOR": 5.0
    },
    "recentHours": [
      {
        "id": 1,
        "category": "FLIGHT",
        "hours": 2.0,
        "flight": { /* flight object */ },
        "createdAt": "2024-03-20T12:00:00.000Z"
      }
    ]
  }
}
```

---

## Instructor Management Endpoints

### GET `/api/instructors`

Get all instructors.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN` (needed for flight creation)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john.smith@flightpro.com",
      "phone": "+1234567890",
      "certifications": ["CFI", "CFII", "MEI"],
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-03-15T00:00:00.000Z"
    }
  ]
}
```

**Note:** This endpoint is accessible to instructors and admins (not just admins) to support flight creation functionality.

---

### POST `/api/instructors`

Create a new instructor.

**Authentication:** Required  
**Roles:** `ADMIN`

**Request Body:**
```json
{
  "email": "newinstructor@flightpro.com",
  "password": "password123",
  "name": "Jane Instructor",
  "phone": "+1987654321",
  "certifications": ["CFI", "CFII"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "instructor": {
      "id": 4,
      "name": "Jane Instructor",
      "email": "newinstructor@flightpro.com",
      /* ... instructor details ... */
    }
  }
}
```

---

### GET `/api/instructors/:id`

Get a single instructor by ID.

**Authentication:** Required  
**Roles:** `ADMIN`

**URL Parameters:**
- `id` (number): Instructor ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john.smith@flightpro.com",
    /* ... instructor details ... */
  }
}
```

---

### GET `/api/instructors/:id/flight-history`

Get complete flight history for an instructor.

**Authentication:** Required  
**Roles:** `INSTRUCTOR` (only own history), `ADMIN`

**URL Parameters:**
- `id` (number): Instructor ID

**Query Parameters:**
- `action` (optional): Filter by action type
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response (200 OK):**
Same format as student flight history endpoint.

---

## Aircraft Management Endpoints

### GET `/api/aircraft`

Get all aircraft.

**Authentication:** Required  
**Roles:** `INSTRUCTOR`, `ADMIN` (needed for flight creation)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tailNumber": "N12345",
      "model": "Cessna 172",
      "type": "SINGLE_ENGINE",
      "flightCount": 150,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-03-15T00:00:00.000Z"
    }
  ]
}
```

**Note:** This endpoint is accessible to instructors and admins (not just admins) to support flight creation functionality.

---

### GET `/api/aircraft/:id`

Get a single aircraft by ID.

**Authentication:** Required  
**Roles:** `ADMIN`

**URL Parameters:**
- `id` (number): Aircraft ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tailNumber": "N12345",
    "model": "Cessna 172",
    "type": "SINGLE_ENGINE",
    "flightCount": 150,
    "recentFlights": [ /* recent flight objects */ ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-03-15T00:00:00.000Z"
  }
}
```

---

## Airport Management Endpoints

### GET `/api/airports`

Get all airports.

**Authentication:** Required (all authenticated users)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "icao": "KJFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "latitude": 40.6413,
      "longitude": -73.7781
    }
  ]
}
```

**Note:** This endpoint is accessible to all authenticated users (not just admins) to support weather briefing and flight creation functionality.

---

## Flight Notes Management Endpoints

### PUT `/api/notes/:id`

Update a flight note.

**Authentication:** Required

**Access Control:**
- Users can only update their own notes
- Admins can update any note

**URL Parameters:**
- `id` (number): Note ID

**Request Body:**
```json
{
  "content": "Updated note content"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "noteType": "POST_FLIGHT",
    "content": "Updated note content",
    "updatedAt": "2024-03-20T13:00:00.000Z"
  }
}
```

---

### DELETE `/api/notes/:id`

Delete a flight note.

**Authentication:** Required

**Access Control:**
- Users can only delete their own notes
- Admins can delete any note

**URL Parameters:**
- `id` (number): Note ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Note deleted successfully"
  }
}
```

---

## Notification Endpoints

### GET `/api/notifications`

Get all notifications for the authenticated user.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "WEATHER_ALERT",
      "title": "Weather Alert",
      "message": "Your flight on 2024-03-20 at 10:00 AM has been placed on weather hold due to unsafe conditions.",
      "isRead": false,
      "userId": 2,
      "relatedFlightId": 1,
      "createdAt": "2024-03-19T15:30:00.000Z"
    },
    {
      "id": 2,
      "type": "RESCHEDULE_AVAILABLE",
      "title": "Reschedule Options Available",
      "message": "AI has generated reschedule options for your flight. Review them now.",
      "isRead": false,
      "userId": 2,
      "relatedFlightId": 1,
      "createdAt": "2024-03-19T15:31:00.000Z"
    }
  ]
}
```

**Notification Types:**
- `FLIGHT_CONFIRMED` - Flight booking confirmed
- `FLIGHT_CANCELLED` - Flight cancelled
- `WEATHER_ALERT` - Weather conflict detected
- `RESCHEDULE_AVAILABLE` - AI reschedule options generated
- `RESCHEDULE_CONFIRMED` - Reschedule confirmed

---

### GET `/api/notifications/unread-count`

Get count of unread notifications.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### PUT `/api/notifications/:id/read`

Mark a notification as read.

**Authentication:** Required

**URL Parameters:**
- `id` (number): Notification ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isRead": true,
    /* ... notification details ... */
  }
}
```

---

### PUT `/api/notifications/read-all`

Mark all notifications as read.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read",
    "count": 5
  }
}
```

---

### DELETE `/api/notifications/:id`

Delete a notification.

**Authentication:** Required

**URL Parameters:**
- `id` (number): Notification ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

---

## Error Codes Reference

### 400 - Bad Request
**Common Causes:**
- Missing required fields
- Invalid data format
- Validation errors
- Business logic violations (e.g., instructor/aircraft conflicts)

**Example:**
```json
{
  "success": false,
  "error": {
    "message": "Instructor is not available at the scheduled time",
    "statusCode": 400
  }
}
```

### 401 - Unauthorized
**Common Causes:**
- Missing JWT token
- Invalid/expired JWT token
- Token signature verification failed

**Example:**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "statusCode": 401
  }
}
```

### 403 - Forbidden
**Common Causes:**
- Insufficient role permissions
- Attempting to access another user's resources

**Example:**
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Admin role required",
    "statusCode": 403
  }
}
```

### 404 - Not Found
**Common Causes:**
- Resource doesn't exist
- Invalid ID parameter

**Example:**
```json
{
  "success": false,
  "error": {
    "message": "Flight not found",
    "statusCode": 404
  }
}
```

### 500 - Internal Server Error
**Common Causes:**
- Unexpected server errors
- Database connection issues
- External API failures

**Example:**
```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "statusCode": 500
  }
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. For production deployment, consider adding rate limiting to prevent abuse.

**Recommended Limits:**
- Authentication endpoints: 5 requests per minute per IP
- General endpoints: 100 requests per minute per user
- Weather check trigger: 1 request per minute (admin only)

---

## Versioning

Current API version: `v1`

The API does not currently use versioning in the URL. Future versions may use `/api/v2/` prefixes.

---

## Support

For issues or questions about the API:
1. Check the main README.md for setup instructions
2. Review the backend/README.md for architecture details
3. See the test files in `src/tests/` for usage examples

---

**Last Updated:** 2024-12-19  
**API Version:** 1.0.0  
**Project Status:** ✅ COMPLETE - Production Ready

## Implementation Status

All documented endpoints are fully implemented and tested. The API includes:

✅ **Core Features:**
- Authentication and authorization
- Flight management with conflict detection
- Weather monitoring and alerts
- AI-powered rescheduling
- AI-powered weather briefings
- Flight history and audit trail
- Flight notes management
- Training hours tracking
- Real-time notifications
- Student, instructor, and aircraft management

✅ **Recent Enhancements:**
- Flight creation validation (student, instructor, aircraft existence checks)
- Enhanced error messages (message at top level)
- Weather briefing caching with automatic invalidation
- Complete flight history tracking
- Training hours logging and summaries
- Improved endpoint access controls (instructors and aircraft endpoints accessible to instructors)

🚀 **Future Enhancements:**
- Smart Conflict Resolution (PRs 29-30) - Documented for future implementation
- AWS Deployment (PRs 18-20) - Documented for future implementation

