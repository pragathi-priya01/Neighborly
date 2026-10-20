import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrustBadge } from '../../components/common/TrustBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  CalendarCheck,
  Award,
  IndianRupee,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      try {
        const [profRes, bookingsRes, feedRes] = await Promise.all([
          api.get('/providers/me/profile'),
          api.get('/bookings?limit=5'),
          api.get('/requests/feed'),
        ]);

        setProfile(profRes.data);
        setBookings(bookingsRes.data?.bookings || []);
        setOpenRequests(feedRes.data || []);
      } catch (err) {
        console.error('Failed to load provider dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading provider workspace...</p>
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');
  const totalEarned = completedJobs.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Verification Status Warning if not verified */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Profile Verification: {profile?.verificationStatus || 'PENDING'}
              </h4>
              <p className="text-[11px] text-amber-800">
                Submit your trade license or identity documents to earn the official Verified Badge and unlock top placement.
              </p>
            </div>
          </div>
          <Link
            to="/provider/profile"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors"
          >
            Submit Documents
          </Link>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              Service Partner Workspace
            </span>
            <TrustBadge isVerified={isVerified} trustScore={profile?.trustScore} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name}'s Service Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
            Manage your service appointments, submit competitive bids on local requests, and track your verified neighborhood reputation.
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-2.5">
          <Link
            to="/provider/feed"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-500/20"
          >
            <Briefcase className="w-4 h-4" />
            <span>Open Job Feed ({openRequests.length})</span>
          </Link>
          <Link
            to="/provider/profile"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700"
          >
            <span>Update Rates & Availability</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Earned</span>
          <div className="text-2xl font-black text-slate-900">₹{totalEarned}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Completed jobs volume</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Completed Services</span>
          <div className="text-2xl font-black text-slate-900">{profile?.completedBookings || 0}</div>
          <span className="text-[10px] text-slate-400">Neighborhood jobs</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Customer Rating</span>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-slate-900">
              {profile?.rating ? profile.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-amber-500 text-sm">★</span>
          </div>
          <span className="text-[10px] text-slate-400">({profile?.reviewCount || 0} reviews)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Trust Score</span>
          <div className="text-2xl font-black text-teal-700">{profile?.trustScore || 50}/100</div>
          <span className="text-[10px] text-teal-600 font-medium">Transparent composite</span>
        </div>
      </div>

      {/* Grid: Active Jobs & Open Request Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Jobs Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Assigned Bookings
              </h2>
            </div>
            <Link
              to="/provider/bookings"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Manage all
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No bookings currently assigned.</p>
              <Link
                to="/provider/feed"
                className="inline-block text-xs font-semibold text-brand-600 hover:underline pt-1"
              >
                Submit quotes on the Job Feed →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((bk) => (
                <div
                  key={bk._id}
                  className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{bk.serviceCategory}</span>
                        <StatusBadge status={bk.status} />
                      </div>
                      <p className="text-xs text-slate-600">
                        Client: <strong>{bk.requester?.name}</strong> • {bk.address}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {bk.scheduledDate} ({bk.scheduledTime})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900">₹{bk.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Requests Feed Preview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Neighborhood Requests
              </h2>
            </div>
            <Link
              to="/provider/feed"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View Feed ({openRequests.length})
            </Link>
          </div>

          {openRequests.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No open requests in your category right now.</p>
              <p className="text-[11px] text-slate-400">
                You will be notified immediately when a nearby resident posts a request.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {openRequests.slice(0, 4).map((req) => (
                <div
                  key={req._id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-brand-500/40 hover:bg-slate-50/50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{req.category}</span>
                        <span className="text-[10px] text-slate-400">• {req.neighborhood}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{req.description}</p>
                      <div className="text-[11px] text-slate-400">
                        Date: {req.preferredDate} ({req.preferredTime})
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900">₹{req.budget} budget</span>
                      <Link
                        to="/provider/feed"
                        className="text-[11px] text-indigo-600 font-semibold block mt-1 hover:underline"
                      >
                        {req.hasOffered ? 'Offered' : 'Submit Quote →'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
