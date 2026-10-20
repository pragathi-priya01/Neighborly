import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { toast } from '../../store/useToastStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  User,
  ExternalLink,
} from 'lucide-react';

export const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeDispute, setActiveDispute] = useState(null);

  // Resolution Form State
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionText, setResolutionText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/disputes?status=${statusFilter}` : '/disputes';
      const res = await api.get(url);
      setDisputes(res.data?.disputes || []);
    } catch (err) {
      toast.error('Failed to load dispute desk');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!activeDispute) return;

    if (resolutionText.trim().length < 5) {
      toast.error('Resolution summary must be at least 5 characters');
      return;
    }

    setResolving(true);
    try {
      await api.patch(`/disputes/${activeDispute._id}/resolve`, {
        status: resolutionStatus,
        resolution: resolutionText,
        adminNotes,
      });

      toast.success(`Dispute marked as ${resolutionStatus}`);
      setActiveDispute(null);
      setResolutionText('');
      setAdminNotes('');
      fetchDisputes();
    } catch (err) {
      toast.error(err.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  const statusBadges = {
    OPEN: 'bg-rose-100 text-rose-800 border-rose-200',
    UNDER_REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    DISMISSED: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900">Dispute Mediation Desk</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Impartial platform mediation for billing, scheduling, quality, and cancellation conflicts.
          </p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 self-start sm:self-auto"
        >
          <option value="">All Disputes</option>
          <option value="OPEN">Open Cases</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved Cases</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 mt-2">Loading platform disputes...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Disputes Found</h3>
          <p className="text-xs text-slate-500">
            {statusFilter ? `No disputes with status "${statusFilter}"` : 'Great job! Community health is high with zero active complaints.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => {
            const b = dispute.booking || {};
            const requester = b.requester || {};
            const provider = b.provider || {};
            const raisedBy = dispute.raisedBy || {};
            const isOpen = dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW';

            return (
              <div
                key={dispute._id}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {b.serviceCategory || 'General Service'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          statusBadges[dispute.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {dispute.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      Dispute #{dispute._id.slice(-6)}: {dispute.reason}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Raised by <span className="font-semibold text-slate-800">{raisedBy.name}</span> ({raisedBy.role}) on{' '}
                      {new Date(dispute.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Booking Value</span>
                    <span className="text-base font-extrabold text-slate-900 flex items-center sm:justify-end gap-0.5">
                      <IndianRupee className="w-4 h-4 text-slate-400" />
                      <span>{b.amount || 0}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Booking #{b._id?.slice(-6)}</span>
                  </div>
                </div>

                {/* Complaint Description */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Statement of Conflict:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">{dispute.description}</p>
                </div>

                {/* Involved Parties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Resident</span>
                    <p className="font-bold text-slate-900">{requester.name || 'Resident'}</p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{requester.email}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{requester.phone || 'N/A'}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Provider</span>
                    <p className="font-bold text-slate-900">{provider.name || 'Provider'}</p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{provider.email}</span>
                    </p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{provider.phone || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                {/* Existing Resolution Info */}
                {dispute.resolution && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="font-bold block">Mediation Resolution:</span>
                    <p>{dispute.resolution}</p>
                    {dispute.adminNotes && (
                      <p className="text-[11px] text-emerald-700 italic">Internal notes: {dispute.adminNotes}</p>
                    )}
                  </div>
                )}

                {/* Action button */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => {
                      setActiveDispute(dispute);
                      setResolutionStatus(dispute.status === 'OPEN' ? 'RESOLVED' : dispute.status);
                      setResolutionText(dispute.resolution || '');
                      setAdminNotes(dispute.adminNotes || '');
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {isOpen ? 'Mediate & Resolve' : 'View / Edit Resolution'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mediation Decision Modal */}
      {activeDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleResolve}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Mediate Dispute #{activeDispute._id.slice(-6)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDispute(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mediation Verdict / Status
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  <option value="RESOLVED">Resolved (Complete booking or order settlement)</option>
                  <option value="UNDER_REVIEW">Under Review (Gathering more details from parties)</option>
                  <option value="DISMISSED">Dismissed (No platform policy violation found)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Resolution Explanation (Sent to both parties)*
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="e.g. Provider revisited and rectified the pipe leakage. Resident agreed the service meets specifications."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Internal Administrative Notes (Private)
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Provider phone interview on 28th, customer verified via WhatsApp"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveDispute(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={resolving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {resolving ? 'Submitting...' : 'Confirm Verdict'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
