import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
  Clock,
  Wrench,
  Zap,
  Sparkle,
  Cpu,
  Hammer,
  GraduationCap,
  ChefHat,
  Scissors,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Plumbing', icon: Wrench, count: '12 active pros', base: '₹450', color: 'from-blue-500/10 to-blue-500/5 text-blue-600' },
  { name: 'Electrical', icon: Zap, count: '15 active pros', base: '₹400', color: 'from-amber-500/10 to-amber-500/5 text-amber-600' },
  { name: 'Cleaning', icon: Sparkle, count: '9 active pros', base: '₹850', color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600' },
  { name: 'Appliance Repair', icon: Cpu, count: '14 active pros', base: '₹600', color: 'from-rose-500/10 to-rose-500/5 text-rose-600' },
  { name: 'Carpentry', icon: Hammer, count: '8 active pros', base: '₹500', color: 'from-orange-500/10 to-orange-500/5 text-orange-600' },
  { name: 'Tutoring', icon: GraduationCap, count: '11 active pros', base: '₹700', color: 'from-purple-500/10 to-purple-500/5 text-purple-600' },
  { name: 'Home Cooking', icon: ChefHat, count: '7 active pros', base: '₹650', color: 'from-teal-500/10 to-teal-500/5 text-teal-600' },
  { name: 'Tailoring', icon: Scissors, count: '6 active pros', base: '₹350', color: 'from-pink-500/10 to-pink-500/5 text-pink-600' },
];

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Indiranagar');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(searchQuery)}&neighborhood=${encodeURIComponent(selectedNeighborhood)}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-slate-50 to-white py-16 md:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold border border-brand-200/80">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>100% Verified Neighborhood Service Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find trusted service pros <span className="text-brand-600 underline decoration-brand-300 underline-offset-8">right next door</span>.
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Book skilled plumbers, electricians, tutors, and cleaners in your immediate locality. Compare verified offers, chat directly, and pay securely.
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 p-2 sm:p-3 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-slate-200 shrink-0">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Indiranagar">Indiranagar</option>
                  <option value="Koramangala">Koramangala</option>
                  <option value="HSR Layout">HSR Layout</option>
                  <option value="Whitefield">Whitefield</option>
                  <option value="Jayanagar">Jayanagar</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E.g., tap leak, AC repair, home cleaning, tutor..."
                  className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-md shadow-brand-600/20 shrink-0"
              >
                Search Pros
              </button>
            </form>

            {/* AI Assistant Callout */}
            <div className="pt-2 flex items-center justify-center">
              <Link
                to="/resident/request/new"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100/80 px-4 py-2 rounded-full border border-brand-200 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
                <span>Have a complex problem? Describe it naturally with our AI Request Assistant →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Popular Home Services</h2>
            <p className="text-sm text-slate-500 mt-1">
              Top requested categories in your neighborhood with upfront transparent pricing
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>View all categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/services?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    from {cat.base}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How Neighbourly Works */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Community Centric
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">How Neighbourly Works</h2>
            <p className="text-sm text-slate-400">
              From post to payment, a transparent hyperlocal workflow designed for trust and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center mb-6 text-lg border border-brand-500/30">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">Describe Your Need</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe your repair or service in plain language. Our AI extracts structured details (date, time slot, budget) so you don't waste time with repetitive forms.
              </p>
            </div>

            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center mb-6 text-lg border border-brand-500/30">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">Compare Verified Quotes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eligible local providers in your neighborhood submit competitive quotes. Review their ratings, completed jobs, and transparent trust score before booking.
              </p>
            </div>

            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center mb-6 text-lg border border-brand-500/30">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">Chat, Pay & Relax</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coordinate details via real-time chat, pay securely through Razorpay Test Mode checkout, track job progress, and leave an authentic review once completed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Callout Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" /> For Skilled Technicians & Tradespeople
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Grow your local business within walking distance.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Register as a verified Neighbourly provider. Set your own prices, choose your working hours, receive direct neighborhood requests, and build an authentic reputation.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero commission on test bookings</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Official Verified Badge</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-sm text-center hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Register as Provider
            </Link>
            <Link
              to="/services"
              className="px-6 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-sm text-center transition-colors border border-emerald-600/50"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
