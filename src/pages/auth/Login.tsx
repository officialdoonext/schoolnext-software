import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      {/* Brand Logo & Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 p-0.5 shadow-xl shadow-brand-500/20 mb-3">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span className="font-black text-sky-400 text-2xl tracking-wider">SN</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          School Next ERP
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          {school?.name || 'School Next International Academy'} • Enterprise Multi-School Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Email Address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs text-white bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="admin@schoolnext.edu.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-medium text-sky-400 hover:text-sky-300">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs text-white bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                />
                Remember this device
              </label>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 border-none text-white font-bold"
              icon={<LogIn className="w-4 h-4" />}
            >
              Sign In to ERP
            </Button>
          </form>

          {/* Quick Persona Demo Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              1-Click Demo Logins (11 Roles)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('school_admin', 'admin@schoolnext.edu.in')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-white font-medium text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('principal', 'principal@schoolnext.edu.in')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-white font-medium text-center"
              >
                Principal
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('accountant', 'accountant@schoolnext.edu.in')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-white font-medium text-center"
              >
                Accountant
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('teacher', 'teacher@schoolnext.edu.in')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-white font-medium text-center"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('parent', 'parent@gmail.com')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-white font-medium text-center"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('student', 'aarav.singh@student.schoolnext.edu.in')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-white font-medium text-center"
              >
                Student
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Powered by Firebase Authentication & Cloud Firestore • Production Ready
        </p>
      </div>
    </div>
  );
};

