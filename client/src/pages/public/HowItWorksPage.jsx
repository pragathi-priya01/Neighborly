import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Award,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
          Platform Architecture & Values
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          How Neighbourly Protects Residents & Providers
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Neighbourly is built on transparency, local trust, and cryptographic payment verification. Here is how our marketplace ensures safety for every service booking.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Official Verification & Trust Score</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Service providers submit identity and trade credentials to administrators before receiving our Verified Badge. Our Trust Score is 100% transparent: calculated mathematically from verification status, customer ratings, completed jobs, and completion rate.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">AI Problem Assistant & Hybrid Matching</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Residents describe repairs naturally in plain everyday language. Our backend extracts structured dates, times, and budgets. Provider matching runs deterministic hard filtering for locality and skill fit, accompanied by human-readable explanations.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Server-Side Payment Verification</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Payments are governed by Razorpay. Orders are securely generated on the server in paise, and payment signatures are cryptographically validated using HMAC SHA-256 signatures and webhooks. No client-side falsification is permitted.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Controlled Booking State Machine</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Bookings follow strict transitions: <code>PENDING</code> → <code>ACCEPTED</code> → <code>PAYMENT_PENDING</code> → <code>PAID</code> → <code>IN_PROGRESS</code> → <code>COMPLETED</code>. Only authenticated providers and residents can transition states, guaranteeing complete accountability.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-md"
        >
          <span>Explore Verified Neighborhood Services</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
