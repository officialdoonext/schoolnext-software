import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>

          <h2 className="text-xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Enter your registered school email address to receive a secure Firebase password recovery link.
          </p>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold">Password Reset Dispatched</p>
              <p className="text-slate-300">If an account exists for {email}, a recovery email has been sent.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">Email Address</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-xs text-white bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="user@schoolnext.edu.in"
                  />
                </div>
              </div>

              <Button variant="primary" type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

