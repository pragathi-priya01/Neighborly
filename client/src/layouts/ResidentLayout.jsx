import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ToastContainer } from '../components/common/ToastContainer';
import { LayoutDashboard, CalendarCheck, FileText, Sparkles, MessageSquare } from 'lucide-react';

export const ResidentLayout = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/resident/dashboard', icon: LayoutDashboard },
    { label: 'My Bookings', path: '/resident/bookings', icon: CalendarCheck },
    { label: 'My Requests', path: '/resident/requests', icon: FileText },
    { label: 'New AI Request', path: '/resident/request/new', icon: Sparkles, highlight: true },
    { label: 'Messages', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Sub-header navigation tabs for resident */}
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
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : item.highlight
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
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
