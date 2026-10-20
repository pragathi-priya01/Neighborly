import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/common/ToastContainer';
import {
  BarChart3,
  ShieldCheck,
  Users,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Platform Analytics', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Verification Queue', path: '/admin/verifications', icon: ShieldCheck },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Dispute Desk', path: '/admin/disputes', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ADMINISTRATOR
            </span>
            <span className="text-xs text-slate-300">Platform Control Center</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
};
