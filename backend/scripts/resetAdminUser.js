import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdminUser = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        const User = mongoose.connection.collection('users');
        const email = 'admin@collegio.us';
        const newPassword = 'Admin123!';

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Update password and ensure verified
            await User.updateOne(
                { email },
                {
                    $set: {
                        password: hashedPassword,
                        isVerified: true,
                        verificationToken: null
                    }
                }
            );
            console.log('✅ Admin user password reset!');
            console.log('   Email:', email);
            console.log('   New Password:', newPassword);
        } else {
            // Create new admin user
            await User.insertOne({
                firstName: 'Admin',
                lastName: 'User',
                email,
                password: hashedPassword,
                userType: 'both',
                role: 'admin',
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('✅ Admin user created!');
            console.log('   Email:', email);
            console.log('   Password:', newPassword);
        }

        await mongoose.disconnect();
        console.log('✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

resetAdminUser();
