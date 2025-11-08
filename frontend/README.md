# SkyGuard-Scheduler Frontend

React-based frontend for SkyGuard-Scheduler, providing role-based dashboards for students, instructors, and administrators.

## 🎨 Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   │   ├── LoginForm.tsx (Enhanced with icons, password toggle, remember me)
│   │   │   └── ProtectedRoute.tsx
│   │   ├── common/         # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Modal.tsx
│   │   ├── dashboard/      # Dashboard components
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── InstructorDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── MetricsCard.tsx
│   │   ├── flights/        # Flight management components
│   │   │   ├── FlightList.tsx
│   │   │   ├── FlightCard.tsx
│   │   │   ├── FlightDetails.tsx (with Weather Briefing integration)
│   │   │   ├── CreateFlightForm.tsx (with real API data)
│   │   │   ├── FlightHistoryTimeline.tsx
│   │   │   ├── FlightNotes.tsx
│   │   │   └── TrainingHoursCard.tsx
│   │   ├── weather/        # Weather components
│   │   │   ├── WeatherAlertCard.tsx
│   │   │   ├── WeatherAlertList.tsx
│   │   │   ├── WeatherScenarioSelector.tsx
│   │   │   ├── WeatherBriefingCard.tsx
│   │   │   └── WeatherBriefingModal.tsx
│   │   ├── reschedule/     # Rescheduling components
│   │   │   ├── RescheduleOptionsModal.tsx
│   │   │   └── RescheduleOptionCard.tsx
│   │   ├── notifications/  # Notification components
│   │   │   ├── NotificationBell.tsx
│   │   │   └── NotificationList.tsx
│   │   └── layout/         # Layout components
│   │       ├── Layout.tsx
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── pages/              # Page components
│   │   ├── Login.tsx (Enhanced two-column layout)
│   │   ├── Dashboard.tsx
│   │   ├── Flights.tsx
│   │   ├── Weather.tsx
│   │   └── FlightHistory.tsx
│   ├── services/           # API clients
│   │   ├── api.ts          # Axios configuration
│   │   ├── auth.service.ts
│   │   ├── flights.service.ts
│   │   ├── weather.service.ts
│   │   ├── weatherBriefing.service.ts
│   │   ├── flightHistory.service.ts
│   │   ├── students.service.ts
│   │   ├── instructors.service.ts
│   │   ├── aircraft.service.ts
│   │   └── notifications.service.ts
│   ├── store/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── flightsStore.ts
│   │   ├── flightHistoryStore.ts
│   │   └── notificationsStore.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useNotifications.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── styles/             # Global styles
│   │   └── index.css
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🎭 User Roles & Features

### Student
**Dashboard:**
- Upcoming flights (next 5)
- Recent weather alerts
- Training progress metrics
- Total flight hours

**Flights Page:**
- View own flights only
- Filter by status (all, confirmed, weather hold, cancelled)
- View detailed flight information
- Request AI reschedule options for weather-affected flights
- Confirm reschedule options

**Notifications:**
- Flight confirmations
- Weather alerts for their flights
- Reschedule options available
- Reschedule confirmations

### Instructor
**Dashboard:**
- Today's schedule
- This week's flights
- Active students count
- Weather alerts for assigned flights

**Flights Page:**
- View flights assigned to them
- See student details for each flight
- Monitor weather-affected flights
- No reschedule capabilities (students handle their own)

**Notifications:**
- Flight assignments
- Cancellations
- Weather holds for their flights

### Admin
**Dashboard:**
- System-wide metrics (total flights, students, instructors)
- Recent flight activity (scrollable list view)
- Live weather alerts across all flights
- Demo mode controls
- Weather scenario selector
- Trigger manual weather check

**Flights Page:**
- View all flights in the system
- Create new flights
- Cancel any flight
- Manually trigger weather checks
- Access all flight details

**Weather Page:**
- System-wide weather statistics
- All weather alerts
- Demo mode toggle and controls
- Weather scenario selection

**Notifications:**
- System-wide alerts
- Critical weather issues

## 🗂️ State Management

### Zustand Stores

#### Auth Store (`authStore.ts`)
Manages authentication state:
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login: (credentials) => Promise<void>,
  logout: () => void,
  checkAuth: () => Promise<void>
}
```

Persisted to `localStorage` for session management.

#### Flights Store (`flightsStore.ts`)
Manages flight data:
```typescript
{
  flights: Flight[],
  selectedFlight: Flight | null,
  loading: boolean,
  error: string | null,
  fetchFlights: (filters?) => Promise<void>,
  fetchFlightById: (id) => Promise<void>,
  createFlight: (data) => Promise<void>,
  cancelFlight: (id) => Promise<void>
}
```

#### Notifications Store (`notificationsStore.ts`)
Manages notifications:
```typescript
{
  notifications: Notification[],
  unreadCount: number,
  loading: boolean,
  fetchNotifications: () => Promise<void>,
  markAsRead: (id) => Promise<void>,
  markAllAsRead: () => Promise<void>,
  deleteNotification: (id) => Promise<void>
}
```

## 🎨 Component Architecture

### Common Components

**Button** - Reusable button with variants:
- `primary` - Blue background
- `secondary` - Gray background
- `danger` - Red background
- Supports `disabled` and `isLoading` states

**Card** - Container component with consistent styling:
- Optional title
- Optional onClick for clickable cards
- Consistent padding and shadows

**Input** - Form input with label and error display:
- Email, password, text, number types
- Error state styling
- Label and placeholder support

**Select** - Dropdown select with label:
- Option mapping from arrays
- Error state styling

**Modal** - Reusable modal dialog:
- Size variants (small, medium, large)
- Backdrop click to close
- Close button

### Layout Components

**Layout** - Main app layout wrapper:
- Navbar (top)
- Sidebar (left, responsive)
- Main content area

**Navbar** - Top navigation:
- App logo/title
- User info and role
- Notification bell
- Logout button

**Sidebar** - Left navigation:
- Dashboard link
- Flights link
- Weather link (admin only)
- Role-based link visibility

## 🔐 Authentication & Routing

### Protected Routes
All routes except `/login` are protected and require authentication:

```tsx
<Route element={<ProtectedRoute />}>
  <Route element={<Layout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/flights" element={<Flights />} />
    <Route path="/weather" element={<ProtectedRoute allowedRoles={['ADMIN']}><Weather /></ProtectedRoute>} />
  </Route>
</Route>
```

### Role-Based Access
- `ProtectedRoute` component checks authentication
- Optional `allowedRoles` prop restricts access
- Automatically redirects unauthorized users

### Auto-Login
On app load:
1. Check `localStorage` for token
2. Verify token with backend (`GET /api/auth/me`)
3. Restore user session if valid
4. Redirect to login if invalid

## 🎨 Styling

### Tailwind CSS
Utility-first CSS framework configured with custom theme:

**Colors:**
- Primary: Blue (`primary-50` to `primary-900`)
- Success: Green
- Warning: Yellow
- Danger: Red
- Neutral: Gray

**Custom Classes:**
- `.btn` - Base button styles
- `.btn-primary`, `.btn-secondary`, `.btn-danger` - Button variants
- `.card` - Card container styles
- `.badge` - Status badge styles

### Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile
- Tables become scrollable
- Grid layouts adapt to screen size

## 🔔 Notifications

### In-App Notifications
- Bell icon with unread count badge
- Dropdown list with notification details
- Mark as read/delete actions
- Auto-refresh every 30 seconds

### Toast Notifications
Using `react-hot-toast` for temporary alerts:
- Success messages (green)
- Error messages (red)
- Info messages (blue)
- Auto-dismiss after 3-5 seconds

## 🚀 API Integration

### Axios Configuration
Base configuration in `services/api.ts`:
- Base URL from environment variable
- JWT token interceptor (auto-adds to headers)
- Error interceptor (handles 401, shows errors)

### Service Pattern
Each API domain has a dedicated service file:

**auth.service.ts:**
- `login(credentials)` - Login user
- `register(data)` - Register new user
- `getCurrentUser()` - Get current user
- `logout()` - Clear local storage

**flights.service.ts:**
- `getFlights(filters?)` - Get flights
- `getFlightById(id)` - Get single flight
- `createFlight(data)` - Create new flight (with validation)
- `cancelFlight(id)` - Cancel flight
- `getRescheduleOptions(flightId)` - Get AI options
- `confirmReschedule(flightId, data)` - Confirm reschedule

**weatherBriefing.service.ts:**
- `generateFlightBriefing(flightId)` - Generate AI weather briefing
- `getFlightBriefing(flightId)` - Get cached briefing
- `generateCustomBriefing(data)` - Generate custom briefing

**flightHistory.service.ts:**
- `getFlightHistory(flightId)` - Get flight history timeline
- `getStudentHistory(studentId, filters?)` - Get student history
- `getInstructorHistory(instructorId, filters?)` - Get instructor history
- `getFlightNotes(flightId)` - Get flight notes
- `createNote(flightId, data)` - Create note
- `updateNote(noteId, data)` - Update note
- `deleteNote(noteId)` - Delete note
- `logTrainingHours(flightId, data)` - Log training hours
- `getTrainingHoursSummary(studentId)` - Get training hours summary

**weather.service.ts:**
- `getDemoScenarios()` - Get demo scenarios
- `toggleDemoMode()` - Toggle demo mode
- `triggerWeatherCheck(scenario?)` - Trigger check

**notifications.service.ts:**
- `getNotifications()` - Get all notifications
- `getUnreadCount()` - Get unread count
- `markAsRead(id)` - Mark as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification

## 🧪 Demo Mode

Demo mode is accessible only to admins:

1. Navigate to Dashboard (as admin)
2. Find "Demo Mode Controls" card
3. Toggle demo mode ON
4. Select a weather scenario:
   - Clear Skies
   - Student Conflict
   - Private Conflict
   - Instrument Conflict
   - Marginal
5. Click "Trigger Weather Check"

**Visual Feedback:**
- Button disabled when demo mode is OFF
- Button changes color based on state
- Polling for demo mode status (every 2 seconds)
- Toast notifications on success/error

## 🛠️ Development

### Running the Frontend

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Type check
npm run type-check
```

### Environment Variables

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

In production:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Hot Module Replacement (HMR)
Vite provides instant HMR for React components. Changes are reflected immediately without full page reload.

### Development Best Practices

1. **Component Organization:**
   - Keep components small and focused
   - Use composition over inheritance
   - Extract reusable logic to custom hooks

2. **State Management:**
   - Use Zustand stores for global state
   - Use local state for component-specific data
   - Avoid prop drilling with stores

3. **Type Safety:**
   - Define interfaces in `types/index.ts`
   - Use proper TypeScript types
   - Avoid `any` types

4. **Error Handling:**
   - Try-catch in async functions
   - Show user-friendly error messages
   - Use toast notifications for feedback

## 🧪 Testing

Tests are written with Vitest and React Testing Library:

### Test Files
- `src/tests/store/authStore.test.ts` - Auth store tests
- `src/tests/store/notificationsStore.test.ts` - Notifications store tests
- `src/tests/services/auth.service.test.ts` - Auth service tests
- `src/tests/components/auth/ProtectedRoute.test.tsx` - Component tests

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- authStore.test.ts
```

See `src/tests/README.md` for more details.

## 🎯 Key Features Implementation

### AI Rescheduling Flow
1. Student sees flight with weather alert
2. Clicks "View Reschedule Options" button
3. Modal opens, fetches AI-generated options
4. Student reviews 3 options with reasoning
5. Student selects and confirms preferred option
6. System creates new flight, cancels old one
7. Notifications sent to student and instructor

### Weather Monitoring
1. Admin enables demo mode
2. Admin selects weather scenario
3. Admin triggers weather check
4. Backend checks all flights in next 48 hours
5. Unsafe flights moved to `WEATHER_HOLD`
6. Notifications sent to affected users
7. Dashboard updates with alerts

### Real-Time Notifications
1. Backend creates notification on events
2. Frontend polls every 30 seconds for new notifications
3. Bell icon shows unread count badge
4. Dropdown shows notification list
5. User can mark as read or delete
6. Store updates automatically

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

Output in `dist/` directory:
- Optimized and minified JavaScript
- CSS extracted and minified
- Static assets with hashed filenames
- Ready for CDN deployment

### Deployment Options

**Static Hosting (S3, Netlify, Vercel):**
1. Build the project: `npm run build`
2. Upload `dist/` folder
3. Configure environment variables
4. Set up routing (SPA mode)

**CDN with CloudFront:**
1. Upload to S3 bucket
2. Create CloudFront distribution
3. Configure custom domain
4. Enable HTTPS

## 🎨 UI/UX Highlights

- **Modern Login Experience:** Two-column layout with branding panel, gradient backgrounds, input icons, password toggle, and remember me functionality
- **Consistent Design:** Tailwind CSS utilities ensure consistency
- **Responsive:** Mobile-first design works on all devices (login stacks on mobile)
- **Loading States:** Spinners and skeletons for async operations
- **Error Handling:** User-friendly error messages with proper validation
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation
- **Visual Feedback:** Toast notifications, color-coded statuses
- **Intuitive Navigation:** Clear role-based navigation
- **Enhanced Forms:** Real-time validation, icon-enhanced inputs, better UX

## 📄 License

[Add license information]

