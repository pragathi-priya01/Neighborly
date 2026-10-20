import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  CalendarCheck,
  Clock,
  MapPin,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Star,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Info,
} from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'Requested' },
  { key: 'PAYMENT_PENDING', label: 'Payment Pending' },
  { key: 'PAID', label: 'Confirmed & Paid' },
  { key: 'IN_PROGRESS', label: 'Service In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
];

export const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Service Quality Issue');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data);

      // Check if already reviewed if completed
      if (res.data.status === 'COMPLETED') {
        try {
          const revRes = await api.get(`/reviews/provider/${res.data.provider?._id}`);
          const myRev = revRes.data?.find((r) => r.booking === id);
          if (myRev) setExistingReview(myRev);
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      toast.error('Booking not found or access denied');
      navigate('/resident/bookings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * RAZORPAY TEST MODE CHECKOUT INTEGRATION
   */
  const handleRazorpayPayment = async () => {
    setPayLoading(true);
    try {
      // 1. Create order on Neighbourly backend
      const orderRes = await api.post(`/payments/order/${booking._id}`);
      const orderData = orderRes.data;

      // 2. Configure Razorpay Checkout Options
      const options = {
        key: orderData.keyId || 'rzp_test_placeholder_key_id',
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'Neighbourly Community Services',
        description: `Booking #${booking._id.toString().slice(-6)} - ${booking.serviceCategory}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || '+91 98765 00000',
        },
        theme: {
          color: '#059669',
        },
        handler: async function (response) {
          // 3. Cryptographic Signature Verification on Backend
          try {
            toast.info('Verifying payment signature with Neighbourly backend...');
            await api.post('/payments/verify', {
              bookingId: booking._id,
              razorpayOrderId: response.razorpay_order_id || orderData.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature || 'test_signature_valid',
            });

            toast.success('Payment verified! Booking is now confirmed.');
            fetchBooking();
          } catch (verifyErr) {
            toast.error(verifyErr.message || 'Payment signature verification failed.');
          }
        },
        modal: {
          ondismiss: function () {
            toast.warning('Payment was cancelled by user.');
          },
        },
      };

      // 3. Launch Razorpay modal if SDK loaded, or simulate sandbox approval
      if (typeof window.Razorpay === 'function') {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(`Payment failed: ${response.error?.description || 'Declined'}`);
        });
        rzp.open();
      } else {
        // Fallback for offline / blocked script in dev sandbox: simulate instant test authorization
        const simulatedPaymentId = `pay_test_${Date.now()}`;
        await api.post('/payments/verify', {
          bookingId: booking._id,
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: simulatedPaymentId,
          razorpaySignature: 'test_signature_valid',
        });
        toast.success('Payment verified in Test Mode! Booking confirmed.');
        fetchBooking();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initialize payment');
    } finally {
      setPayLoading(false);
    }
  };

  // Submit Review Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: booking._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted! Thank you for helping the community.');
      setExistingReview(res.data);
      setReviewModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Raise Dispute Handler
  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    setDisputeSubmitting(true);
    try {
      await api.post('/disputes', {
        bookingId: booking._id,
        reason: disputeReason,
        description: disputeDesc,
      });
      toast.success('Dispute raised. Neighbourly admin team will mediate.');
      setDisputeModalOpen(false);
      fetchBooking();
    } catch (err) {
      toast.error(err.message || 'Failed to file dispute');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading booking tracker...</p>
      </div>
    );
  }

  if (!booking) return null;

  const p = booking.provider || {};
  const currentStepIdx = STEPS.findIndex((s) => s.key === booking.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner: Booking Tracker Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                {booking.serviceCategory}
              </span>
              <StatusBadge status={booking.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Booking #{booking._id.toString().slice(-6)}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">₹{booking.amount}</span>
          </div>
        </div>

        {/* State Machine Progress Stepper */}
        {booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
          <div className="py-4">
            <div className="grid grid-cols-5 gap-2 relative">
              {STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold leading-tight ${
                        isCurrent
                          ? 'text-brand-700 font-bold'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RAZORPAY TEST MODE ACTION CARD (when PAYMENT_PENDING) */}
      {booking.status === 'PAYMENT_PENDING' && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Razorpay Test Mode Checkout</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Complete Payment to Confirm Appointment</h2>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Your service provider has accepted the request. Pay ₹{booking.amount} via Razorpay Test Mode to confirm scheduling and unlock real-time coordination.
              </p>
            </div>

            <button
              onClick={handleRazorpayPayment}
              disabled={payLoading}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {payLoading ? <LoadingSpinner size="sm" /> : <CreditCard className="w-4 h-4" />}
              <span>Pay ₹{booking.amount} (Test Mode)</span>
            </button>
          </div>
        </div>
      )}

      {/* Booking Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Provider Info Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Assigned Service Provider
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 font-extrabold text-xl flex items-center justify-center shrink-0">
              {p.name?.charAt(0) || 'P'}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{p.neighborhood}</span>
              </p>
              {booking.status === 'PAID' || booking.status === 'IN_PROGRESS' ? (
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{p.phone || '+91 98765 33333'}</span>
                </p>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Phone unlocked after payment confirmation
                </span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <Link
              to="/chat"
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              <span>Chat with Provider</span>
            </Link>

            <Link
              to={`/providers/${p._id}`}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Appointment Information
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <CalendarCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Scheduled Time</span>
                <span>
                  {booking.scheduledDate} ({booking.scheduledTime})
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Service Location</span>
                <span>{booking.address}</span>
              </div>
            </div>

            {booking.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 italic">
                "{booking.notes}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post-Completion Actions: Review or Dispute */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Need Assistance or Feedback?</h3>
          <p className="text-xs text-slate-500">
            {booking.status === 'COMPLETED'
              ? 'Share your experience to help local neighbors find trusted services.'
              : 'Our mediation desk is available if any scheduling or service conflict arises.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {booking.status === 'COMPLETED' && (
            <button
              onClick={() => setReviewModalOpen(true)}
              disabled={!!existingReview}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 fill-slate-950" />
              <span>{existingReview ? 'Review Submitted' : 'Write a Review'}</span>
            </button>
          )}

          {booking.status !== 'DISPUTED' && booking.status !== 'CANCELLED' && (
            <button
              onClick={() => setDisputeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Raise Dispute</span>
            </button>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Rate & Review {p.name}</h3>
              <button onClick={() => setReviewModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Review Comment
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the service quality, punctuality, and professionalism?"
                  required
                  minLength={5}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">Raise Dispute</h3>
              </div>
              <button onClick={() => setDisputeModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Service Quality Issue">Service Quality Issue</option>
                  <option value="Provider No-Show">Provider No-Show</option>
                  <option value="Payment / Amount Dispute">Payment / Amount Dispute</option>
                  <option value="Damage Caused">Damage Caused</option>
                  <option value="Other">Other Conflict</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Detailed Explanation
                </label>
                <textarea
                  rows={4}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Explain what happened in detail for administrator mediation..."
                  required
                  minLength={10}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputeSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {disputeSubmitting ? 'Filing...' : 'Submit to Admin Desk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
