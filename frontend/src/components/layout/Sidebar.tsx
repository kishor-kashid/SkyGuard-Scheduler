import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useFlightsStore } from '../../store/flightsStore';
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Plane, 
  Cloud, 
  Users, 
  UserCheck,
  Calendar,
  Package,
  Settings,
  FileText
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('STUDENT' | 'INSTRUCTOR' | 'ADMIN')[];
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/flights',
    label: 'Flights',
    icon: Plane,
  },
  {
    path: '/weather',
    label: 'Weather',
    icon: Cloud,
  },
  {
    path: '/calendar',
    label: 'Calendar',
    icon: Calendar,
  },
  {
    path: '/students',
    label: 'Students',
    icon: Users,
    roles: ['ADMIN', 'INSTRUCTOR'],
  },
  {
    path: '/instructors',
    label: 'Instructors',
    icon: UserCheck,
    roles: ['ADMIN'],
  },
  {
    path: '/resources',
    label: 'Resources',
    icon: Package,
    roles: ['ADMIN'],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { flights, fetchFlights } = useFlightsStore();

  // Fetch flights to get studentId/instructorId
  useEffect(() => {
    if ((user?.role === 'STUDENT' || user?.role === 'INSTRUCTOR') && flights.length === 0) {
      fetchFlights();
    }
  }, [user?.role, flights.length, fetchFlights]);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  // Get studentId from flights for students
  const studentId = user?.role === 'STUDENT' && flights.length > 0 ? flights[0].studentId : null;
  // Get instructorId from flights for instructors (instructor's flights will have their instructorId)
  const instructorId = user?.role === 'INSTRUCTOR' && flights.length > 0 ? flights[0].instructorId : null;
  
  const flightHistoryPath = user?.role === 'STUDENT' && studentId 
    ? `/flight-history/${studentId}`
    : user?.role === 'INSTRUCTOR' && instructorId
    ? `/flight-history/instructor/${instructorId}`
    : '/flight-history';

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
          
          {/* Flight History - for Students and Instructors */}
          {(user?.role === 'STUDENT' || user?.role === 'INSTRUCTOR') && (
            <li>
              <NavLink
                to={flightHistoryPath}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <FileText className="w-5 h-5" />
                <span>Flight History</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

