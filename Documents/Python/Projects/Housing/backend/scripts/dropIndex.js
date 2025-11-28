import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edyou-housing');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('listings');
    
    // Drop the problematic index
    try {
      await collection.dropIndex('coordinates_2dsphere');
      console.log('✅ Dropped coordinates_2dsphere index');
    } catch (error) {
      console.log('Index may not exist:', error.message);
    }
    
    console.log('✅ Complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndex();




