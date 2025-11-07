import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { Button } from '../common/Button';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'INSTRUCTOR':
        return 'Instructor';
      case 'STUDENT':
        return 'Student';
      default:
        return 'User';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-900">SkyGuard Scheduler</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-medium">{user.name || user.email}</span>
                <span className="text-gray-500">({getRoleDisplay(user.role)})</span>
              </div>
              
              <button
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>

              <Button
                variant="secondary"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

