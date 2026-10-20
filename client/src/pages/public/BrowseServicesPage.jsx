import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { RatingStars } from '../../components/common/RatingStars';
import { TrustBadge } from '../../components/common/TrustBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
} from 'lucide-react';

export const BrowseServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verifiedOnly') === 'true');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'trustScore');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load available service categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/services');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch providers with debounce for keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, selectedCategory, neighborhood, verifiedOnly, minRating, maxPrice, sortBy, page]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (selectedCategory) params.append('category', selectedCategory);
      if (neighborhood) params.append('neighborhood', neighborhood);
      if (verifiedOnly) params.append('verifiedOnly', 'true');
      if (minRating) params.append('minRating', minRating);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', page.toString());
      params.append('limit', '8');

      setSearchParams(params, { replace: true });

      const res = await api.get(`/providers?${params.toString()}`);
      setProviders(res.data?.providers || []);
      setPagination(res.data?.pagination || { total: 0, pages: 1, page: 1 });
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setNeighborhood('');
    setVerifiedOnly(false);
    setMinRating('');
    setMaxPrice('');
    setSortBy('trustScore');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Local Service Providers
        </h1>
        <p className="text-sm text-slate-500">
          Connect directly with verified local tradespeople, repair technicians, and neighborhood pros.
        </p>
      </div>

      {/* Main Grid: Filters Sidebar + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Panel (Sidebar on desktop) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Search by Keyword */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Search Skills & Bio</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="E.g. pipe fitting, wiring..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Service Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>

          {/* Locality / Neighborhood */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Neighborhood</label>
            <select
              value={neighborhood}
              onChange={(e) => {
                setNeighborhood(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">All Neighborhoods</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="Koramangala">Koramangala</option>
              <option value="HSR Layout">HSR Layout</option>
              <option value="Whitefield">Whitefield</option>
              <option value="Jayanagar">Jayanagar</option>
            </select>
          </div>

          {/* Verified Provider Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <span className="text-xs font-medium text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Partners Only
              </span>
            </label>
          </div>

          {/* Rating Filter */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5★ and above</option>
              <option value="4.0">4.0★ and above</option>
              <option value="3.5">3.5★ and above</option>
            </select>
          </div>

          {/* Max Hourly Rate */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Max Hourly Rate</span>
              <span className="text-brand-600">{maxPrice ? `₹${maxPrice}` : 'Any'}</span>
            </div>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={maxPrice || 1500}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹200/hr</span>
              <span>₹1500/hr</span>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Results Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{providers.length}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.total}</span> providers
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-700 focus:outline-none"
              >
                <option value="trustScore">Highest Trust Score</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="completedBookings">Most Bookings</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 bg-white rounded-2xl border border-slate-200">
              <LoadingSpinner size="lg" />
              <p className="text-center text-xs text-slate-500 mt-2">Discovering nearby providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching providers found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your neighborhood filter or adjusting your price and category criteria.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((profile) => {
                const u = profile.user || {};
                const isVerified = profile.verificationStatus === 'VERIFIED';

                return (
                  <div
                    key={profile._id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-bold text-lg flex items-center justify-center shrink-0">
                            {u.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {u.name}
                            </h3>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{profile.neighborhood || u.neighborhood}</span>
                              <span className="text-slate-300">•</span>
                              <span>{profile.experienceYears}y exp</span>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-extrabold text-slate-900">
                            ₹{profile.pricing?.hourlyRate || 400}
                            <span className="text-[10px] font-normal text-slate-500">/hr</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            +₹{profile.pricing?.baseConsultationFee || 100} visit
                          </span>
                        </div>
                      </div>

                      {/* Trust & Ratings */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <TrustBadge isVerified={isVerified} trustScore={profile.trustScore} />
                        <RatingStars rating={profile.rating} reviewCount={profile.reviewCount} />
                      </div>

                      {/* Bio Snippet */}
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {profile.bio || 'Experienced local professional offering trusted neighbourhood repair and service assistance.'}
                      </p>

                      {/* Skills Tags */}
                      {profile.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {profile.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {profile.skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 px-1 py-0.5">
                              +{profile.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{profile.completedBookings} jobs completed</span>
                      </span>

                      <Link
                        to={`/providers/${profile._id}`}
                        className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        View Profile & Book
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-medium text-slate-600 px-3">
                Page {page} of {pagination.pages}
              </span>

              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
