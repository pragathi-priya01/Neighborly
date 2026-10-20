import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { RatingStars } from '../../components/common/RatingStars';
import { TrustBadge } from '../../components/common/TrustBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  Award,
  Phone,
  MessageSquare,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export const ProviderProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    serviceCategory: 'General Service',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: 'Morning',
    address: user?.neighborhood ? `${user.neighborhood}, Bengaluru` : 'Indiranagar, Bengaluru',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/providers/${id}`);
        setProfileData(res.data?.profile);
        setReviews(res.data?.reviews || []);
        if (res.data?.profile?.services?.[0]?.category) {
          setBookingForm((prev) => ({
            ...prev,
            serviceCategory: res.data.profile.services[0].category,
          }));
        }
      } catch (err) {
        toast.error('Provider profile not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please sign in as a resident to book a service');
      navigate('/login', { state: { from: `/providers/${id}` } });
      return;
    }

    if (user?.role !== 'RESIDENT') {
      toast.error('Only residents can book service providers');
      return;
    }

    setBookingLoading(true);
    try {
      const estimatedAmount =
        (profileData.pricing?.hourlyRate || 400) + (profileData.pricing?.baseConsultationFee || 100);

      const payload = {
        providerId: profileData.user._id,
        serviceCategory: bookingForm.serviceCategory,
        scheduledDate: bookingForm.scheduledDate,
        scheduledTime: bookingForm.scheduledTime,
        amount: estimatedAmount,
        address: bookingForm.address,
        notes: bookingForm.notes,
      };

      const res = await api.post('/bookings', payload);
      toast.success('Booking requested! Provider will accept shortly.');
      setBookModalOpen(false);
      navigate(`/resident/bookings/${res.data._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to request booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading provider credentials...</p>
      </div>
    );
  }

  if (!profileData) return null;

  const u = profileData.user || {};
  const isVerified = profileData.verificationStatus === 'VERIFIED';
  const hourly = profileData.pricing?.hourlyRate || 400;
  const visitFee = profileData.pricing?.baseConsultationFee || 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
            {u.name?.charAt(0) || 'P'}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{u.name}</h1>
              <TrustBadge isVerified={isVerified} trustScore={profileData.trustScore} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                {profileData.neighborhood || u.neighborhood} (within {profileData.serviceRadiusKm}km)
              </span>
              <span>•</span>
              <span>{profileData.experienceYears} Years Experience</span>
              <span>•</span>
              <RatingStars rating={profileData.rating} reviewCount={profileData.reviewCount} />
            </div>
          </div>
        </div>

        {/* Action Button & Rate Card */}
        <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3 shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Standard Rates
            </span>
            <div className="text-2xl font-black text-slate-900">
              ₹{hourly}
              <span className="text-xs font-normal text-slate-500">/hr</span>
            </div>
            <span className="text-xs text-slate-500">+₹{visitFee} visit consultation fee</span>
          </div>

          <button
            onClick={() => setBookModalOpen(true)}
            className="w-full px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
          >
            Book This Provider
          </button>
        </div>
      </div>

      {/* Grid: Trust Breakdown & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Bio, Skills, Availability, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">About the Provider</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {profileData.bio || 'Experienced community service professional.'}
            </p>
          </div>

          {/* Skills & Services */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {profileData.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            {profileData.services?.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block mb-2">Registered Service Categories:</span>
                <div className="flex flex-wrap gap-2">
                  {profileData.services.map((svc) => (
                    <span
                      key={svc._id}
                      className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200"
                    >
                      {svc.category} — {svc.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verified Client Reviews
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Only residents with completed bookings can leave reviews.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">{profileData.rating.toFixed(1)}</span>
                <RatingStars rating={profileData.rating} showNumeric={false} />
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-xl">
                No reviews yet. Be the first neighbor to book and review!
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {rev.reviewer?.name?.charAt(0) || 'R'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{rev.reviewer?.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} showNumeric={false} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-9">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Trust Calculation & Availability */}
        <div className="space-y-6">
          {/* Trust Score Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
              <Award className="w-5 h-5 text-teal-600" />
              <span>Transparent Trust Score</span>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200/80 text-center">
              <div className="text-4xl font-black text-teal-900">{profileData.trustScore}</div>
              <span className="text-xs font-bold text-teal-700">out of 100</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 pt-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Identity & Documents:</span>
                <span className="font-semibold text-slate-900">
                  {isVerified ? '+35 pts (Verified)' : '+0 pts'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Neighbor Ratings ({profileData.rating}★):</span>
                <span className="font-semibold text-slate-900">
                  +{Math.round((profileData.rating / 5) * 20)} pts
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Jobs Completed ({profileData.completedBookings}):</span>
                <span className="font-semibold text-slate-900">
                  +{Math.min(profileData.completedBookings * 1.5, 15)} pts
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Completion Reliability:</span>
                <span className="font-semibold text-slate-900">{profileData.completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Working Days</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                (day) => {
                  const isAvailable = profileData.availability?.days?.includes(day);
                  return (
                    <span
                      key={day}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 line-through'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </span>
                  );
                }
              )}
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 block mb-1.5">Available Slots:</span>
              <div className="flex gap-2">
                {profileData.availability?.timeSlots?.map((slot) => (
                  <span
                    key={slot}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Book {u.name}</h3>
                <p className="text-xs text-slate-500">
                  {profileData.neighborhood} • Base total ~₹{hourly + visitFee}
                </p>
              </div>
              <button
                onClick={() => setBookModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Service Category
                </label>
                <input
                  type="text"
                  value={bookingForm.serviceCategory}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, serviceCategory: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={bookingForm.scheduledDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, scheduledDate: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Time Slot
                  </label>
                  <select
                    value={bookingForm.scheduledTime}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, scheduledTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Morning">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon">Afternoon (1 PM - 4 PM)</option>
                    <option value="Evening">Evening (5 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Service Address / Flat No.
                </label>
                <input
                  type="text"
                  value={bookingForm.address}
                  onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                  placeholder="E.g. #402, Greenview Apts, 12th Main, Indiranagar"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Problem Description / Special Instructions
                </label>
                <textarea
                  rows={3}
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="Describe what needs repair or any spare parts you already have..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                <span>Estimated Initial Booking Amount:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{hourly + visitFee}</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {bookingLoading && <LoadingSpinner size="sm" />}
                  <span>Confirm Direct Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
