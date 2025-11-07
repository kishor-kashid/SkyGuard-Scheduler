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

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SkyGuard-Scheduler
   ```

2. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.template .env
   # Edit .env with your configuration
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

4. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.template .env
   # Edit .env with your configuration
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Prisma Studio: `cd backend && npx prisma studio`

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

## 🧪 Testing

The system includes a **Demo Mode** with 5 pre-built weather scenarios:
- Clear skies
- Student conflict
- Private conflict
- Instrument conflict
- Marginal conditions

Enable demo mode in the admin dashboard to test without real weather API calls.

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
