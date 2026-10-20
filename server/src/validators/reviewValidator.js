import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Review must be at least 5 characters').max(1000),
});

export const createDisputeSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(3, 'Reason is required'),
  description: z.string().min(10, 'Please describe the problem in detail (min 10 characters)'),
  evidence: z.array(z.string()).optional().default([]),
});

export const resolveDisputeSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED', 'UNDER_REVIEW']),
  resolution: z.string().min(5, 'Resolution summary is required'),
  adminNotes: z.string().optional().default(''),
});
