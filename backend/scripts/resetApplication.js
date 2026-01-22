import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function resetApplication() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('applications').updateOne(
            { status: 'approved' },
            { $set: { status: 'submitted', tourScheduled: null } }
        );

        console.log('Reset:', result.modifiedCount, 'application(s) back to submitted');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetApplication();
