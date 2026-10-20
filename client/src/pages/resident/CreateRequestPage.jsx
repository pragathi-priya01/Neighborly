import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RatingStars } from '../../components/common/RatingStars';
import { TrustBadge } from '../../components/common/TrustBadge';
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  Users,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const PROMPT_TEMPLATES = [
  {
    title: 'Plumbing Leak',
    prompt: 'My kitchen tap is leaking continuously and pipe under the sink has a drip. Need someone tomorrow morning with replacement seals. Budget around ₹600 in Indiranagar.',
  },
  {
    title: 'AC Servicing',
    prompt: 'My split AC is not cooling properly and making a buzzing noise. Need a technician this Saturday evening. Budget around ₹1000 in Indiranagar.',
  },
  {
    title: 'Electrical Spark',
    prompt: 'The main hall switchboard has a loose socket and sparks when plugging in the iron. Need someone tomorrow afternoon. Budget around ₹450.',
  },
  {
    title: 'Deep House Cleaning',
    prompt: 'Need full deep cleaning for 2BHK flat including bathroom descaling and kitchen degreasing this Sunday morning. Budget around ₹1500.',
  },
];

export const CreateRequestPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [aiExtracting, setAiExtracting] = useState(false);

  // Structured Form State (editable by resident)
  const [formData, setFormData] = useState({
    category: 'Plumbing',
    description: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: 'Morning',
    budget: 600,
    neighborhood: user?.neighborhood || 'Indiranagar',
    aiAssisted: false,
    confidence: null,
  });

  const [matchingProviders, setMatchingProviders] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: AI Assistant Extraction
  const handleAiExtract = async (promptToUse) => {
    const text = promptToUse || naturalPrompt;
    if (!text.trim()) {
      toast.warning('Please enter a description of the problem first.');
      return;
    }

    setAiExtracting(true);
    try {
      const res = await api.post('/ai/extract-request', {
        prompt: text,
        neighborhood: user?.neighborhood || 'Indiranagar',
      });

      if (res.data) {
        setFormData({
          category: res.data.category || 'General Service',
          description: res.data.description || text,
          preferredDate: res.data.preferredDate || formData.preferredDate,
          preferredTime: res.data.preferredTime || 'Morning',
          budget: res.data.budget || 500,
          neighborhood: res.data.neighborhood || user?.neighborhood || 'Indiranagar',
          aiAssisted: true,
          confidence: res.data.confidence || 0.9,
        });

        toast.success('AI successfully analyzed your request! You can review and edit below.');

        // Trigger hybrid provider matching preview
        triggerProviderMatching({
          category: res.data.category,
          neighborhood: res.data.neighborhood || user?.neighborhood || 'Indiranagar',
          budget: res.data.budget,
        });
      }
    } catch (err) {
      toast.error('AI extraction unavailable. Please enter details manually below.');
      setFormData((prev) => ({ ...prev, description: text }));
    } finally {
      setAiExtracting(false);
    }
  };

  // Step 2: Trigger Hybrid Provider Matching
  const triggerProviderMatching = async (criteria) => {
    setMatchingLoading(true);
    try {
      const res = await api.post('/ai/match-providers', criteria || formData);
      setMatchingProviders(res.data || []);
    } catch {
      // Ignore background matching failure
    } finally {
      setMatchingLoading(false);
    }
  };

  // Step 3: Confirm and Publish Request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || formData.description.length < 10) {
      toast.error('Please provide at least 10 characters describing the problem.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/requests', {
        category: formData.category,
        description: formData.description,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        budget: Number(formData.budget),
        neighborhood: formData.neighborhood,
        aiAssisted: formData.aiAssisted,
        aiExtractedData: {
          rawPrompt: naturalPrompt,
          confidence: formData.confidence,
        },
      });

      toast.success('Service request published to eligible local providers!');
      navigate(`/resident/requests/${res.data._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to publish request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Service Assistant</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Post a Neighbourhood Service Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Describe what you need in plain everyday words. Our assistant converts it into structured specs and matches qualified local pros.
        </p>
      </div>

      {/* 1. Natural Language Input Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Describe your problem naturally</span>
          </label>
          <span className="text-[11px] text-slate-400">Plain text → Structured Request</span>
        </div>

        <textarea
          rows={3}
          value={naturalPrompt}
          onChange={(e) => setNaturalPrompt(e.target.value)}
          placeholder="E.g., My kitchen tap is leaking and water pipe has a drip. Need someone tomorrow morning. Budget around ₹600 in Indiranagar."
          className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
        />

        {/* Quick Example Templates */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 block">Try an example:</span>
          <div className="flex flex-wrap gap-2">
            {PROMPT_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.title}
                type="button"
                onClick={() => {
                  setNaturalPrompt(tmpl.prompt);
                  handleAiExtract(tmpl.prompt);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-[11px] font-medium text-slate-700 transition-colors"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleAiExtract()}
            disabled={aiExtracting || !naturalPrompt.trim()}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {aiExtracting ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
            <span>Extract & Match with AI</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Confirmation & Editing Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Verify & Edit Request Details
            </h2>
            <p className="text-xs text-slate-500">
              You can adjust any extracted parameter before broadcasting to providers.
            </p>
          </div>
          {formData.aiAssisted && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> AI Extracted
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Service Category</label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                triggerProviderMatching({ ...formData, category: e.target.value });
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Appliance Repair">Appliance Repair</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Tutoring">Tutoring</option>
              <option value="Cooking">Cooking</option>
              <option value="Tailoring">Tailoring</option>
              <option value="Gardening">Gardening</option>
              <option value="Computer & Laptop Repair">Computer & Laptop Repair</option>
              <option value="Other">Other Neighborhood Service</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Neighborhood / Locality</label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Problem Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of what is needed..."
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Date</label>
            <input
              type="date"
              value={formData.preferredDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Time</label>
            <select
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="Morning">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon">Afternoon (1 PM - 4 PM)</option>
              <option value="Evening">Evening (5 PM - 8 PM)</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Budget (₹ INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="50"
                step="50"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Live Hybrid Provider Matching Preview */}
        {matchingProviders.length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-900">
                  {matchingProviders.length} Top Eligible Local Pros Found
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Deterministic scoring & hard filtering</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {matchingProviders.slice(0, 4).map((m, idx) => {
                const p = m.providerProfile;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{p.user?.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">
                        {m.matchBadge} ({m.matchScore}/100)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{p.neighborhood}</span>
                      <span>•</span>
                      <RatingStars rating={p.rating} reviewCount={p.reviewCount} size="sm" />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-tight italic">
                      "{m.explanation}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Providers will be notified to submit price quotes.
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <LoadingSpinner size="sm" />}
            <span>Publish Service Request</span>
          </button>
        </div>
      </form>
    </div>
  );
};
