import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from '../../store/useToastStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Sparkles,
  ArrowRight,
  PlusCircle,
  XCircle,
  Tag,
  Users,
} from 'lucide-react';

export const ResidentRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/my');
      setRequests(res.data || []);
    } catch (err) {
      toast.error('Failed to load your service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this service request?')) {
      return;
    }

    setCancellingId(requestId);
    try {
      await api.patch(`/requests/${requestId}/cancel`);
      toast.success('Request cancelled successfully');
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: 'CANCELLED' } : r))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to cancel request');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading your service requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">My Service Requests</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
              {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track service requests, review received provider offers, and book verified neighbors.
          </p>
        </div>

        <Link
          to="/resident/request/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Post New Request</span>
        </Link>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Service Requests Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Need a tap fixed, deep cleaning, or electrical wiring? Describe your problem naturally
              with our AI assistant or standard form.
            </p>
          </div>
          <Link
            to="/resident/request/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create First Request</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isCancellable = req.status === 'OPEN' || req.status === 'MATCHED' || req.status === 'OFFERS_RECEIVED';
            const offersCount = req.offersCount || req.offers?.length || 0;

            return (
              <div
                key={req._id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                      {req.category}
                    </span>
                    <StatusBadge status={req.status} />
                    {req.extractedViaAi && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        AI Extracted
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Posted on {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {req.title || `${req.category} Request`}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {req.description}
                  </p>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 bg-slate-50 rounded-xl text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Preferred Schedule</span>
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.preferredDate} ({req.preferredTimeSlot})</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Estimated Budget</span>
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                      <span>{req.budget ? `₹${req.budget}` : 'Flexible'}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Locality</span>
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.locality || req.address}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">Offers Received</span>
                    <div className="flex items-center gap-1.5 font-bold text-brand-700">
                      <Users className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{offersCount} {offersCount === 1 ? 'Offer' : 'Offers'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {isCancellable && (
                      <button
                        onClick={() => handleCancelRequest(req._id)}
                        disabled={cancellingId === req._id}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{cancellingId === req._id ? 'Cancelling...' : 'Cancel Request'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/resident/requests/${req._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <span>View Offers & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
