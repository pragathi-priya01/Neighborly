import { z } from 'zod';

export const createServiceRequestSchema = z.object({
  category: z.string().min(2, 'Category is required'),
  title: z.string().optional().default(''),
  description: z.string().min(10, 'Please provide at least 10 characters describing the issue'),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.enum(['Morning', 'Afternoon', 'Evening', 'Flexible']).default('Morning'),
  budget: z.number().min(50, 'Budget must be at least ₹50'),
  neighborhood: z.string().min(2, 'Neighborhood is required'),
  aiAssisted: z.boolean().optional().default(false),
  aiExtractedData: z.object({
    rawPrompt: z.string().optional(),
    confidence: z.number().optional(),
  }).optional(),
});

export const updateServiceRequestSchema = z.object({
  description: z.string().min(10).optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.enum(['Morning', 'Afternoon', 'Evening', 'Flexible']).optional(),
  budget: z.number().min(50).optional(),
  neighborhood: z.string().min(2).optional(),
  status: z.enum(['OPEN', 'CANCELLED']).optional(),
});

export const createProviderOfferSchema = z.object({
  proposedPrice: z.number().min(50, 'Offer price must be at least ₹50'),
  message: z.string().max(500).optional().default(''),
  estimatedServiceTime: z.string().min(1, 'Estimated service time is required'),
});
