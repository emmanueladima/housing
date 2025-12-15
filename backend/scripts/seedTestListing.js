import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const seedTestListing = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get dev user
    const devUser = await mongoose.connection.db.collection('users').findOne({ email: 'dev@oregonstate.edu' });
    if (!devUser) {
      console.log('Dev user not found');
      process.exit(1);
    }
    console.log('Found dev user:', devUser._id);

    // Delete old test listing
    await mongoose.connection.db.collection('listings').deleteMany({ title: /Test Apartment/ });
    console.log('Deleted old test listings');

    // Create a test listing with all required fields
    const listing = {
      title: 'Test Apartment - 2BR near Campus',
      address: '123 Main St',
      city: 'Corvallis',
      state: 'OR',
      zipCode: '97330',
      rent: 1200,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 900,
      tags: ['apartment'],
      description: 'A cozy 2-bedroom apartment perfect for students. Close to Oregon State campus.',
      amenities: ['parking', 'WiFi'],
      images: [],
      availableDate: new Date(),
      leaseTerm: '1-year',
      university: 'Oregon State University',
      landlord: devUser._id,
      isActive: true,
      totalApplications: 0,
      badges: ['new'],
      coordinates: { lat: 44.5646, lng: -123.2620 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mongoose.connection.db.collection('listings').insertOne(listing);
    console.log('Created test listing:', result.insertedId);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedTestListing();
