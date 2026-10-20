import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from '../../store/useToastStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrustBadge } from '../../components/common/TrustBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  Users,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptingOfferId, setAcceptingOfferId] = useState(null);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load service request');
      navigate('/resident/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm('Accept this provider offer and create the booking?')) {
      return;
    }

    setAcceptingOfferId(offerId);
    try {
      const res = await api.post(`/offers/${offerId}/accept`);
      toast.success('Offer accepted! Booking created.');
      const bookingId = res.data?.booking?._id;
      if (bookingId) {
        navigate(`/resident/bookings/${bookingId}`);
      } else {
        fetchRequest();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept offer');
    } finally {
      setAcceptingOfferId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading service request...</p>
      </div>
    );
  }

  if (!data?.request) return null;

  const req = data.request;
  const offers = data.offers || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Request Summary Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                {req.category}
              </span>
              <StatusBadge status={req.status} />
              {req.aiAssisted && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold flex items-center gap-1 border border-emerald-200">
                  <Sparkles className="w-3 h-3" /> AI Assisted
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {req.title || `${req.category} Service Request`}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Estimated Budget</span>
            <span className="text-2xl font-black text-slate-900">₹{req.budget}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Problem Description
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {req.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Date: {req.preferredDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Time: {req.preferredTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Locality: {req.neighborhood}</span>
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Incoming Provider Offers ({offers.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Compare quotes and choose your provider</span>
        </div>

        {offers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">Awaiting Provider Quotes</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Eligible verified providers in {req.neighborhood} have been notified. Quotes typically arrive within 10-30 minutes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const p = offer.provider || {};
              const prof = offer.providerProfile || {};
              const isAccepted = offer.status === 'ACCEPTED';
              const isPending = offer.status === 'PENDING';

              return (
                <div
                  key={offer._id}
                  className={`p-6 rounded-3xl bg-white border transition-all ${
                    isAccepted
                      ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Provider Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0">
                        {p.name?.charAt(0) || 'P'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/providers/${p._id}`}
                            className="text-sm font-bold text-slate-900 hover:text-brand-600 hover:underline"
                          >
                            {p.name}
                          </Link>
                          <TrustBadge
                            isVerified={prof.verificationStatus === 'VERIFIED'}
                            trustScore={prof.trustScore}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <RatingStars rating={prof.rating || 5} reviewCount={prof.reviewCount} />
                          <span>•</span>
                          <span>{p.neighborhood}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Quote */}
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Quoted Price
                      </span>
                      <div className="text-2xl font-black text-slate-900">
                        ₹{offer.proposedPrice}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Est. Time: {offer.estimatedServiceTime}
                      </span>
                    </div>
                  </div>

                  {/* Provider Message */}
                  {offer.message && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed italic">
                      "{offer.message}"
                    </div>
                  )}

                  {/* Footer / Accept Button */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Submitted on {new Date(offer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {isAccepted ? (
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Accepted</span>
                      </span>
                    ) : isPending && req.status !== 'ASSIGNED' ? (
                      <button
                        onClick={() => handleAcceptOffer(offer._id)}
                        disabled={acceptingOfferId === offer._id}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-2"
                      >
                        {acceptingOfferId === offer._id && <LoadingSpinner size="sm" />}
                        <span>Accept Offer & Book</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 capitalize">{offer.status?.toLowerCase()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
