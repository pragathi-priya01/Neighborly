import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Bell,
  CheckCircle2,
  CalendarCheck,
  Tag,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';

export const NotificationsPage = () => {
  const { user, token } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket(token);
    const handleNew = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on('new_notification', handleNew);
    return () => {
      socket.off('new_notification', handleNew);
    };
  }, [token]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.notifications || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notif) => {
    if (notif.read) return;

    try {
      await api.patch(`/notifications/${notif._id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.post('/notifications/read-all');
      toast.success('All notifications marked as read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      toast.error(err.message || 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING_STATUS':
        return <CalendarCheck className="w-4 h-4 text-brand-600" />;
      case 'OFFER_RECEIVED':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-teal-600" />;
      case 'VERIFICATION_UPDATE':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'DISPUTE_UPDATE':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates on your bookings, provider quotes, payments, and messages.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 mt-2">Loading your notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">You're all caught up!</h3>
          <p className="text-xs text-slate-500">
            No notifications at the moment. We'll alert you as soon as bookings or messages update.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {notifications.map((notif) => {
            const Content = (
              <div
                onClick={() => handleMarkAsRead(notif)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  !notif.read ? 'bg-brand-50/40 hover:bg-brand-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>

                  {notif.link && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 mt-2">
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-brand-600 ring-4 ring-brand-100 shrink-0 mt-1.5" />
                )}
              </div>
            );

            return notif.link ? (
              <Link key={notif._id} to={notif.link} className="block">
                {Content}
              </Link>
            ) : (
              <div key={notif._id}>{Content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
};
