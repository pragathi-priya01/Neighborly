import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/common/ToastContainer';
import { LayoutDashboard, Briefcase, CalendarCheck, UserCheck, MessageSquare } from 'lucide-react';

export const ProviderLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Provider Overview', path: '/provider/dashboard', icon: LayoutDashboard },
    { label: 'Job Feed (Requests)', path: '/provider/feed', icon: Briefcase, highlight: true },
    { label: 'Active Jobs & Bookings', path: '/provider/bookings', icon: CalendarCheck },
    { label: 'Profile & Verification', path: '/provider/profile', icon: UserCheck },
    { label: 'Messages', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Sub-header navigation tabs for provider */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : item.highlight
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
