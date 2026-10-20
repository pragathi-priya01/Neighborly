import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { toast } from '../../store/useToastStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { TrustBadge } from '../../components/common/TrustBadge';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  MapPin,
  Briefcase,
  Search,
  Filter,
} from 'lucide-react';

export const AdminVerificationsPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('IN_REVIEW');
  const [actionProfile, setActionProfile] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/verifications?status=${statusFilter}`);
      setProfiles(res.data?.profiles || []);
    } catch (err) {
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!actionProfile) return;

    setUpdating(true);
    try {
      await api.patch(`/admin/verifications/${actionProfile._id}`, {
        status,
        adminNotes,
      });

      toast.success(
        status === 'VERIFIED'
          ? 'Provider profile verified successfully!'
          : `Status updated to ${status}`
      );

      setActionProfile(null);
      setAdminNotes('');
      fetchQueue();
    } catch (err) {
      toast.error(err.message || 'Failed to update verification status');
    } finally {
      setUpdating(false);
    }
  };

  const tabs = [
    { key: 'IN_REVIEW', label: 'In Review' },
    { key: 'PENDING', label: 'Pending Docs' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'ALL', label: 'All Providers' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900">Provider Verification Desk</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review uploaded trade licenses and certificates to grant official Neighbourly Verified trust status.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Queue */}
      {loading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 mt-2">Loading verification queue...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Providers in this Queue</h3>
          <p className="text-xs text-slate-500">
            There are currently no provider profiles matching status filter "{statusFilter}".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => {
            const u = profile.user || {};
            const isVerified = profile.verificationStatus === 'VERIFIED';
            const isRejected = profile.verificationStatus === 'REJECTED';

            return (
              <div
                key={profile._id}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold text-lg flex items-center justify-center shrink-0">
                      {u.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{u.name}</h3>
                        <TrustBadge status={profile.verificationStatus} score={profile.trustScore} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{u.email}</span>
                        <span>•</span>
                        <span>{u.phone}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {profile.neighborhood || u.neighborhood}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Experience & Rates</span>
                    <span className="text-xs font-bold text-slate-800">
                      {profile.experienceYears || 1}+ Years Exp • ₹{profile.pricing?.hourlyRate}/hr
                    </span>
                  </div>
                </div>

                {/* Bio & Skills */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 line-clamp-2">{profile.bio}</p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {profile.skills?.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Uploaded Verification Documents */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Verification Documents ({profile.verificationDocuments?.length || 0})
                  </span>

                  {profile.verificationDocuments?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profile.verificationDocuments.map((doc, dIdx) => (
                        <a
                          key={dIdx}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-xs transition-colors group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{doc.title}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No formal credentials attached yet.</p>
                  )}
                </div>

                {profile.verificationNotes && (
                  <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-amber-800">
                    <span className="font-semibold">Current Notes: </span>
                    {profile.verificationNotes}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActionProfile(profile);
                      setAdminNotes(profile.verificationNotes || '');
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Review & Decide
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {actionProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Verification Decision: {actionProfile.user?.name}
                </h3>
              </div>
              <button
                onClick={() => setActionProfile(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Verification Notes / Feedback for Provider:
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. License verified against state database, valid through 2027."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={updating}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Application</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus('IN_REVIEW')}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hold In Review
                </button>

                <button
                  onClick={() => handleUpdateStatus('VERIFIED')}
                  disabled={updating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Verify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
