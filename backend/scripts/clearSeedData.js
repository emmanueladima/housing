import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import LifestyleProfile from '../models/LifestyleProfile.js';
import MoveChecklist from '../models/MoveChecklist.js';
import RoommateGroup from '../models/RoommateGroup.js';
import CommunityPost from '../models/CommunityPost.js';
import CommunityComment from '../models/CommunityComment.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import Thread from '../models/Thread.js';
import ThreadParticipant from '../models/ThreadParticipant.js';
import Notification from '../models/Notification.js';

dotenv.config();

/**
 * Clear all seed data from the database
 * WARNING: This will delete ALL data in these collections!
 */
const clearAllData = async () => {
    console.log('🗑️  Starting database cleanup...');
    console.log('⚠️  WARNING: This will delete ALL data from the database!');

    try {
        // Clear all collections
        console.log('\n📦 Clearing Listings...');
        const listingsResult = await Listing.deleteMany({});
        console.log(`   Deleted ${listingsResult.deletedCount} listings`);

        console.log('📦 Clearing Lifestyle Profiles...');
        const profilesResult = await LifestyleProfile.deleteMany({});
        console.log(`   Deleted ${profilesResult.deletedCount} lifestyle profiles`);

        console.log('📦 Clearing Roommate Groups...');
        const groupsResult = await RoommateGroup.deleteMany({});
        console.log(`   Deleted ${groupsResult.deletedCount} roommate groups`);

        console.log('📦 Clearing Community Posts...');
        const postsResult = await CommunityPost.deleteMany({});
        console.log(`   Deleted ${postsResult.deletedCount} community posts`);

        console.log('📦 Clearing Community Comments...');
        const commentsResult = await CommunityComment.deleteMany({});
        console.log(`   Deleted ${commentsResult.deletedCount} community comments`);

        console.log('📦 Clearing Move Checklists...');
        const checklistsResult = await MoveChecklist.deleteMany({});
        console.log(`   Deleted ${checklistsResult.deletedCount} move checklists`);

        console.log('📦 Clearing Matches...');
        const matchesResult = await Match.deleteMany({});
        console.log(`   Deleted ${matchesResult.deletedCount} matches`);

        console.log('📦 Clearing Messages...');
        const messagesResult = await Message.deleteMany({});
        console.log(`   Deleted ${messagesResult.deletedCount} messages`);

        console.log('📦 Clearing Threads...');
        const threadsResult = await Thread.deleteMany({});
        console.log(`   Deleted ${threadsResult.deletedCount} threads`);

        console.log('📦 Clearing Thread Participants...');
        const participantsResult = await ThreadParticipant.deleteMany({});
        console.log(`   Deleted ${participantsResult.deletedCount} thread participants`);

        console.log('📦 Clearing Notifications...');
        const notificationsResult = await Notification.deleteMany({});
        console.log(`   Deleted ${notificationsResult.deletedCount} notifications`);

        // IMPORTANT: We keep Users so people can still log in
        // If you also want to delete users, uncomment the following:
        console.log('📦 Clearing Users (except your admin account if needed)...');
        const usersResult = await User.deleteMany({});
        console.log(`   Deleted ${usersResult.deletedCount} users`);

        console.log('\n✅ Database cleanup completed successfully!');
        console.log('🚀 Your database is now ready for real user data.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    }
};

// Run if called directly
if (process.argv[1].includes('clearSeedData.js')) {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collegio-housing')
        .then(async () => {
            console.log('📦 Connected to MongoDB');
            await clearAllData();
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ MongoDB connection error:', error);
            process.exit(1);
        });
}

export default clearAllData;
