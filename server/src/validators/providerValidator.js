import { z } from 'zod';

export const updateProviderProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  pricing: z
    .object({
      hourlyRate: z.number().min(50).optional(),
      baseConsultationFee: z.number().min(0).optional(),
    })
    .optional(),
  neighborhood: z.string().min(2).optional(),
  serviceRadiusKm: z.number().min(1).max(50).optional(),
  availability: z
    .object({
      days: z.array(z.string()).optional(),
      timeSlots: z.array(z.string()).optional(),
      isAvailableNow: z.boolean().optional(),
      isAcceptingRequests: z.boolean().optional(),
    })
    .optional(),
});

export const submitVerificationSchema = z.object({
  documentTitle: z.string().min(2, 'Document title is required'),
  documentUrl: z.string().url('A valid document URL or proof link is required'),
  notes: z.string().optional().default(''),
});
