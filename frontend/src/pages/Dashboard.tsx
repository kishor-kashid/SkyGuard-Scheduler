import { useAuthStore } from '../store/authStore';
import { Card } from '../components/common/Card';

export function Dashboard() {
  const { user } = useAuthStore();

  const getRoleDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
            <p className="text-gray-600">Welcome, Administrator! Manage flights, students, and system settings.</p>
          </div>
        );
      case 'INSTRUCTOR':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor Dashboard</h2>
            <p className="text-gray-600">Welcome, Instructor! View your scheduled flights and students.</p>
          </div>
        );
      case 'STUDENT':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Dashboard</h2>
            <p className="text-gray-600">Welcome, Student! View your upcoming flights and training progress.</p>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <p className="text-gray-600">Welcome to SkyGuard Scheduler!</p>
          </div>
        );
    }
  };

  return (
    <div>
      {getRoleDashboard()}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Upcoming Flights</h3>
          <p className="text-gray-600 text-sm">View and manage your scheduled flights</p>
        </Card>
        
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Weather Alerts</h3>
          <p className="text-gray-600 text-sm">Monitor weather conditions for your flights</p>
        </Card>
        
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
          <p className="text-gray-600 text-sm">Stay updated with important alerts</p>
        </Card>
      </div>
    </div>
  );
}

