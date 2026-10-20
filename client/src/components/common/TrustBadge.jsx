import React from 'react';
import { ShieldCheck, ShieldAlert, Award } from 'lucide-react';

export const TrustBadge = ({ isVerified, trustScore, size = 'sm', showScore = true }) => {
  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {isVerified ? (
        <span
          title="Identity & skills officially verified by Neighbourly team"
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verified
        </span>
      ) : (
        <span
          title="Documents pending review"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          Unverified
        </span>
      )}

      {showScore && trustScore !== undefined && (
        <span
          title="Transparent trust score computed from verified documents, client reviews, and completion rate."
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200"
        >
          <Award className="w-3.5 h-3.5 text-teal-600" />
          Trust Score: {trustScore}/100
        </span>
      )}
    </div>
  );
};
