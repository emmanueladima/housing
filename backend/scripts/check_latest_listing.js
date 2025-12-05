import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checkLatestListing = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const latestListing = await Listing.findOne().sort({ createdAt: -1 });

        if (latestListing) {
            console.log('Latest Listing Found:');
            console.log(JSON.stringify(latestListing, null, 2));
        } else {
            console.log('No listings found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkLatestListing();
