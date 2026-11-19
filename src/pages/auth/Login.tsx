import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSchool } from '@/context/SchoolContext';
import { Button } from '@/components/common/Button';
import { UserRole } from '@/types';

export const Login: React.FC = () => {
  const { login, switchRole } = useAuth();
  const { school } = useSchool();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@schoolnext.edu.in');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demoPassword123');
    switchRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      {/* Brand Logo & Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[#4E2284] shadow-md mb-2.5">
          <span className="font-medium text-white text-xl tracking-wider">SN</span>
        </div>
        <h2 className="text-xl font-medium text-slate-900 tracking-tight">
          School Next ERP
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto font-normal">
          {school?.name || 'School Next International Academy'} • Enterprise Portal
        </p>
      </div>

      {/* Login Card: max-radius 6px, max font-weight 500 */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-6 px-4 shadow-sm rounded sm:px-8">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-8 pr-3 h-[36px] max-h-[36px] text-xs text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284] font-medium"
                  placeholder="admin@schoolnext.edu.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-medium text-[#4E2284] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-8 pr-3 h-[36px] max-h-[36px] text-xs text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#4E2284] font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#4E2284] focus:ring-[#4E2284]"
                />
                Remember this device
              </label>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={loading}
              className="w-full text-xs font-medium"
              icon={<LogIn className="w-3.5 h-3.5" />}
            >
              Sign In to ERP
            </Button>
          </form>

          {/* Quick Persona Demo Switcher */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider text-center mb-2.5">
              1-Click Demo Logins (11 Roles)
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('school_admin', 'admin@schoolnext.edu.in')}
                className="py-1 px-2 rounded bg-slate-50 hover:bg-[#4E2284]/10 hover:text-[#4E2284] border border-slate-200 text-[11px] text-slate-700 font-medium text-center h-[32px] max-h-[36px]"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('principal', 'principal@schoolnext.edu.in')}
                className="py-1 px-2 rounded bg-slate-50 hover:bg-[#4E2284]/10 hover:text-[#4E2284] border border-slate-200 text-[11px] text-slate-700 font-medium text-center h-[32px] max-h-[36px]"
              >
                Principal
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('accountant', 'accountant@schoolnext.edu.in')}
                className="py-1 px-2 rounded bg-slate-50 hover:bg-[#4E2284]/10 hover:text-[#4E2284] border border-slate-200 text-[11px] text-slate-700 font-medium text-center h-[32px] max-h-[36px]"
              >
                Accountant
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('teacher', 'teacher@schoolnext.edu.in')}
                className="py-1 px-2 rounded bg-slate-50 hover:bg-[#4E2284]/10 hover:text-[#4E2284] border border-slate-200 text-[11px] text-slate-700 font-medium text-center h-[32px] max-h-[36px]"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('parent', 'parent@gmail.com')}
                className="py-1 px-2 rounded bg-slate-50 hover:bg-[#4E2284]/10 hover:text-[#4E2284] border border-slate-200 text-[11px] text-slate-700 font-medium text-center h-[32px] max-h-[36px]"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('student', 'aarav.singh@student.schoolnext.edu.in')}
                className="py-1 px-2 rounded bg-slate-50 hover:bg-[#4E2284]/10 hover:text-[#4E2284] border border-slate-200 text-[11px] text-slate-700 font-medium text-center h-[32px] max-h-[36px]"
              >
                Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
