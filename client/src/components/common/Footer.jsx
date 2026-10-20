import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Info, CreditCard } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      {/* Test Mode & Safety Banner */}
      <div className="bg-slate-800/80 border-b border-slate-700/60 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-amber-300 font-medium">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Development Notice:</strong> Payment gateway runs in <strong>Razorpay Test Mode</strong>. No real financial charges occur. All profiles and bookings are for demonstration and testing.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Neighbourly</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A Hyperlocal Service Marketplace connecting residents with trusted, verified local service professionals for everyday home and repair needs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparent community trust scores & identity verification</span>
            </div>
          </div>

          {/* For Residents */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              For Residents
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Find Local Services
                </Link>
              </li>
              <li>
                <Link to="/resident/request/new" className="hover:text-white transition-colors">
                  Post AI Service Request
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How Booking Works
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Resident Login
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              For Service Partners
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Join as a Service Provider
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Verification Guidelines
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Provider Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Trust & Security
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Every booking is tracked through a strict server-validated state machine. Payments are secured via Razorpay cryptographic verification.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CreditCard className="w-4 h-4 text-brand-400" />
              <span>Razorpay Verified Sandbox</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Neighbourly Technologies. Hyperlocal Community Services.</p>
          <div className="flex items-center gap-1">
            <span>Built with care for urban neighborhoods</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
