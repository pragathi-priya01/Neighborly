import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['RESIDENT', 'PROVIDER']).default('RESIDENT'), // Admins cannot be registered publicly
  phone: z.string().optional().default(''),
  neighborhood: z.string().min(2, 'Neighborhood/locality is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  neighborhood: z.string().min(2).optional(),
  profileImage: z.string().url().or(z.literal('')).optional(),
});
