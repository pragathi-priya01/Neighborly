import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';
import {
  User,
  Service,
  ProviderProfile,
  ServiceRequest,
  ProviderOffer,
  Booking,
  BOOKING_STATUS,
  Payment,
  Review,
  Conversation,
  Message,
  Notification,
} from '../models/index.js';

export const seedDatabase = async () => {
  try {
    logger.info('Starting Neighbourly Development Data Seeder...');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // 1. Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      ProviderProfile.deleteMany({}),
      ServiceRequest.deleteMany({}),
      ProviderOffer.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    logger.info('Cleared existing collections.');

    // 2. Hash common password
    const residentSalt = await bcrypt.genSalt(10);
    const residentHash = await bcrypt.hash('Resident@123', residentSalt);
    const providerHash = await bcrypt.hash('Provider@123', residentSalt);
    const adminHash = await bcrypt.hash('Admin@1234', residentSalt);

    // 3. Create Services Catalog
    const servicesData = [
      {
        name: 'Plumbing & Water Systems',
        category: 'Plumbing',
        description: 'Tap repair, leak fixing, pipe replacements, sanitary and drainage solutions.',
        icon: 'Wrench',
        basePriceEstimate: 450,
      },
      {
        name: 'Electrical Repair & Wiring',
        category: 'Electrical',
        description: 'Short circuits, switchboard repair, MCB fixes, lighting and fan installation.',
        icon: 'Zap',
        basePriceEstimate: 400,
      },
      {
        name: 'Deep Home Cleaning',
        category: 'Cleaning',
        description: 'Full house deep cleaning, bathroom sanitization, kitchen and sofa care.',
        icon: 'Sparkles',
        basePriceEstimate: 850,
      },
      {
        name: 'Appliance Repair & AC Care',
        category: 'Appliance Repair',
        description: 'AC servicing and gas refill, refrigerator, washing machine, and microwave repairs.',
        icon: 'Cpu',
        basePriceEstimate: 600,
      },
      {
        name: 'Carpentry & Woodwork',
        category: 'Carpentry',
        description: 'Furniture assembly, lock repair, door hinges, shelves, and custom woodwork.',
        icon: 'Hammer',
        basePriceEstimate: 500,
      },
      {
        name: 'Home Tutoring',
        category: 'Tutoring',
        description: 'Personalized math, science, and language lessons for school and exam prep.',
        icon: 'GraduationCap',
        basePriceEstimate: 700,
      },
      {
        name: 'Home Cooking & Chef Services',
        category: 'Cooking',
        description: 'Daily fresh meal preparation, healthy regional cuisines, and party catering.',
        icon: 'ChefHat',
        basePriceEstimate: 650,
      },
      {
        name: 'Computer & Laptop Repair',
        category: 'Computer & Laptop Repair',
        description: 'OS formatting, virus removal, hardware upgrades, SSD install, and laptop screen repair.',
        icon: 'Laptop',
        basePriceEstimate: 550,
      },
      {
        name: 'Garden Care & Landscaping',
        category: 'Gardening',
        description: 'Lawn mowing, plant pruning, pest management, and balcony garden design.',
        icon: 'Trees',
        basePriceEstimate: 450,
      },
      {
        name: 'Tailoring & Alterations',
        category: 'Tailoring',
        description: 'Doorstep measurement, dress alterations, blouse stitching, and custom outfits.',
        icon: 'Scissors',
        basePriceEstimate: 350,
      },
    ];

    const services = await Service.insertMany(servicesData);
    logger.info(`Inserted ${services.length} service categories.`);

    const serviceMap = {};
    services.forEach((s) => {
      serviceMap[s.category] = s;
    });

    // 4. Create Admin User
    const adminUser = await User.create({
      name: 'Neighbourly Platform Admin',
      email: 'admin@neighbourly.local',
      passwordHash: adminHash,
      role: 'ADMIN',
      phone: '+91 98765 00000',
      neighborhood: 'Central Indiranagar',
      emailVerified: true,
      accountStatus: 'ACTIVE',
    });

    // 5. Create Resident Users
    const resident1 = await User.create({
      name: 'Arun Sharma',
      email: 'arun.resident@neighbourly.local',
      passwordHash: residentHash,
      role: 'RESIDENT',
      phone: '+91 98765 11111',
      neighborhood: 'Indiranagar',
      emailVerified: true,
      accountStatus: 'ACTIVE',
    });

    const resident2 = await User.create({
      name: 'Priya Venkatesh',
      email: 'priya.resident@neighbourly.local',
      passwordHash: residentHash,
      role: 'RESIDENT',
      phone: '+91 98765 22222',
      neighborhood: 'Koramangala',
      emailVerified: true,
      accountStatus: 'ACTIVE',
    });

    // 6. Create Provider Users & Profiles
    const providerUser1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh.plumbing@neighbourly.local',
      passwordHash: providerHash,
      role: 'PROVIDER',
      phone: '+91 98765 33333',
      neighborhood: 'Indiranagar',
      emailVerified: true,
      accountStatus: 'ACTIVE',
    });

    const profile1 = await ProviderProfile.create({
      user: providerUser1._id,
      bio: 'Licensed master plumber with 8+ years experience solving water leaks, bathroom fittings, and sanitary line issues across Indiranagar and Domlur.',
      skills: ['Pipe Fitting', 'Tap Repair', 'Geyser Installation', 'Drainage Unclogging', 'Water Tank Cleaning'],
      services: [serviceMap['Plumbing']._id],
      experienceYears: 8,
      pricing: { hourlyRate: 450, baseConsultationFee: 150 },
      neighborhood: 'Indiranagar',
      serviceRadiusKm: 12,
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
      verificationDocuments: [
        { title: 'Trade License Certification', fileUrl: 'https://example.com/trade_cert.pdf' },
      ],
    });

    const providerUser2 = await User.create({
      name: 'Suresh Babu',
      email: 'suresh.electric@neighbourly.local',
      passwordHash: providerHash,
      role: 'PROVIDER',
      phone: '+91 98765 44444',
      neighborhood: 'Koramangala',
      emailVerified: true,
      accountStatus: 'ACTIVE',
    });

    const profile2 = await ProviderProfile.create({
      user: providerUser2._id,
      bio: 'Certified electrical technician specializing in home wiring, appliance setups, circuit breaker diagnostics, and inverter installations.',
      skills: ['Circuit Troubleshooting', 'Inverter Setup', 'Fan & Light Fixtures', 'MCB Replacement', 'Switchboard Repair'],
      services: [serviceMap['Electrical']._id, serviceMap['Appliance Repair']._id],
      experienceYears: 6,
      pricing: { hourlyRate: 400, baseConsultationFee: 100 },
      neighborhood: 'Koramangala',
      serviceRadiusKm: 15,
      availability: {
        days: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timeSlots: ['Morning', 'Evening'],
        isAvailableNow: true,
        isAcceptingRequests: true,
      },
      verificationStatus: 'VERIFIED',
      rating: 4.8,
      reviewCount: 18,
      completedBookings: 21,
      completionRate: 96,
      trustScore: 88,
    });

    const providerUser3 = await User.create({
      name: 'Anita Fernandez',
      email: 'anita.cleaning@neighbourly.local',
      passwordHash: providerHash,
      role: 'PROVIDER',
      phone: '+91 98765 55555',
      neighborhood: 'Indiranagar',
      emailVerified: true,
      accountStatus: 'ACTIVE',
    });

    const profile3 = await ProviderProfile.create({
      user: providerUser3._id,
      bio: 'Eco-friendly deep cleaning specialist. Providing meticulous kitchen, bathroom, and move-in deep cleaning with non-toxic solutions.',
      skills: ['Kitchen Degreasing', 'Bathroom Descaling', 'Sofa Shampooing', 'Eco-friendly Sanitization'],
      services: [serviceMap['Cleaning']._id],
      experienceYears: 5,
      pricing: { hourlyRate: 600, baseConsultationFee: 200 },
      neighborhood: 'Indiranagar',
      serviceRadiusKm: 10,
      availability: {
        days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: ['Morning', 'Afternoon'],
        isAvailableNow: true,
        isAcceptingRequests: true,
      },
      verificationStatus: 'VERIFIED',
      rating: 5.0,
      reviewCount: 15,
      completedBookings: 19,
      completionRate: 100,
      trustScore: 94,
    });

    const providerUser4 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram.carpenter@neighbourly.local',
      passwordHash: providerHash,
      role: 'PROVIDER',
      phone: '+91 98765 66666',
      neighborhood: 'HSR Layout',
      emailVerified: true,
      accountStatus: 'ACTIVE',
    });

    const profile4 = await ProviderProfile.create({
      user: providerUser4._id,
      bio: 'Skilled carpenter with high expertise in teak, plywood, modular furniture assembly, wardrobe repairs, and locks.',
      skills: ['Door Fitting', 'Modular Furniture Assembly', 'Hinge Adjustment', 'Custom Shelving'],
      services: [serviceMap['Carpentry']._id],
      experienceYears: 7,
      pricing: { hourlyRate: 500, baseConsultationFee: 150 },
      neighborhood: 'HSR Layout',
      serviceRadiusKm: 14,
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['Morning', 'Afternoon', 'Evening'],
        isAvailableNow: true,
        isAcceptingRequests: true,
      },
      verificationStatus: 'IN_REVIEW',
      rating: 4.7,
      reviewCount: 8,
      completedBookings: 9,
      completionRate: 90,
      trustScore: 74,
      verificationDocuments: [
        { title: 'Aadhaar ID Card Proof', fileUrl: 'https://example.com/id_proof.pdf' },
      ],
    });

    // 7. Create Sample Service Request
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const sampleRequest = await ServiceRequest.create({
      requester: resident1._id,
      category: 'Plumbing',
      title: 'Kitchen Tap Leakage and Sink Pipe Drain Issue',
      description: 'My kitchen tap has a continuous drip and the drainage pipe under the sink has a small leak. Need someone tomorrow morning with replacement washers.',
      preferredDate: tomorrowStr,
      preferredTime: 'Morning',
      budget: 650,
      neighborhood: 'Indiranagar',
      status: 'OFFERS_RECEIVED',
      aiAssisted: true,
      aiExtractedData: {
        rawPrompt: 'My kitchen tap has a leak and sink pipe is leaking tomorrow morning, budget around 650 in Indiranagar',
        confidence: 0.94,
        extractedAt: new Date(),
      },
    });

    // 8. Create Sample Offers for this request
    const offer1 = await ProviderOffer.create({
      request: sampleRequest._id,
      provider: providerUser1._id,
      proposedPrice: 600,
      message: 'Hello Arun! I am located right in Indiranagar and can arrive at 10 AM tomorrow morning with all washers and spare pipe seals.',
      estimatedServiceTime: '45-60 mins',
      status: 'PENDING',
    });

    // 9. Create a Sample Completed Booking with Review
    const pastBooking = await Booking.create({
      requester: resident1._id,
      provider: providerUser1._id,
      service: serviceMap['Plumbing']._id,
      serviceCategory: 'Plumbing',
      scheduledDate: '2026-09-20',
      scheduledTime: 'Morning',
      amount: 550,
      status: BOOKING_STATUS.COMPLETED,
      address: '12th Main, 4th Cross, Indiranagar, Bengaluru',
      notes: 'Bathroom shower mixer replacement.',
      completedAt: new Date(Date.now() - 432000000), // 5 days ago
    });

    const paymentRecord = await Payment.create({
      booking: pastBooking._id,
      requester: resident1._id,
      provider: providerUser1._id,
      amount: 550,
      amountPaise: 55000,
      currency: 'INR',
      razorpayOrderId: 'order_test_past_booking_seed_01',
      razorpayPaymentId: 'pay_test_past_booking_seed_01',
      status: 'CAPTURED',
      signatureVerified: true,
      mode: 'test',
    });

    pastBooking.payment = paymentRecord._id;
    await pastBooking.save();

    await Review.create({
      booking: pastBooking._id,
      reviewer: resident1._id,
      provider: providerUser1._id,
      rating: 5,
      comment: 'Rajesh arrived right on time, replaced the shower mixer cleanly and tested everything thoroughly. Super polite and professional neighbor!',
    });

    // 10. Create an Active In-Progress Booking
    const activeBooking = await Booking.create({
      requester: resident2._id,
      provider: providerUser2._id,
      service: serviceMap['Electrical']._id,
      serviceCategory: 'Electrical',
      scheduledDate: tomorrowStr,
      scheduledTime: 'Morning',
      amount: 450,
      status: BOOKING_STATUS.PAID,
      address: '5th Block, Koramangala, Bengaluru',
      notes: 'Main hall ceiling fan wobble and regulator switch replacement.',
    });

    // 11. Create a Conversation between Resident 1 and Provider 1
    const conv = await Conversation.create({
      participants: [resident1._id, providerUser1._id],
      booking: pastBooking._id,
      lastMessage: 'Thank you Rajesh for the quick fix! Left a 5 star review.',
      lastMessageSender: resident1._id,
      lastMessageAt: new Date(),
    });

    await Message.create({
      conversation: conv._id,
      sender: providerUser1._id,
      text: 'Good morning Arun, I have arrived at your apartment gate.',
    });

    await Message.create({
      conversation: conv._id,
      sender: resident1._id,
      text: 'Great, coming down to buzz you in!',
    });

    await Message.create({
      conversation: conv._id,
      sender: resident1._id,
      text: 'Thank you Rajesh for the quick fix! Left a 5 star review.',
    });

    // 12. Create Welcome Notifications
    await Notification.create({
      recipient: resident1._id,
      type: 'SYSTEM',
      title: 'Welcome to Neighbourly!',
      message: 'Discover verified neighbors ready to help with your home service needs.',
      link: '/resident/dashboard',
    });

    await Notification.create({
      recipient: providerUser1._id,
      type: 'SYSTEM',
      title: 'Profile Verified!',
      message: 'Your plumbing credentials have been approved. You now show up as a Verified Provider in Indiranagar search results.',
      link: '/provider/dashboard',
    });

    logger.info('Development Seed Data populated successfully!');
  } catch (error) {
    logger.error({ err: error.message, stack: error.stack }, 'Seeding failed');
    throw error;
  }
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await disconnectDB();
      process.exit(1);
    });
}
