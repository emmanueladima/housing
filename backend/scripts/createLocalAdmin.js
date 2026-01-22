import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';

const createLocalAdmin = async () => {
  try {
    // Explicitly check NODE_ENV to add an extra layer of safety
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Warning: You are running this script in PRODUCTION mode.');
      console.warn('⚠️  This will create a test admin account in your production database.');
      console.warn('⚠️  Press Ctrl+C immediately to abort if this is unintended.');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
    }

    await connectDB();
    console.log(`🔌 Connected to DB: ${process.env.MONGO_URI}`);

    const adminEmail = 'admin@localhost.com';
    // Note: In a real scenario, this password should be hashed by the User model's pre-save hook
    const adminPassword = 'AdminPass123!';

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  User with this email already exists.');
      if (existingAdmin.role !== 'admin') {
        console.log('🔄 Updating existing user to Admin role...');
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ User updated to Admin role.');
      } else {
        console.log('✅ User is already an Admin.');
      }
      process.exit();
    }

    // Create new Admin
    const adminUser = new User({
      firstName: 'Local',
      lastName: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      userType: 'both',
      phone: '000-000-0000',
      school: 'Localhost University',
      graduationYear: 2025,
      isVerified: true,
      verification: {
        email: true,
        studentDomain: true
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log(`📧 Email:    ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('-----------------------------------');

    process.exit();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createLocalAdmin();
