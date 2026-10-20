import { z } from 'zod';

export const createDirectBookingSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  serviceId: z.string().optional(),
  serviceCategory: z.string().min(2, 'Service category is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  scheduledTime: z.string().default('Morning'),
  amount: z.number().min(50, 'Amount must be at least ₹50'),
  address: z.string().min(5, 'Service address is required'),
  notes: z.string().optional().default(''),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'ACCEPTED',
    'REJECTED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ]),
  cancellationReason: z.string().optional(),
});
