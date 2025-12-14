import User from '../models/User.js';

const seedDevUser = async () => {
  try {
    console.log('🌱 Checking for dev test user...');

    // Check if dev user already exists
    const existingUser = await User.findOne({ email: 'dev@oregonstate.edu' });

    if (existingUser) {
      console.log('✅ Dev user already exists');
      return existingUser;
    }

    // Create dev user
    const devUser = new User({
      firstName: 'Dev',
      lastName: 'User',
      email: 'dev@oregonstate.edu',
      password: 'devtest123',
      phone: '555-0100',
      school: 'Oregon State University',
      graduationYear: 2025,
      userType: 'both', // Can be both student and landlord
      isVerified: true, // Skip email verification for dev
    });

    await devUser.save();
    console.log('✅ Dev user created successfully');
    console.log('📧 Email: dev@oregonstate.edu');
    console.log('🔑 Password: devtest123');

    return devUser;
  } catch (error) {
    console.error('❌ Error seeding dev user:', error.message);
    // Don't throw in production, just log
    return null;
  }
};

export default seedDevUser;
