# SkyGuard-Scheduler API Documentation

Complete API reference for SkyGuard-Scheduler backend endpoints.

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
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

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
- `400` - Validation error, instructor/aircraft conflict
- `404` - Student, instructor, or aircraft not found

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

**Last Updated:** 2024-03-15  
**API Version:** 1.0.0

