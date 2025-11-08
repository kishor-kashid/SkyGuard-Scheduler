import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/auth/LoginForm';
import { Plane, Shield, Calendar, Cloud } from 'lucide-react';

export function Login() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 flex">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl -ml-48 -mb-48"></div>
        
        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <Plane className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Branding */}
          <h1 className="text-5xl font-bold mb-4 text-center">
            SkyGuard Scheduler
          </h1>
          <p className="text-xl text-blue-100 text-center mb-12">
            Professional Flight Training Management
          </p>

          {/* Feature highlights */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex-shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Smart Scheduling</h3>
                <p className="text-blue-100">Efficient flight booking and conflict management</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex-shrink-0">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI Weather Briefings</h3>
                <p className="text-blue-100">Intelligent weather analysis for safer flights</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure & Reliable</h3>
                <p className="text-blue-100">Enterprise-grade security for your flight data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex bg-white rounded-2xl p-4 shadow-lg mb-4">
              <Plane className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SkyGuard Scheduler
            </h1>
            <p className="text-gray-600">Flight Schedule Pro</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to access your flight schedule
              </p>
            </div>

            <LoginForm />
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

