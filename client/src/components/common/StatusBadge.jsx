import React from 'react';

export const StatusBadge = ({ status }) => {
  const configs = {
    // Booking Statuses
    PENDING: { label: 'Pending Confirmation', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    ACCEPTED: { label: 'Accepted', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    PAYMENT_PENDING: { label: 'Payment Pending', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    PAID: { label: 'Paid & Confirmed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    IN_PROGRESS: { label: 'Service In Progress', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    REJECTED: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    DISPUTED: { label: 'Disputed', bg: 'bg-red-50 text-red-700 border-red-300' },

    // Verification Statuses
    VERIFIED: { label: 'Verified Partner', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    IN_REVIEW: { label: 'Under Review', bg: 'bg-blue-50 text-blue-700 border-blue-200' },

    // Request Statuses
    OPEN: { label: 'Accepting Offers', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    OFFERS_RECEIVED: { label: 'Offers Received', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    ASSIGNED: { label: 'Assigned', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  };

  const current = configs[status] || {
    label: status ? status.replace('_', ' ') : 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}
    >
      {current.label}
    </span>
  );
};
