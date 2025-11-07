import { useAuth } from '../hooks/useAuth';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { InstructorDashboard } from '../components/dashboard/InstructorDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';

export function Dashboard() {
  const { user, isAdmin, isInstructor, isStudent } = useAuth();

  // Route to correct dashboard based on user role
  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isInstructor) {
    return <InstructorDashboard />;
  }

  if (isStudent) {
    return <StudentDashboard />;
  }

  // Default fallback for unauthenticated or unknown roles
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
      <p className="text-gray-600">Welcome to SkyGuard Scheduler!</p>
      <p className="text-gray-500 text-sm mt-2">Please log in to view your dashboard.</p>
    </div>
  );
}

