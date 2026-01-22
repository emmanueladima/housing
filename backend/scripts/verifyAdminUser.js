import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';

const verifyAdminUser = async () => {
    try {
        await connectDB();
        console.log(`🔌 Connected to DB: ${process.env.MONGODB_URI}`);

        const email = 'admin@localhost.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ Admin user not found!');
        } else {
            console.log('✅ Admin user found:');
            console.log(`- ID: ${user._id}`);
            console.log(`- Email: ${user.email}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- UserType: ${user.userType}`);
            console.log(`- IsVerified: ${user.isVerified}`);

            if (user.role !== 'admin') {
                console.log('⚠️ WARNING: User role is NOT admin!');
            }
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error verifying user:', error);
        process.exit(1);
    }
};

verifyAdminUser();
