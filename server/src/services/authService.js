import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export class AuthService {
  static generateToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  static async register({ name, email, password, role = 'RESIDENT', phone, neighborhood }) {
    // 1. Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    // 2. Strict Role Protection: Public registration can NEVER register as ADMIN
    const safeRole = role === 'PROVIDER' ? 'PROVIDER' : 'RESIDENT';

    // 3. Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: safeRole,
      phone: phone || '',
      neighborhood: neighborhood || 'Indiranagar',
    });

    let providerProfile = null;
    // 5. If provider, initialize ProviderProfile
    if (safeRole === 'PROVIDER') {
      providerProfile = await ProviderProfile.create({
        user: user._id,
        neighborhood: user.neighborhood,
        bio: `Hi, I am ${user.name}, ready to assist with neighborhood services.`,
        verificationStatus: 'PENDING',
      });
    }

    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      providerProfile,
      token,
    };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.accountStatus === 'SUSPENDED') {
      throw ApiError.forbidden('Your account has been suspended. Please contact support.');
    }

    let providerProfile = null;
    if (user.role === 'PROVIDER') {
      providerProfile = await ProviderProfile.findOne({ user: user._id }).populate('services');
    }

    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      providerProfile,
      token,
    };
  }

  static async getMe(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    let providerProfile = null;
    if (user.role === 'PROVIDER') {
      providerProfile = await ProviderProfile.findOne({ user: user._id }).populate('services');
    }

    return {
      user: user.toJSON(),
      providerProfile,
    };
  }

  static async updateProfile(userId, updateData) {
    // Disallow role or email changes directly here
    const { name, phone, neighborhood, profileImage } = updateData;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(neighborhood && { neighborhood }),
        ...(profileImage !== undefined && { profileImage }),
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    let providerProfile = null;
    if (user.role === 'PROVIDER') {
      // Also sync neighborhood if changed
      if (neighborhood) {
        await ProviderProfile.findOneAndUpdate({ user: user._id }, { neighborhood });
      }
      providerProfile = await ProviderProfile.findOne({ user: user._id }).populate('services');
    }

    return {
      user: user.toJSON(),
      providerProfile,
    };
  }
}
