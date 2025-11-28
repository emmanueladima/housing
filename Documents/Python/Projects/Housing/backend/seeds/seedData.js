import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import RoommateProfile from '../models/RoommateProfile.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await RoommateProfile.deleteMany({});

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create sample users
    console.log('👥 Creating sample users...');
    const users = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0101',
        school: 'Oregon State University',
        graduationYear: 2025,
        isVerified: true,
        userType: 'student',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0102',
        school: 'Oregon State University',
        graduationYear: 2026,
        isVerified: true,
        userType: 'student',
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0103',
        school: 'Oregon State University',
        graduationYear: 2024,
        isVerified: true,
        userType: 'landlord',
        isVerifiedLandlord: true,
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@uoregon.edu',
        password: hashedPassword,
        phone: '541-555-0104',
        school: 'University of Oregon',
        graduationYear: 2025,
        isVerified: true,
        userType: 'landlord',
        isVerifiedLandlord: true,
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0105',
        school: 'Oregon State University',
        graduationYear: 2025,
        isVerified: true,
        userType: 'both',
        isVerifiedLandlord: true,
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Get landlord users for listings
    const landlords = users.filter(u => u.userType === 'landlord' || u.userType === 'both');

    // Create sample listings
    console.log('🏠 Creating sample listings...');
    const listings = await Listing.insertMany([
      {
        title: 'Modern 2BR Apartment Near Campus',
        description: 'Beautiful 2-bedroom apartment just 5 minutes walk from OSU campus. Recently renovated with modern appliances, in-unit laundry, and plenty of natural light. Perfect for students!',
        address: '123 Campus Way',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '97330',
        rent: 1200,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 850,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        ],
        amenities: ['WiFi', 'Laundry In Unit', 'Parking', 'Pet Friendly', 'Furnished'],
        tags: ['verified', 'popular'],
        university: 'Oregon State University',
        distanceToUniversity: 0.3,
        availableDate: new Date('2024-09-01'),
        leaseTerm: '12 months',
        utilities: {
          included: ['Water', 'Trash'],
          tenantPays: ['Electricity', 'Internet'],
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: true,
          partiesAllowed: false,
        },
        landlord: landlords[0]._id,
        coordinates: { lat: 44.5646, lng: -123.2620 },
        isActive: true,
        badges: ['Verified Landlord', 'New Listing'],
      },
      {
        title: 'Cozy Studio Close to Downtown',
        description: 'Charming studio apartment in downtown Corvallis. Walking distance to restaurants, shops, and OSU. Utilities included in rent!',
        address: '456 Monroe Ave',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '97330',
        rent: 750,
        bedrooms: 0,
        bathrooms: 1,
        sqft: 450,
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
        ],
        amenities: ['WiFi', 'Parking', 'Utilities Included'],
        tags: ['affordable', 'downtown'],
        university: 'Oregon State University',
        distanceToUniversity: 1.2,
        availableDate: new Date('2024-08-15'),
        leaseTerm: '9 months',
        utilities: {
          included: ['Water', 'Trash', 'Electricity', 'Internet'],
          tenantPays: [],
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
        },
        landlord: landlords[1]._id,
        coordinates: { lat: 44.5685, lng: -123.2612 },
        isActive: true,
        badges: ['Utilities Included'],
      },
      {
        title: 'Spacious 3BR House with Backyard',
        description: 'Large 3-bedroom house perfect for roommates. Features include a full kitchen, 2 bathrooms, spacious living room, and private backyard. Great for entertaining!',
        address: '789 Western Blvd',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '97330',
        rent: 1800,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1400,
        images: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        ],
        amenities: ['Parking', 'Laundry In Unit', 'Backyard', 'Pet Friendly', 'Dishwasher'],
        tags: ['spacious', 'roommate-friendly'],
        university: 'Oregon State University',
        distanceToUniversity: 2.1,
        availableDate: new Date('2024-09-15'),
        leaseTerm: '12 months',
        utilities: {
          included: ['Trash'],
          tenantPays: ['Water', 'Electricity', 'Internet', 'Gas'],
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: true,
          partiesAllowed: true,
        },
        landlord: landlords[0]._id,
        coordinates: { lat: 44.5589, lng: -123.2794 },
        isActive: true,
        badges: ['Price Drop'],
      },
      {
        title: '1BR Apartment - Sublease Available',
        description: 'Looking for someone to take over my lease starting June 1st. Great 1-bedroom apartment with all amenities. Close to bus line.',
        address: '321 Circle Blvd',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '97330',
        rent: 900,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 600,
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
        ],
        amenities: ['WiFi', 'Parking', 'Fitness Center', 'Pool'],
        tags: ['sublease'],
        university: 'Oregon State University',
        distanceToUniversity: 1.5,
        availableDate: new Date('2024-06-01'),
        leaseTerm: '6 months',
        utilities: {
          included: ['Water', 'Trash'],
          tenantPays: ['Electricity', 'Internet'],
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
        },
        landlord: landlords[2]._id,
        coordinates: { lat: 44.5734, lng: -123.2689 },
        isActive: true,
        isSublease: true,
        subleaseDetails: {
          originalLeaseEnd: new Date('2024-12-31'),
          reason: 'Graduating early',
        },
        badges: ['Sublease Available', 'Verified Landlord'],
      },
      {
        title: 'Luxury 4BR Apartment with Amenities',
        description: 'Premium 4-bedroom apartment with top-tier amenities. Features include granite countertops, stainless steel appliances, walk-in closets, and balcony views. Building amenities include fitness center, study lounges, and parking garage.',
        address: '555 Luxury Lane',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '97330',
        rent: 2400,
        bedrooms: 4,
        bathrooms: 2,
        sqft: 1600,
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        ],
        amenities: ['WiFi', 'Laundry In Unit', 'Parking', 'Fitness Center', 'Balcony', 'Dishwasher', 'Air Conditioning'],
        tags: ['luxury', 'popular'],
        university: 'Oregon State University',
        distanceToUniversity: 0.8,
        availableDate: new Date('2024-09-01'),
        leaseTerm: '12 months',
        utilities: {
          included: ['Water', 'Trash', 'Internet'],
          tenantPays: ['Electricity'],
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: true,
          partiesAllowed: true,
        },
        landlord: landlords[1]._id,
        coordinates: { lat: 44.5695, lng: -123.2675 },
        isActive: true,
        badges: ['Showcase', 'Verified Landlord'],
      },
      {
        title: 'Affordable 2BR Near Campus - Bike Friendly',
        description: 'Budget-friendly 2-bedroom apartment perfect for students. Covered bike parking and on bus route. Simple and clean.',
        address: '234 Budget St',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '97330',
        rent: 950,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 700,
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
        amenities: ['Parking', 'Laundry On Site'],
        tags: ['affordable', 'bike-friendly'],
        university: 'Oregon State University',
        distanceToUniversity: 0.6,
        availableDate: new Date('2024-08-01'),
        leaseTerm: '12 months',
        utilities: {
          included: ['Water', 'Trash'],
          tenantPays: ['Electricity', 'Internet'],
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
        },
        landlord: landlords[2]._id,
        coordinates: { lat: 44.5620, lng: -123.2701 },
        isActive: true,
        badges: [],
      },
      {
        title: 'Private Room in Shared 5BR House',
        description: 'Single room available in a 5-bedroom house. Share common areas with 4 other students. Great community atmosphere!',
        address: '678 Shared Dr',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '97330',
        rent: 550,
        bedrooms: 1,
        bathrooms: 2.5,
        sqft: 200,
        images: [
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
        ],
        amenities: ['WiFi', 'Laundry In Unit', 'Parking', 'Backyard'],
        tags: ['shared', 'affordable'],
        university: 'Oregon State University',
        distanceToUniversity: 1.8,
        availableDate: new Date('2024-07-01'),
        leaseTerm: 'Flexible',
        utilities: {
          included: ['WiFi', 'Water', 'Trash'],
          tenantPays: ['Split Electricity'],
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: true,
        },
        landlord: landlords[0]._id,
        coordinates: { lat: 44.5542, lng: -123.2812 },
        isActive: true,
        badges: [],
      },
      {
        title: 'Charming 1BR Cottage Style',
        description: 'Unique cottage-style 1-bedroom unit with character. Hardwood floors, updated kitchen, and quiet neighborhood. Perfect for graduate students.',
        address: '890 Cottage Ln',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '97330',
        rent: 1050,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 650,
        images: [
          'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
        ],
        amenities: ['Parking', 'Backyard', 'Pet Friendly'],
        tags: ['quiet', 'charming'],
        university: 'Oregon State University',
        distanceToUniversity: 2.5,
        availableDate: new Date('2024-08-20'),
        leaseTerm: '12 months',
        utilities: {
          included: ['Water', 'Trash'],
          tenantPays: ['Electricity', 'Internet', 'Gas'],
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: true,
          partiesAllowed: false,
        },
        landlord: landlords[1]._id,
        coordinates: { lat: 44.5501, lng: -123.2889 },
        isActive: true,
        badges: [],
      },
    ]);

    console.log(`✅ Created ${listings.length} listings`);

    // Create sample roommate profiles
    console.log('👫 Creating sample roommate profiles...');
    const roommateProfiles = await RoommateProfile.insertMany([
      {
        user: users[0]._id,
        bio: 'Easygoing engineering student looking for a clean and respectful roommate. I enjoy cooking, gaming, and outdoor activities. Non-smoker and prefer a quiet environment during weekdays.',
        preferences: {
          sleepSchedule: 'early-bird',
          cleanliness: 'very-clean',
          socialLevel: 'somewhat-social',
          noiseTolerance: 'quiet',
          guestsFrequency: 'rarely',
          petsOk: true,
          smokingOk: false,
          interests: ['Gaming', 'Hiking', 'Cooking', 'Movies'],
        },
        lookingFor: {
          housingType: ['apartment', 'house'],
          location: 'Corvallis',
          maxBudget: 800,
          moveInDate: new Date('2024-09-01'),
        },
        isActive: true,
      },
      {
        user: users[1]._id,
        bio: 'Business major who loves staying active and social. Looking for roommates who enjoy going out on weekends but also respect study time. Big fan of yoga and farmers markets!',
        preferences: {
          sleepSchedule: 'night-owl',
          cleanliness: 'clean',
          socialLevel: 'very-social',
          noiseTolerance: 'moderate',
          guestsFrequency: 'sometimes',
          petsOk: true,
          smokingOk: false,
          interests: ['Yoga', 'Social Events', 'Cooking', 'Reading', 'Fitness'],
        },
        lookingFor: {
          housingType: ['apartment'],
          location: 'Corvallis',
          maxBudget: 900,
          moveInDate: new Date('2024-08-15'),
        },
        isActive: true,
      },
    ]);

    console.log(`✅ Created ${roommateProfiles.length} roommate profiles`);

    console.log('');
    console.log('🎉 Seed data created successfully!');
    console.log('');
    console.log('📝 Sample Login Credentials:');
    console.log('   Email: john.doe@oregonstate.edu');
    console.log('   Password: password123');
    console.log('');
    console.log('   Email: jane.smith@oregonstate.edu');
    console.log('   Password: password123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed script
connectDB().then(() => seedData());



