import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../services/supabase';
import { Database, AlertCircle } from 'lucide-react';

export const DashboardLayout = () => {
  const { isDemoMode } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {!isSupabaseConfigured() && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Running in Viva / Demo Mode:</strong> Using local interactive dataset. To connect your live Supabase cloud database, configure your keys in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> and run <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">supabase/schema.sql</code>.
              </span>
            </div>
            <span className="hidden md:inline-block font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300/60">
              Zero Config Ready
            </span>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
