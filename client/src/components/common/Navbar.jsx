import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  MapPin,
  Sparkles,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Briefcase,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';

export const Navbar = () => {
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications?unreadOnly=true');
        setUnreadNotifications(res.data?.unreadCount || 0);
      } catch {
        // Ignore background polling failure
      }
    };

    fetchUnread();

    // Listen for real-time notifications via socket
    const socket = getSocket(token);
    const handleNewNotif = () => {
      setUnreadNotifications((prev) => prev + 1);
    };

    socket.on('new_notification', handleNewNotif);
    return () => {
      socket.off('new_notification', handleNewNotif);
    };
  }, [isAuthenticated, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isResident = user?.role === 'RESIDENT';
  const isProvider = user?.role === 'PROVIDER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Locality */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-xl tracking-tight">N</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-tight">
                  Neighbourly
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-600">
                  Hyperlocal Services
                </span>
              </div>
            </Link>

            {/* Neighborhood Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 transition-colors cursor-pointer border border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>{user?.neighborhood || 'Indiranagar, Bengaluru'}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/services"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/services'
                  ? 'text-brand-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Browse Services
            </Link>

            <Link
              to="/how-it-works"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/how-it-works'
                  ? 'text-brand-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              How It Works
            </Link>

            {/* Post Request button with AI Sparkle */}
            {(!isAuthenticated || isResident) && (
              <Link
                to="/resident/request/new"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition-all hover:shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Post Request (AI Assistant)</span>
              </Link>
            )}

            {isProvider && (
              <Link
                to="/provider/feed"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-semibold"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Job Feed</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* User Auth Controls / Profile */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Messages Link */}
                <Link
                  to="/chat"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-200">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-900 leading-tight">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {user?.role?.toLowerCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      {isResident && (
                        <>
                          <Link
                            to="/resident/dashboard"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Resident Dashboard
                          </Link>
                          <Link
                            to="/resident/bookings"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            My Bookings
                          </Link>
                          <Link
                            to="/resident/requests"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            My Service Requests
                          </Link>
                        </>
                      )}

                      {isProvider && (
                        <>
                          <Link
                            to="/provider/dashboard"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Provider Dashboard
                          </Link>
                          <Link
                            to="/provider/bookings"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            My Jobs & Bookings
                          </Link>
                          <Link
                            to="/provider/profile"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Profile & Verification
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Platform Analytics
                          </Link>
                          <Link
                            to="/admin/verifications"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Verification Queue
                          </Link>
                          <Link
                            to="/admin/disputes"
                            className="block px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            Dispute Center
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Join Neighbourly
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs font-medium text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Locality: {user?.neighborhood || 'Indiranagar, Bengaluru'}</span>
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Browse Services
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </Link>

            {(!isAuthenticated || isResident) && (
              <Link
                to="/resident/request/new"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-brand-700 bg-brand-50"
              >
                ✨ Post Request (AI Assistant)
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <div className="border-t border-slate-100 my-2" />
                {isResident && (
                  <>
                    <Link
                      to="/resident/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Resident Dashboard
                    </Link>
                    <Link
                      to="/resident/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                {isProvider && (
                  <>
                    <Link
                      to="/provider/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Provider Dashboard
                    </Link>
                    <Link
                      to="/provider/feed"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Open Job Feed
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-amber-800 bg-amber-50 rounded-lg"
                  >
                    Admin Console
                  </Link>
                )}

                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Messages</span>
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold shadow-sm"
                >
                  Join Neighbourly
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
