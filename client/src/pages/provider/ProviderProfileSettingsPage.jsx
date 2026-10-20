import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { toast } from '../../store/useToastStore';
import { TrustBadge } from '../../components/common/TrustBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  User,
  ShieldCheck,
  Award,
  Upload,
  Clock,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

export const ProviderProfileSettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [hourlyRate, setHourlyRate] = useState(400);
  const [baseFee, setBaseFee] = useState(100);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(10);
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Verification Submission Form
  const [docTitle, setDocTitle] = useState('Trade License Certificate');
  const [docUrl, setDocUrl] = useState('https://example.com/credentials.pdf');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/providers/me/profile');
      const p = res.data;
      setProfile(p);
      setBio(p.bio || '');
      setSkills(p.skills || []);
      setHourlyRate(p.pricing?.hourlyRate || 400);
      setBaseFee(p.pricing?.baseConsultationFee || 100);
      setServiceRadiusKm(p.serviceRadiusKm || 10);
      setDays(p.availability?.days || []);
      setTimeSlots(p.availability?.timeSlots || []);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        bio,
        skills,
        pricing: {
          hourlyRate: Number(hourlyRate),
          baseConsultationFee: Number(baseFee),
        },
        serviceRadiusKm: Number(serviceRadiusKm),
        availability: {
          days,
          timeSlots,
          isAcceptingRequests: true,
        },
      };

      const res = await api.patch('/providers/me/profile', payload);
      setProfile(res.data);
      toast.success('Provider profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(days.filter((d) => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  const toggleSlot = (slot) => {
    if (timeSlots.includes(slot)) {
      setTimeSlots(timeSlots.filter((s) => s !== slot));
    } else {
      setTimeSlots([...timeSlots, slot]);
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    setSubmittingDoc(true);
    try {
      const res = await api.post('/providers/me/verify', {
        documentTitle: docTitle,
        documentUrl: docUrl,
        notes: verifyNotes,
      });

      toast.success('Verification documents submitted for review!');
      fetchProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to submit verification');
    } finally {
      setSubmittingDoc(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 mt-2">Loading profile settings...</p>
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const allSlots = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Profile & Credential Settings
            </h1>
            <TrustBadge isVerified={isVerified} trustScore={profile?.trustScore} />
          </div>
          <p className="text-xs text-slate-500">
            Keep your services, rates, and verified documents up to date for maximum client trust.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Professional Information
        </h2>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Professional Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell neighbors about your experience, training, and specialized services..."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Pricing & Radius */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Hourly Labor Rate (₹)
            </label>
            <input
              type="number"
              min="50"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Base Visit / Consultation (₹)
            </label>
            <input
              type="number"
              min="0"
              value={baseFee}
              onChange={(e) => setBaseFee(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Service Radius (km)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={serviceRadiusKm}
              onChange={(e) => setServiceRadiusKm(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Skills Tag Manager */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Skills & Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Pipe Replacement)"
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Availability Days & Time Slots */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {allDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    days.includes(d)
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Working Time Slots
            </label>
            <div className="flex flex-wrap gap-2">
              {allSlots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSlot(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    timeSlots.includes(s)
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <LoadingSpinner size="sm" />}
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>

      {/* Official Verification Submission Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Identity & Trade Verification</span>
            </h2>
            <p className="text-xs text-slate-500">
              Submit proof of identity, trade certifications, or licenses to earn the Verified Provider badge.
            </p>
          </div>
          <span className="text-xs font-bold capitalize text-slate-700">
            Status: {profile?.verificationStatus}
          </span>
        </div>

        {profile?.verificationDocuments?.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">Submitted Documents:</span>
            <div className="space-y-2">
              {profile.verificationDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800">{doc.title}</span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 font-semibold hover:underline"
                  >
                    View Document →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleDocSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="E.g. Trade License, Electrician Certificate"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Document URL / Proof Link
              </label>
              <input
                type="url"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://example.com/proof.pdf"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Notes for Administrator</label>
            <textarea
              rows={2}
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              placeholder="Additional information regarding license validity..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingDoc}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submittingDoc && <LoadingSpinner size="sm" />}
              <Upload className="w-3.5 h-3.5" />
              <span>Submit for Verification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
