import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrustBadge } from '../../components/common/TrustBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CalendarCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

export const ResidentDashboard = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recommendedProviders, setRecommendedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, requestsRes, providersRes] = await Promise.all([
          api.get('/bookings?limit=5'),
          api.get('/requests/my'),
          api.get(`/providers?neighborhood=${encodeURIComponent(user?.neighborhood || 'Indiranagar')}&limit=4&sortBy=trustScore`),
        ]);

        setBookings(bookingsRes.data?.bookings || []);
        setRequests(requestsRes.data || []);
        setRecommendedProviders(providersRes.data?.providers || []);
      } catch (err) {
        console.error('Failed to load resident dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading your neighborhood dashboard...</p>
      </div>
    );
  }

  const activeBookings = bookings.filter((b) =>
    ['PENDING', 'ACCEPTED', 'PAYMENT_PENDING', 'PAID', 'IN_PROGRESS'].includes(b.status)
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              Resident Portal
            </span>
            <span className="text-xs text-brand-100 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {user?.neighborhood || 'Indiranagar'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
            Manage your service bookings or describe a home repair in plain language to get competitive neighborhood quotes.
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-2.5">
          <Link
            to="/resident/request/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-900 font-bold text-xs hover:bg-brand-50 transition-colors shadow-md"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Post AI Service Request</span>
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-800/80 hover:bg-brand-800 text-white font-medium text-xs transition-colors border border-brand-500/40"
          >
            <span>Browse Local Providers</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Active Bookings</span>
          <div className="text-2xl font-black text-slate-900">{activeBookings.length}</div>
          <span className="text-[10px] text-brand-600 font-medium">In progress or scheduled</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Open Requests</span>
          <div className="text-2xl font-black text-slate-900">
            {requests.filter((r) => ['OPEN', 'OFFERS_RECEIVED'].includes(r.status)).length}
          </div>
          <span className="text-[10px] text-slate-400">Awaiting provider quotes</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Completed</span>
          <div className="text-2xl font-black text-slate-900">
            {bookings.filter((b) => b.status === 'COMPLETED').length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Successfully serviced</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Neighborhood Locality</span>
          <div className="text-base font-bold text-slate-900 truncate">
            {user?.neighborhood || 'Indiranagar'}
          </div>
          <span className="text-[10px] text-slate-400">Active service radius</span>
        </div>
      </div>

      {/* Grid: Active Bookings & Open Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Bookings Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Current Bookings
              </h2>
            </div>
            <Link
              to="/resident/bookings"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">You don't have any bookings yet.</p>
              <Link
                to="/services"
                className="inline-block text-xs font-semibold text-brand-600 hover:underline pt-1"
              >
                Book your first service pro →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((bk) => (
                <Link
                  key={bk._id}
                  to={`/resident/bookings/${bk._id}`}
                  className="block p-4 rounded-xl border border-slate-200 hover:border-brand-500/50 hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{bk.serviceCategory}</span>
                        <StatusBadge status={bk.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        Provider: <strong className="text-slate-700">{bk.provider?.name || 'Local Pro'}</strong>
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
                      <span className="text-[10px] text-brand-600 font-semibold block mt-1">
                        Track Status →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Open Requests & Quotes Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Service Requests
              </h2>
            </div>
            <Link
              to="/resident/requests"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No open service requests right now.</p>
              <Link
                to="/resident/request/new"
                className="inline-block text-xs font-semibold text-brand-600 hover:underline pt-1"
              >
                Post a request using AI Assistant →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 4).map((req) => (
                <Link
                  key={req._id}
                  to={`/resident/requests/${req._id}`}
                  className="block p-4 rounded-xl border border-slate-200 hover:border-indigo-500/50 hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{req.category}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{req.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Budget: ₹{req.budget}</span>
                        <span>•</span>
                        <span>{req.preferredDate}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {req.offersCount || 0} {req.offersCount === 1 ? 'Quote' : 'Quotes'}
                      </span>
                      <span className="text-[10px] text-indigo-600 font-semibold block mt-1.5">
                        Compare →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Local Verified Pros */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recommended Pros in {user?.neighborhood || 'Indiranagar'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified neighbors with top trust scores and customer ratings
            </p>
          </div>
          <Link
            to="/services"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See more pros</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProviders.map((p) => (
            <Link
              key={p._id}
              to={`/providers/${p._id}`}
              className="p-4 rounded-2xl border border-slate-200 hover:border-brand-500/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {p.user?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">{p.user?.name}</h3>
                    <RatingStars rating={p.rating} reviewCount={p.reviewCount} size="sm" />
                  </div>
                </div>
                <TrustBadge
                  isVerified={p.verificationStatus === 'VERIFIED'}
                  trustScore={p.trustScore}
                  showScore={false}
                />
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {p.bio || 'Local skilled technician.'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900">
                  ₹{p.pricing?.hourlyRate || 400}/hr
                </span>
                <span className="text-[11px] font-semibold text-brand-600">Book Pro →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
