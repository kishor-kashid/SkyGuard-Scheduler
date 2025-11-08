import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import weatherRoutes from './routes/weather.routes';
import flightsRoutes from './routes/flights.routes';
import notificationsRoutes from './routes/notifications.routes';
import studentsRoutes from './routes/students.routes';
import instructorsRoutes from './routes/instructors.routes';
import aircraftRoutes from './routes/aircraft.routes';
import airportsRoutes from './routes/airports.routes';
import flightHistoryRoutes from './routes/flightHistory.routes';
import { flightBriefingRouter, customBriefingRouter } from './routes/weatherBriefing.routes';

const app: Application = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || 'http://localhost:5173'
      : 'http://localhost:5173',
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/instructors', instructorsRoutes);
app.use('/api/aircraft', aircraftRoutes);
app.use('/api/airports', airportsRoutes);
app.use('/api', flightHistoryRoutes);
app.use('/api/weather', customBriefingRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;

