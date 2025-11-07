# SkyGuard-Scheduler

An intelligent, automated system for monitoring weather conditions for scheduled flight lessons, detecting conflicts based on student training levels, and using AI to suggest optimal rescheduling options.

## 🎯 Project Overview

SkyGuard-Scheduler (Flight Schedule Pro) is an AI-powered solution that:
- **Automates** weather monitoring and flight conflict detection
- **Notifies** affected students and instructors in real-time
- **Generates** AI-powered rescheduling options that consider student training levels and availability
- **Tracks** all booking, cancellation, and reschedule data for analysis
- **Displays** active flight and weather alerts in a central React dashboard

## 🛠️ Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client

### Backend
- **Node.js** with Express and TypeScript
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database (Docker for local development)
- **JWT** - Authentication
- **node-cron** - Scheduled jobs
- **Nodemailer** - Email notifications

### AI & External Services
- **Vercel AI SDK** with OpenAI
- **OpenWeatherMap API** - Weather data

### Deployment
- **AWS** - Cloud platform (RDS, EC2, S3, CloudFront)

## 📁 Project Structure

```
flight-schedule-pro/
├── backend/              # Node.js/Express API
│   ├── prisma/          # Database schema and migrations
│   └── src/             # Source code
│       ├── config/      # Configuration
│       ├── middleware/  # Auth, validation, errors
│       ├── routes/      # API routes
│       ├── controllers/ # Route handlers
│       ├── services/    # Business logic
│       ├── utils/       # Utilities
│       ├── types/       # TypeScript types
│       └── jobs/        # Cron jobs
│
├── frontend/            # React application
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── hooks/       # Custom hooks
│       ├── services/    # API clients
│       ├── store/       # Zustand stores
│       ├── types/       # TypeScript types
│       └── styles/      # CSS files
│
├── memory-bank/         # Project documentation
├── docker-compose.yml   # Local PostgreSQL setup
└── .env.template        # Environment variable template
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Docker Desktop** (for local PostgreSQL)
- **Git**
- **OpenWeatherMap API Key** ([Get free API key](https://openweathermap.org/api))
- **OpenAI API Key** ([Get API key](https://platform.openai.com/api-keys))

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd SkyGuard-Scheduler
```

#### 2. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 with the following default credentials:
- Database: `skyguard_db`
- Username: `skyguard_user`
- Password: `skyguard_password`

#### 3. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in the `backend/` directory:
```bash
cp .env.template .env
```

Edit `backend/.env` with your configuration:
```env
DATABASE_URL="postgresql://skyguard_user:skyguard_password@localhost:5432/skyguard_db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="24h"
PORT=3000

# OpenWeatherMap API (required)
OPENWEATHER_API_KEY="your-openweathermap-api-key"

# OpenAI API (required for AI rescheduling)
OPENAI_API_KEY="your-openai-api-key"

# Email (optional - for email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="SkyGuard Scheduler <noreply@skyguard.com>"
```

Run database migrations and seed data:
```bash
npx prisma migrate dev
npx prisma db seed
```

Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

#### 4. Setup Frontend
Open a new terminal window:

```bash
cd frontend
npm install
```

Create `.env` file in the `frontend/` directory:
```bash
cp .env.template .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

### Test Accounts

After running the seed script, you can log in with these test accounts:

**Admin Account:**
- Email: `admin@flightpro.com`
- Password: `password123`
- Access: Full system access, demo mode controls, all flights

**Student Accounts:**
- Email: `sarah.johnson@example.com` / `password123`
  - Training Level: Student Pilot
- Email: `michael.chen@example.com` / `password123`
  - Training Level: Private Pilot
- Email: `emily.rodriguez@example.com` / `password123`
  - Training Level: Instrument Rated

**Instructor Accounts:**
- Email: `john.smith@flightpro.com` / `password123`
- Email: `jane.doe@flightpro.com` / `password123`

### Additional Tools

- **Prisma Studio** (Database GUI):
  ```bash
  cd backend
  npx prisma studio
  ```
  Access at `http://localhost:5555`

- **Backend Tests:**
  ```bash
  cd backend
  npm test
  ```

- **Frontend Tests:**
  ```bash
  cd frontend
  npm test
  ```

## 🔧 Environment Variables

See `.env.template` for required environment variables. Copy to `.env` and fill in your values:

- Database connection string
- JWT secret
- OpenWeatherMap API key
- OpenAI API key
- SMTP configuration for emails

## 📋 Features

### Core Functionality
- ✅ Automated weather monitoring (hourly checks)
- ✅ Training-level-aware conflict detection
- ✅ AI-powered rescheduling suggestions (3 options)
- ✅ Real-time notifications (email + in-app)
- ✅ Role-based dashboards (Student/Instructor/Admin)
- ✅ Demo mode for testing

### Weather Minimums by Training Level
- **Student Pilot:** Clear skies, visibility > 5 mi, winds < 10 kt
- **Private Pilot:** Visibility > 3 mi, ceiling > 1000 ft
- **Instrument Rated:** IMC acceptable, but no thunderstorms or icing

## 🧪 Demo Mode

The system includes a **Demo Mode** for testing without consuming real API credits.

### How to Use Demo Mode

1. Log in as admin (`admin@flightpro.com` / `password123`)
2. Navigate to the Dashboard
3. Find the "Demo Mode Controls" card
4. Toggle "Demo Mode" ON
5. Select a weather scenario:
   - **Clear Skies** - Perfect flying weather for all training levels
   - **Student Conflict** - Conditions unsafe for student pilots
   - **Private Conflict** - Conditions unsafe for private pilots
   - **Instrument Conflict** - Severe weather unsafe for all
   - **Marginal** - Borderline conditions for testing edge cases
6. Click "Trigger Weather Check"

The system will check all flights scheduled in the next **48 hours** and apply the selected scenario.

### What Happens

- Flights are checked against weather minimums for each student's training level
- Unsafe flights are automatically moved to `WEATHER_HOLD` status
- Notifications are sent to affected students and instructors
- Students can view AI-generated reschedule options
- Admins can see all weather alerts in the dashboard

## 🧪 Testing

### Running Tests

**Backend Tests (Jest):**
```bash
cd backend
npm test
```

Tests include:
- Unit tests for weather minimums
- Unit tests for auth service (JWT)
- Unit tests for conflict detection
- Integration tests for auth controller

**Frontend Tests (Vitest):**
```bash
cd frontend
npm test
```

Tests include:
- Unit tests for Zustand stores (auth, notifications)
- Unit tests for API services
- Component tests for ProtectedRoute

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose down
docker-compose up -d

# Reset database
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Port Already in Use
```bash
# Backend (port 3000)
# Find and kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Frontend (port 5173)
# Vite will automatically try the next available port
```

### API Keys Not Working
- Verify your OpenWeatherMap API key is active (may take a few hours after signup)
- Check OpenAI API key has sufficient credits
- Ensure environment variables are properly set in `.env` files

### Missing Dependencies
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- **PRD:** `flight_schedule_prd.md` - Product requirements
- **Task List:** `flight_schedule_tasklist.md` - Implementation roadmap
- **Memory Bank:** `memory-bank/` - Project context and documentation

## 🏗️ Development Roadmap

The project is organized into 20 PRs:
1. Project Setup & Infrastructure ✅
2. Database Schema & Prisma Setup
3. Authentication System
4. Weather Service Integration
5. AI Rescheduling Service
6. Flight Management System
7. Notification System
8. Scheduled Weather Monitoring
9. Students Management
10-15. Frontend Implementation
16-20. Testing, Documentation, Deployment

## 🤝 Contributing

This is a learning project focused on building an event-driven system with AI integration.

## 📄 License

[Add license information]

## 🎯 Success Criteria

- ✅ Weather conflicts automatically detected
- ✅ Notifications sent successfully
- ✅ AI generates 3 valid reschedule options
- ✅ Database updates accurately
- ✅ Dashboard displays live alerts
- ✅ AI considers training level correctly
