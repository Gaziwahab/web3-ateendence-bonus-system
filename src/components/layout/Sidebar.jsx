import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  Award,
  Link2,
  Clock,
  History,
  Shield,
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const adminNav = [
    { name: 'Admin Dashboard', to: '/admin', icon: LayoutDashboard },
    { name: 'Manage Students', to: '/admin/students', icon: Users },
    { name: 'Manage Faculty', to: '/admin/faculty', icon: GraduationCap },
    { name: 'Manage Subjects', to: '/admin/subjects', icon: BookOpen },
    { name: 'Attendance Overview', to: '/admin/attendance', icon: CalendarCheck2 },
    { name: 'Reward Management', to: '/admin/rewards', icon: Award },
    { name: 'Blockchain Records', to: '/admin/transactions', icon: Link2 },
  ];

  const facultyNav = [
    { name: 'Faculty Dashboard', to: '/faculty', icon: LayoutDashboard },
    { name: 'My Subjects', to: '/faculty/subjects', icon: BookOpen },
    { name: 'Mark Attendance', to: '/faculty/mark-attendance', icon: CalendarCheck2 },
    { name: 'Attendance History', to: '/faculty/history', icon: History },
  ];

  const studentNav = [
    { name: 'Student Dashboard', to: '/student', icon: LayoutDashboard },
    { name: 'My Attendance', to: '/student/attendance', icon: CalendarCheck2 },
    { name: 'My Rewards', to: '/student/rewards', icon: Award },
    { name: 'Transaction History', to: '/student/transactions', icon: Link2 },
  ];

  let navItems = studentNav;
  if (role === 'admin') navItems = adminNav;
  else if (role === 'faculty') navItems = facultyNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 font-bold text-lg">
          🎓
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-wide">AttendIncentive</h1>
          <p className="text-[10px] text-purple-300 font-medium">Blockchain CSE Project</p>
        </div>
      </div>

      {/* Role Pill Indicator */}
      <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Current Role</span>
          <span className="font-semibold text-purple-400 capitalize px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-[11px]">
            {role || 'Student'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/faculty' || item.to === '/student'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Blockchain Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-medium text-slate-300">Sepolia Smart Contract</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Attendance records stored in Supabase. Incentive payouts verified on-chain.
        </p>
      </div>
    </aside>
  );
};
