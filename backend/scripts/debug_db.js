/**
 * MongoDB Connection Debug Script
 * Run with: node backend/scripts/debug_db.js
 */
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

async function debugConnection() {
    console.log('=== MongoDB Connection Debug ===\n');

    // Mask password for display
    const maskedUri = uri ? uri.replace(/:([^@]+)@/, ':***@') : 'NOT SET';
    console.log('Connection String:', maskedUri);
    console.log('');

    if (!uri) {
        console.error('❌ ERROR: No MONGO_URI or MONGODB_URI found in .env');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        console.log('Connecting...');
        await client.connect();
        console.log('✅ Connected successfully!\n');

        // List all databases
        const adminDb = client.db().admin();
        const dbs = await adminDb.listDatabases();
        console.log('Databases found:');
        dbs.databases.forEach(db => {
            console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024).toFixed(1)} KB)`);
        });
        console.log('');

        // Try to access the housing database specifically
        const housingDb = client.db('edyou-housing');
        const collections = await housingDb.listCollections().toArray();
        console.log(`Collections in 'edyou-housing':`);
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });
        console.log('');

        // Count users
        const usersCount = await housingDb.collection('users').countDocuments();
        console.log(`Users count: ${usersCount}`);

        // Count listings
        const listingsCount = await housingDb.collection('listings').countDocuments();
        console.log(`Listings count: ${listingsCount}`);

    } catch (error) {
        console.error('❌ Connection Error:', error.message);
        console.error('\nFull error:', error);
    } finally {
        await client.close();
        console.log('\nConnection closed.');
    }
}

debugConnection();
