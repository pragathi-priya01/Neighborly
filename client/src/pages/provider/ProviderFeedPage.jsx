import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { toast } from '../../store/useToastStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';

export const ProviderFeedPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quote Submission Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('1-2 hours');
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/feed');
      setRequests(res.data || []);
    } catch (err) {
      toast.error('Failed to load open service requests');
    } finally {
      setLoading(false);
    }
  };

  const openOfferModal = (req) => {
    setSelectedRequest(req);
    setOfferPrice(req.budget.toString());
    setEstimatedTime('1-2 hours');
    setOfferMessage(`Hello! I am a local professional in ${req.neighborhood} and would be glad to help with your ${req.category} request.`);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerPrice || Number(offerPrice) < 50) {
      toast.error('Please enter a valid price quote (min ₹50)');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/offers/request/${selectedRequest._id}`, {
        proposedPrice: Number(offerPrice),
        estimatedServiceTime: estimatedTime,
        message: offerMessage,
      });

      toast.success('Your quote has been sent to the resident!');
      setSelectedRequest(null);
      fetchFeed();
    } catch (err) {
      toast.error(err.message || 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading neighborhood request feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Neighbourhood Job Feed
          </h1>
          <p className="text-xs text-slate-500">
            Open service requests from residents in your active service radius
          </p>
        </div>

        <button
          onClick={fetchFeed}
          className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          Refresh Feed
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No open requests right now</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When neighbors in your locality post a problem matching your trade, they will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-indigo-400 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {req.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {req.neighborhood}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{req.title || req.category}</h3>
                  <p className="text-xs text-slate-500">
                    Posted by {req.requester?.name || 'Local Resident'}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Resident Budget
                  </span>
                  <span className="text-2xl font-black text-slate-900">₹{req.budget}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {req.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Requested Date: <strong>{req.preferredDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Slot: <strong>{req.preferredTime}</strong></span>
                  </div>
                </div>

                <div>
                  {req.hasOffered ? (
                    <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Quote Submitted (₹{req.myOffer?.proposedPrice})</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => openOfferModal(req)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
                    >
                      Submit Price Quote
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Submission Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Quote for {selectedRequest.category}
                </h3>
                <p className="text-xs text-slate-500">
                  Resident budget: ₹{selectedRequest.budget} • {selectedRequest.neighborhood}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Your Proposed Price (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    required
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estimated Arrival / Service Duration
                </label>
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="E.g. 45-60 mins, Tomorrow 10 AM"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Message to Resident
                </label>
                <textarea
                  rows={3}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Introduce yourself, your tools/parts, and when you can arrive..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <LoadingSpinner size="sm" />}
                  <span>Send Quote to Resident</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
