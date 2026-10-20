import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from '../../store/useToastStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CalendarCheck,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Play,
  Check,
  X,
  Phone,
} from 'lucide-react';

export const ProviderBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data?.bookings || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, nextStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: nextStatus });
      toast.success(`Booking status transitioned to ${nextStatus}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading your service assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Assigned Jobs & Bookings
          </h1>
          <p className="text-xs text-slate-500">
            Accept appointments, initiate service, and record completion
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          Refresh Jobs
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No bookings assigned yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When residents accept your quotes or book you directly, jobs will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => {
            const reqUser = b.requester || {};
            const isPending = b.status === 'PENDING';
            const isPaid = b.status === 'PAID';
            const isInProgress = b.status === 'IN_PROGRESS';
            const isCompleted = b.status === 'COMPLETED';

            return (
              <div
                key={b._id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">{b.serviceCategory}</span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-slate-600">
                        Resident: <strong>{reqUser.name}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">₹{b.amount}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {b.scheduledDate} • {b.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.address}</span>
                    </div>
                    {reqUser.phone && (b.status === 'PAID' || isInProgress) && (
                      <div className="flex items-center gap-2 text-emerald-700 font-semibold pt-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{reqUser.phone}</span>
                      </div>
                    )}
                  </div>

                  {b.notes && (
                    <p className="text-xs text-slate-500 italic">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                {/* State Machine Transition Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 p-1"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Message Client</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {/* 1. Pending: Provider can Accept or Reject */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'REJECTED')}
                          disabled={updatingId === b._id}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'ACCEPTED')}
                          disabled={updatingId === b._id}
                          className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                        >
                          Accept Booking
                        </button>
                      </>
                    )}

                    {/* 2. Paid: Provider can Start Service */}
                    {isPaid && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'IN_PROGRESS')}
                        disabled={updatingId === b._id}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Service (In Progress)</span>
                      </button>
                    )}

                    {/* 3. In Progress: Provider can Mark Completed */}
                    {isInProgress && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'COMPLETED')}
                        disabled={updatingId === b._id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Service Completed</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Work Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
