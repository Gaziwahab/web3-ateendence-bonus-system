import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LogIn, Key, Mail, ShieldCheck, GraduationCap, Award, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedProfile = await login(email, password);
      if (loggedProfile?.role === 'admin') navigate('/admin');
      else if (loggedProfile?.role === 'faculty') navigate('/faculty');
      else navigate('/student');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click Demo Login for Viva / Presentation
  const handleInstantDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const loggedProfile = await switchDemoRole(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'faculty') navigate('/faculty');
      else navigate('/student');
    } catch (err) {
      setError('Failed to switch demo account.');
    } finally {
      setLoading(false);
    }
  };

  const fillFormOnly = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-purple-500/20">
            🎓
          </div>
          <span className="font-extrabold text-slate-900 text-xl tracking-tight">AttendIncentive</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Access the college attendance and blockchain incentive portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@college.edu"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo 1-Click Login Cards */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                1-Click Viva / Demo Sign In
              </span>
              <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('admin')}
                className="p-2.5 border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 rounded-xl text-left transition group"
                title="Sign in immediately as College Admin"
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-xs font-bold text-slate-800">Admin</p>
                <p className="text-[10px] text-slate-500 truncate">Dr. Rajesh</p>
              </button>

              <button
                type="button"
                onClick={() => handleInstantDemoLogin('faculty')}
                className="p-2.5 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl text-left transition group"
                title="Sign in immediately as Faculty Member"
              >
                <div className="flex items-center justify-between mb-1">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-xs font-bold text-slate-800">Faculty</p>
                <p className="text-[10px] text-slate-500 truncate">Prof. Sunita</p>
              </button>

              <button
                type="button"
                onClick={() => handleInstantDemoLogin('student')}
                className="p-2.5 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-xl text-left transition group"
                title="Sign in immediately as Student (95% Attendance)"
              >
                <div className="flex items-center justify-between mb-1">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-xs font-bold text-slate-800">Student</p>
                <p className="text-[10px] text-slate-500 truncate">Rahul (95%)</p>
              </button>
            </div>

            <div className="mt-2 text-center">
              <span className="text-[10px] text-slate-400">
                Or fill credentials:
              </span>{' '}
              <button
                type="button"
                onClick={() => fillFormOnly('admin@college.edu')}
                className="text-[10px] font-semibold text-slate-600 hover:text-purple-600 underline"
              >
                Admin
              </button>
              {' • '}
              <button
                type="button"
                onClick={() => fillFormOnly('prof.sharma@college.edu')}
                className="text-[10px] font-semibold text-slate-600 hover:text-purple-600 underline"
              >
                Faculty
              </button>
              {' • '}
              <button
                type="button"
                onClick={() => fillFormOnly('rahul.kumar@college.edu')}
                className="text-[10px] font-semibold text-slate-600 hover:text-purple-600 underline"
              >
                Student
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-700 hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
