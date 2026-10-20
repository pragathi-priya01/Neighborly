import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Lock, Mail, ArrowRight, Shield, User, Briefcase } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      const { user, token } = res.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'PROVIDER') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/resident/dashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    handleLogin(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-extrabold text-xl flex items-center justify-center">
              N
            </div>
            <span className="font-extrabold text-xl text-slate-900">Neighbourly</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-500">
            Access your bookings, quotes, or service provider dashboard
          </p>
        </div>

        {/* Demo Accounts Panel for Rapid Testing */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Development Quick-Login Profiles</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-snug">
            Click any profile below to authenticate instantly with seeded test credentials:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickDemo('arun.resident@neighbourly.local', 'Resident@123')}
              className="p-2 rounded-lg bg-white border border-amber-300 text-left hover:bg-amber-100/60 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>Resident</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">Arun (Indiranagar)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('rajesh.plumbing@neighbourly.local', 'Provider@123')}
              className="p-2 rounded-lg bg-white border border-amber-300 text-left hover:bg-amber-100/60 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Provider</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">Rajesh (Plumber)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin@neighbourly.local', 'Admin@1234')}
              className="p-2 rounded-lg bg-white border border-amber-300 text-left hover:bg-amber-100/60 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin</span>
              </div>
              <span className="text-[10px] text-slate-500 block truncate">Platform Control</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
