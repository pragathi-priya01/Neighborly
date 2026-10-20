import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { ProviderProfile } from '../models/ProviderProfile.js';

export const CORE_SERVICES = [
  {
    name: 'Plumbing & Pipe Repair',
    category: 'Plumbing',
    description: 'Tap repair, leak fixing, pipe replacements, sanitary and drainage solutions.',
    icon: 'Wrench',
    basePriceEstimate: 450,
    active: true,
  },
  {
    name: 'Electrical Repair & Wiring',
    category: 'Electrical',
    description: 'Short circuits, switchboard repair, MCB fixes, lighting and fan installation.',
    icon: 'Zap',
    basePriceEstimate: 400,
    active: true,
  },
  {
    name: 'Deep Home Cleaning',
    category: 'Cleaning',
    description: 'Full house deep cleaning, bathroom sanitization, kitchen and sofa care.',
    icon: 'Sparkles',
    basePriceEstimate: 850,
    active: true,
  },
  {
    name: 'Appliance Repair & AC Care',
    category: 'Appliance Repair',
    description: 'AC servicing and gas refill, refrigerator, washing machine, and microwave repairs.',
    icon: 'Cpu',
    basePriceEstimate: 600,
    active: true,
  },
  {
    name: 'Carpentry & Woodwork',
    category: 'Carpentry',
    description: 'Furniture assembly, lock repair, door hinges, shelves, and custom woodwork.',
    icon: 'Hammer',
    basePriceEstimate: 500,
    active: true,
  },
  {
    name: 'Home Tutoring',
    category: 'Tutoring',
    description: 'Personalized math, science, and language lessons for school and exam prep.',
    icon: 'GraduationCap',
    basePriceEstimate: 700,
    active: true,
  },
  {
    name: 'Home Cooking & Chef Services',
    category: 'Cooking',
    description: 'Daily fresh meal preparation, healthy regional cuisines, and party catering.',
    icon: 'ChefHat',
    basePriceEstimate: 650,
    active: true,
  },
  {
    name: 'Tailoring & Alterations',
    category: 'Tailoring',
    description: 'Garment stitching, dress alterations, curtain hemming, and custom fitting.',
    icon: 'Scissors',
    basePriceEstimate: 350,
    active: true,
  },
];

export const bootstrapAdminAndCatalog = async () => {
  logger.info('Starting Idempotent Bootstrap (Admin & Core Service Catalog)...');

  // 1. Ensure DB connection
  await connectDB();

  // 2. Idempotent Admin Account Provisioning
  const adminEmail = 'admin@neighbourly.local';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Admin@1234', salt);

    const admin = await User.create({
      name: 'Platform Administrator',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      phone: '+91 99999 00000',
      neighborhood: 'Indiranagar',
      accountStatus: 'ACTIVE',
      emailVerified: true,
    });
    logger.info(`✅ Initialized Administrator account: ${admin.email} (Role: ${admin.role})`);
  } else {
    logger.info(`ℹ️ Administrator account already present: ${existingAdmin.email} (Role: ${existingAdmin.role})`);
  }

  // 3. Idempotent Service Catalog Population
  let insertedServices = 0;
  for (const s of CORE_SERVICES) {
    const existing = await Service.findOne({ category: s.category });
    if (!existing) {
      await Service.create(s);
      insertedServices++;
    }
  }

  const totalServices = await Service.countDocuments();
  logger.info(`✅ Service Catalog ready: ${totalServices} total categories (${insertedServices} newly added, existing preserved).`);

  // 4. Idempotent Resident & Provider Demo Accounts Provisioning
  const residentEmail = 'arun.resident@neighbourly.local';
  let resident = await User.findOne({ email: residentEmail });
  if (!resident) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Resident@123', salt);
    resident = await User.create({
      name: 'Arun Sharma',
      email: residentEmail,
      passwordHash,
      role: 'RESIDENT',
      phone: '+91 98765 11111',
      neighborhood: 'Indiranagar',
      accountStatus: 'ACTIVE',
      emailVerified: true,
    });
    logger.info(`✅ Initialized Resident demo account: ${resident.email}`);
  }

  const providerEmail = 'rajesh.plumbing@neighbourly.local';
  let providerUser = await User.findOne({ email: providerEmail });
  if (!providerUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Provider@123', salt);
    providerUser = await User.create({
      name: 'Rajesh Kumar',
      email: providerEmail,
      passwordHash,
      role: 'PROVIDER',
      phone: '+91 98765 33333',
      neighborhood: 'Indiranagar',
      accountStatus: 'ACTIVE',
      emailVerified: true,
    });

    const plumbingService = await Service.findOne({ category: 'Plumbing' });

    await ProviderProfile.create({
      user: providerUser._id,
      bio: 'Licensed master plumber with 8+ years experience solving water leaks, bathroom fittings, and sanitary line issues across Indiranagar.',
      skills: ['Pipe Fitting', 'Tap Repair', 'Geyser Installation', 'Drainage Unclogging'],
      services: plumbingService ? [plumbingService._id] : [],
      experienceYears: 8,
      pricing: { hourlyRate: 450, baseConsultationFee: 150 },
      neighborhood: 'Indiranagar',
      serviceRadiusKm: 15,
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: ['Morning', 'Afternoon', 'Evening'],
        isAvailableNow: true,
        isAcceptingRequests: true,
      },
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 24,
      completedBookings: 28,
      completionRate: 98,
      trustScore: 92,
    });
    logger.info(`✅ Initialized Provider demo account & profile: ${providerUser.email}`);
  }

  // 5. Verify existing Provider Profiles have service linkages
  const plumbingDoc = await Service.findOne({ category: 'Plumbing' });
  if (plumbingDoc) {
    const profiles = await ProviderProfile.find({
      $or: [{ services: { $size: 0 } }, { services: { $exists: false } }],
    });
    for (const p of profiles) {
      p.services = [plumbingDoc._id];
      await p.save();
    }
    if (profiles.length > 0) {
      logger.info(`ℹ️ Linked default service category to ${profiles.length} unassigned provider profiles.`);
    }
  }

  logger.info('🎉 Bootstrap completed successfully without overwriting any existing records.');
};

// Direct script execution check
if (process.argv[1] && process.argv[1].endsWith('bootstrapAdminAndCatalog.js')) {
  bootstrapAdminAndCatalog()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error({ err: err.message }, 'Bootstrap script failed');
      await disconnectDB();
      process.exit(1);
    });
}
