import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CalendarCheck,
  Clock,
  MapPin,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const ResidentBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/bookings?status=${statusFilter}` : '/bookings';
      const res = await api.get(url);
      setBookings(res.data?.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: 'All Bookings', value: '' },
    { label: 'Payment Needed', value: 'PAYMENT_PENDING' },
    { label: 'Confirmed & Paid', value: 'PAID' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Disputed', value: 'DISPUTED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500">Track and manage your scheduled community services</p>
        </div>

        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
        >
          <span>Find Services</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 mt-2">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No bookings match this filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings in this status right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const p = booking.provider || {};
            const isPayPending = booking.status === 'PAYMENT_PENDING';

            return (
              <div
                key={booking._id}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900">{booking.serviceCategory}</h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        Provider: <strong className="text-slate-800">{p.name || 'Local Pro'}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">₹{booking.amount}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {booking.scheduledDate} • {booking.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{booking.address}</span>
                    </div>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-500 line-clamp-1 italic mt-2">
                      "{booking.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Booking #{booking._id.toString().slice(-6)}
                  </span>

                  <Link
                    to={`/resident/bookings/${booking._id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isPayPending
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isPayPending ? 'Pay Now (Razorpay)' : 'View & Track →'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
