import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/auth/LoginForm';
import { Card } from '../components/common/Card';

export function Login() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SkyGuard Scheduler
          </h1>
          <p className="text-gray-600">Flight Schedule Pro</p>
        </div>

        <Card title="Sign In">
          <LoginForm />
        </Card>

        <p className="mt-6 text-center text-sm text-gray-600">
          Demo credentials: admin@flightpro.com / password123
        </p>
      </div>
    </div>
  );
}

