
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const transferListings = async () => {
    try {
        const targetEmail = process.argv[2];

        if (!targetEmail) {
            console.log('Usage: node transferListings.js <email>');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find target user
        const user = await mongoose.connection.db.collection('users').findOne({ email: targetEmail });

        if (!user) {
            console.log(`User with email ${targetEmail} not found!`);
            // List available users
            const users = await mongoose.connection.db.collection('users').find({}).toArray();
            console.log('Available users:', users.map(u => u.email).join(', '));
            process.exit(1);
        }

        console.log(`Found user: ${user.firstName} ${user.lastName} (${user._id})`);

        // Update all listings
        const result = await mongoose.connection.db.collection('listings').updateMany(
            {},
            { $set: { landlord: user._id } }
        );

        console.log(`✅ Updated ${result.modifiedCount} listings to be owned by ${targetEmail}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

transferListings();
