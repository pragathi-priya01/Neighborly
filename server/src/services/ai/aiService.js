import { z } from 'zod';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { ProviderProfile } from '../../models/ProviderProfile.js';
import { Service } from '../../models/Service.js';

// Zod Schema for Structured AI Request Extraction
export const aiExtractedRequestSchema = z.object({
  category: z.string().default('General Service'),
  title: z.string().default(''),
  description: z.string().min(5),
  preferredDate: z.string().default(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }),
  preferredTime: z.enum(['Morning', 'Afternoon', 'Evening', 'Flexible']).default('Morning'),
  budget: z.number().min(50).default(500),
  neighborhood: z.string().default('Indiranagar'),
  suggestedSkills: z.array(z.string()).default([]),
});

export class AIService {
  /**
   * AI FEATURE 1: Natural Language Service Request Assistant
   * Parses natural language resident input into structured request fields
   */
  static async extractServiceRequest(promptText, userNeighborhood = 'Indiranagar') {
    if (!promptText || promptText.trim().length === 0) {
      throw new Error('Please enter a description of the service you need.');
    }

    // Try LLM API first if AI_API_KEY is configured
    if (env.AI_API_KEY) {
      try {
        const result = await this.callLLMForExtraction(promptText, userNeighborhood);
        if (result) return result;
      } catch (llmError) {
        logger.warn({ err: llmError.message }, 'LLM request extraction failed, falling back to rule-based parser');
      }
    }

    // Deterministic Rule-Based Fallback NLP Parser
    return this.heuristicExtraction(promptText, userNeighborhood);
  }

  /**
   * Deterministic NLP extractor that reliably understands service intents,
   * dates, times, and budgets even when external AI APIs are offline.
   */
  static heuristicExtraction(text, defaultNeighborhood = 'Indiranagar') {
    const lower = text.toLowerCase();

    // 1. Detect Category
    let category = 'General Service';
    let suggestedSkills = [];

    const categoryMap = [
      {
        cat: 'Plumbing',
        keywords: ['plumb', 'pipe', 'tap', 'leak', 'drain', 'sink', 'toilet', 'flush', 'water faucet', 'geyser repair'],
        skills: ['Pipe repair', 'Leak fixing', 'Tap replacement', 'Sanitary installation'],
      },
      {
        cat: 'Electrical',
        keywords: ['electric', 'switch', 'wiring', 'fuse', 'socket', 'short circuit', 'mcb', 'light fixture', 'fan'],
        skills: ['Wiring inspection', 'Socket fixing', 'Ceiling fan repair', 'Switchboard installation'],
      },
      {
        cat: 'Appliance Repair',
        keywords: ['ac', 'air conditioner', 'fridge', 'refrigerator', 'washing machine', 'microwave', 'oven', 'tv', 'cooling'],
        skills: ['AC servicing', 'Gas refilling', 'Compressor repair', 'Motor repair'],
      },
      {
        cat: 'Cleaning',
        keywords: ['clean', 'deep clean', 'mop', 'sanitize', 'dust', 'washroom', 'kitchen clean', 'sofa clean'],
        skills: ['Deep home cleaning', 'Bathroom cleaning', 'Kitchen sanitization', 'Sofa shampooing'],
      },
      {
        cat: 'Carpentry',
        keywords: ['carpenter', 'wood', 'furniture', 'door', 'lock', 'hinge', 'wardrobe', 'table', 'shelf'],
        skills: ['Furniture assembly', 'Door lock repair', 'Hinges fixing', 'Custom woodwork'],
      },
      {
        cat: 'Cooking',
        keywords: ['cook', 'chef', 'meal', 'food', 'dinner', 'lunch', 'breakfast', 'diet'],
        skills: ['North Indian meals', 'South Indian cooking', 'Healthy meal prep'],
      },
      {
        cat: 'Tutoring',
        keywords: ['tutor', 'teach', 'math', 'science', 'physics', 'english', 'exam', 'class'],
        skills: ['School syllabus coaching', 'Math & Science', 'Language fluency'],
      },
      {
        cat: 'Gardening',
        keywords: ['garden', 'plant', 'lawn', 'mow', 'trim', 'prune', 'soil', 'potting'],
        skills: ['Lawn mowing', 'Plant pruning', 'Fertilizer application'],
      },
      {
        cat: 'Computer & Laptop Repair',
        keywords: ['laptop', 'computer', 'pc', 'windows', 'mac', 'format', 'ram', 'screen', 'keyboard', 'virus'],
        skills: ['OS installation', 'Screen replacement', 'Virus removal', 'Hardware upgrade'],
      },
      {
        cat: 'Tailoring',
        keywords: ['tailor', 'stitch', 'alteration', 'dress', 'blouse', 'suit', 'kurta', 'hem'],
        skills: ['Dress stitching', 'Alterations', 'Custom fitting'],
      },
      {
        cat: 'Beauty Services',
        keywords: ['beauty', 'salon', 'haircut', 'facial', 'waxing', 'pedicure', 'manicure', 'makeup'],
        skills: ['Facial treatment', 'Hair styling', 'Manicure & Pedicure'],
      },
    ];

    for (const item of categoryMap) {
      if (item.keywords.some((kw) => lower.includes(kw))) {
        category = item.cat;
        suggestedSkills = item.skills;
        break;
      }
    }

    // 2. Detect Budget (e.g. "₹600", "rs 500", "budget 1200", "around 800", "1000 bucks")
    let budget = 600;
    const budgetMatch = text.match(/(?:(?:rs\.?|inr|₹|budget(?:\s*of|\s*is|\s*around)?)\s*[:=]?\s*(\d{2,6}))|(?:(\d{2,6})\s*(?:rs|inr|rupees|bucks))/i);
    if (budgetMatch) {
      const parsedNum = parseInt(budgetMatch[1] || budgetMatch[2], 10);
      if (parsedNum >= 50 && parsedNum <= 100000) {
        budget = parsedNum;
      }
    }

    // 3. Detect Preferred Time Slot
    let preferredTime = 'Morning';
    if (lower.includes('evening') || lower.includes('night') || lower.includes('after 5')) {
      preferredTime = 'Evening';
    } else if (lower.includes('afternoon') || lower.includes('noon') || lower.includes('post lunch')) {
      preferredTime = 'Afternoon';
    } else if (lower.includes('morning') || lower.includes('am') || lower.includes('early')) {
      preferredTime = 'Morning';
    } else if (lower.includes('anytime') || lower.includes('flexible')) {
      preferredTime = 'Flexible';
    }

    // 4. Detect Preferred Date
    const today = new Date();
    let preferredDate = new Date();
    preferredDate.setDate(today.getDate() + 1); // default tomorrow

    if (lower.includes('today')) {
      preferredDate = today;
    } else if (lower.includes('tomorrow')) {
      preferredDate.setDate(today.getDate() + 1);
    } else if (lower.includes('saturday')) {
      const dayOffset = (6 - today.getDay() + 7) % 7 || 7;
      preferredDate.setDate(today.getDate() + dayOffset);
    } else if (lower.includes('sunday')) {
      const dayOffset = (0 - today.getDay() + 7) % 7 || 7;
      preferredDate.setDate(today.getDate() + dayOffset);
    } else if (lower.includes('this weekend')) {
      const dayOffset = (6 - today.getDay() + 7) % 7 || 7;
      preferredDate.setDate(today.getDate() + dayOffset);
    }

    const formattedDate = preferredDate.toISOString().split('T')[0];

    // 5. Clean Problem Description
    let description = text.trim();
    if (description.length > 300) {
      description = description.substring(0, 300);
    }

    return {
      category,
      title: `${category} Service Request`,
      description,
      preferredDate: formattedDate,
      preferredTime,
      budget,
      neighborhood: defaultNeighborhood,
      suggestedSkills,
      aiAssisted: true,
      source: 'heuristic_nlp',
      confidence: 0.88,
    };
  }

  /**
   * LLM API integration with structured JSON format
   */
  static async callLLMForExtraction(promptText, defaultNeighborhood) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${env.AI_MODEL || 'gemini-1.5-flash'}:generateContent?key=${env.AI_API_KEY}`;

    const systemInstruction = `You are Neighbourly's Service Assistant.
Extract structured service details from the resident's natural language request.
Categories must be one of:
["Plumbing", "Electrical", "Cleaning", "Cooking", "Tutoring", "Tailoring", "Carpentry", "Appliance Repair", "Computer & Laptop Repair", "Gardening", "Beauty Services", "Other"].
Times must be one of: ["Morning", "Afternoon", "Evening", "Flexible"].
Dates must be formatted as YYYY-MM-DD. If unspecified, assume tomorrow.
Return ONLY valid JSON matching this schema:
{
  "category": string,
  "title": string,
  "description": string,
  "preferredDate": "YYYY-MM-DD",
  "preferredTime": "Morning" | "Afternoon" | "Evening" | "Flexible",
  "budget": number,
  "neighborhood": string,
  "suggestedSkills": string[]
}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemInstruction}\n\nResident Request: "${promptText}"\nResident Default Locality: "${defaultNeighborhood}"` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API responded with ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      throw new Error('Empty response from LLM');
    }

    const parsedJson = JSON.parse(rawContent);
    const validated = aiExtractedRequestSchema.parse(parsedJson);

    return {
      ...validated,
      aiAssisted: true,
      source: 'llm',
      confidence: 0.95,
    };
  }

  /**
   * AI FEATURE 2: Hybrid Provider Matching
   * Hard filtering + Multi-Factor Mathematical Scoring + Human-readable explanations
   */
  static async matchProvidersForRequest({
    category,
    neighborhood,
    budget,
    preferredTime,
    preferredDate,
  }) {
    // 1. Backend Hard Filtering
    // Match providers whose category aligns, are accepting requests, and match neighborhood or radius
    const categoryDoc = await Service.findOne({
      $or: [
        { category: new RegExp(category, 'i') },
        { name: new RegExp(category, 'i') },
      ],
    });

    const filter = {
      'availability.isAcceptingRequests': true,
    };

    if (categoryDoc) {
      filter.services = categoryDoc._id;
    }

    // Retrieve candidates
    let candidates = await ProviderProfile.find(filter)
      .populate('user', 'name email phone neighborhood profileImage')
      .populate('services', 'name category icon')
      .limit(20);

    // If hard category filter produced few candidates, broaden to all providers who have skills matching or active in the neighborhood
    if (candidates.length < 3) {
      candidates = await ProviderProfile.find({
        'availability.isAcceptingRequests': true,
      })
        .populate('user', 'name email phone neighborhood profileImage')
        .populate('services', 'name category icon')
        .limit(20);
    }

    // 2. Deterministic Multi-Factor Scoring (0 to 100)
    const scoredProviders = candidates.map((profile) => {
      let score = 0;
      const reasons = [];

      // A. Verification Status (Weight: 25 pts)
      if (profile.verificationStatus === 'VERIFIED') {
        score += 25;
        reasons.push('Verified Neighbourly Provider');
      } else if (profile.verificationStatus === 'IN_REVIEW') {
        score += 15;
        reasons.push('Credentials under review');
      } else {
        score += 10;
      }

      // B. Neighborhood Match (Weight: 25 pts)
      const providerHood = (profile.neighborhood || profile.user?.neighborhood || '').toLowerCase();
      const targetHood = (neighborhood || '').toLowerCase();
      if (providerHood && targetHood && providerHood.includes(targetHood)) {
        score += 25;
        reasons.push(`Operates locally right in ${profile.neighborhood}`);
      } else {
        score += 12;
        reasons.push(`Services surrounding areas within ${profile.serviceRadiusKm || 10}km radius`);
      }

      // C. Rating & Quality (Weight: 20 pts)
      if (profile.reviewCount > 0) {
        const ratingScore = (profile.rating / 5) * 20;
        score += ratingScore;
        reasons.push(`${profile.rating}★ rating from ${profile.reviewCount} neighbor reviews`);
      } else {
        score += 14;
        reasons.push('New active service partner');
      }

      // D. Experience & Completed Bookings (Weight: 15 pts)
      if (profile.completedBookings > 10) {
        score += 15;
        reasons.push(`${profile.completedBookings} completed neighborhood services`);
      } else if (profile.completedBookings > 0) {
        score += 10;
        reasons.push(`${profile.completedBookings} successfully completed jobs`);
      } else {
        score += 8;
      }

      // E. Price Compatibility (Weight: 15 pts)
      const hourly = profile.pricing?.hourlyRate || 400;
      if (budget && hourly <= budget) {
        score += 15;
        reasons.push(`Budget-friendly rate at ₹${hourly}/hr (fits your ₹${budget} budget)`);
      } else {
        score += 8;
        reasons.push(`Standard rate of ₹${hourly}/hr`);
      }

      // Human-readable summary explanation
      const matchScore = Math.min(99, Math.round(score));
      let matchBadge = 'Recommended';
      if (matchScore >= 85) matchBadge = 'Top Match';
      else if (matchScore >= 70) matchBadge = 'Great Fit';

      return {
        providerProfile: profile,
        matchScore,
        matchBadge,
        explanation: reasons.join(' • '),
        bulletPoints: reasons,
      };
    });

    // Sort descending by match score
    scoredProviders.sort((a, b) => b.matchScore - a.matchScore);

    return scoredProviders.slice(0, 8);
  }
}
