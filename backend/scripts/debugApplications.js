
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// specific path to .env file at backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const debugApplications = async () => {
    try {
        console.log('Connecting to MongoDB at:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get Users
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('\n--- USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u._id}, Email: ${u.email}, Type: ${u.userType}, Name: ${u.firstName} ${u.lastName}`);
        });

        // Get Listings
        const listings = await mongoose.connection.db.collection('listings').find({}).toArray();
        console.log('\n--- LISTINGS ---');
        listings.forEach(l => {
            const owner = users.find(u => u._id.toString() === l.landlord.toString());
            console.log(`ID: ${l._id}, Title: "${l.title}", LandlordID: ${l.landlord} (${owner ? owner.email : 'UNKNOWN USER'})`);
        });

        // Get Applications
        const applications = await mongoose.connection.db.collection('applications').find({}).toArray();
        console.log('\n--- APPLICATIONS ---');
        applications.forEach(a => {
            const listing = listings.find(l => l._id.toString() === a.listingId.toString());
            const applicant = users.find(u => u._id.toString() === a.userId.toString());

            console.log(`AppID: ${a._id}`);
            console.log(`  Status: ${a.status}`);
            console.log(`  Applicant: ${applicant ? applicant.email : 'UNKNOWN'}`);
            console.log(`  Listing: "${listing ? listing.title : 'UNKNOWN'}"`);
            if (listing) {
                const landlord = users.find(u => u._id.toString() === listing.landlord.toString());
                console.log(`  Listing Owner (Landlord): ${listing.landlord} (${landlord ? landlord.email : 'UNKNOWN'})`);
            }
            console.log('------------------------------------------------');
        });

        await mongoose.disconnect();
        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugApplications();
