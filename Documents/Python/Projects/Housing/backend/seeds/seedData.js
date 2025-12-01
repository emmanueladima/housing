import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import LifestyleProfile from '../models/LifestyleProfile.js';
import RoommateGroup from '../models/RoommateGroup.js';

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
    // Connect to MongoDB
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await LifestyleProfile.deleteMany({});
    // Drop the collection to remove any problematic indexes
    try {
      await mongoose.connection.collection('roommategroups').drop();
    } catch (e) {
      // Ignore error if collection doesn't exist
    }
    await RoommateGroup.deleteMany({});

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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0106',
        school: 'Oregon State University',
        graduationYear: 2027,
        isVerified: true,
        userType: 'student',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      },
      {
        firstName: 'Chris',
        lastName: 'Wilson',
        email: 'chris.wilson@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0107',
        school: 'Oregon State University',
        graduationYear: 2025,
        isVerified: true,
        userType: 'student',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
      },
      {
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex.thompson@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0108',
        school: 'Oregon State University',
        graduationYear: 2024,
        isVerified: true,
        userType: 'student',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
      {
        firstName: 'Jessica',
        lastName: 'Martinez',
        email: 'jessica.martinez@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0109',
        school: 'Oregon State University',
        graduationYear: 2026,
        isVerified: true,
        userType: 'student',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
      },
      {
        firstName: 'Ryan',
        lastName: 'Lee',
        email: 'ryan.lee@oregonstate.edu',
        password: hashedPassword,
        phone: '541-555-0110',
        school: 'Oregon State University',
        graduationYear: 2025,
        isVerified: true,
        userType: 'student',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
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
        amenities: ['WiFi', 'laundry', 'parking', 'pet-friendly', 'furnished'],
        tags: ['apartment', 'student-housing'],
        university: 'Oregon State University',
        distanceToUniversity: 0.3,
        availableDate: new Date('2024-09-01'),
        leaseTerm: '1-year',
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
        badges: ['verified-landlord', 'new'],
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
        amenities: ['WiFi', 'parking'],
        tags: ['studio'],
        university: 'Oregon State University',
        distanceToUniversity: 1.2,
        availableDate: new Date('2024-08-15'),
        leaseTerm: 'academic-year',
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
        badges: ['price-drop'],
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
        amenities: ['parking', 'laundry', 'pet-friendly', 'dishwasher'],
        tags: ['house'],
        university: 'Oregon State University',
        distanceToUniversity: 2.1,
        availableDate: new Date('2024-09-15'),
        leaseTerm: '1-year',
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
        badges: ['price-drop'],
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
        amenities: ['WiFi', 'parking', 'gym', 'pool'],
        tags: ['apartment'],
        university: 'Oregon State University',
        distanceToUniversity: 1.5,
        availableDate: new Date('2024-06-01'),
        leaseTerm: '6-months',
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
        badges: ['sublease', 'verified-landlord'],
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
        amenities: ['WiFi', 'laundry', 'parking', 'gym', 'balcony', 'dishwasher', 'AC'],
        tags: ['apartment'],
        university: 'Oregon State University',
        distanceToUniversity: 0.8,
        availableDate: new Date('2024-09-01'),
        leaseTerm: '1-year',
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
        badges: ['showcase', 'verified-landlord'],
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
        amenities: ['parking', 'laundry'],
        tags: ['apartment'],
        university: 'Oregon State University',
        distanceToUniversity: 0.6,
        availableDate: new Date('2024-08-01'),
        leaseTerm: '1-year',
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
        amenities: ['WiFi', 'laundry', 'parking'],
        tags: ['shared-room'],
        university: 'Oregon State University',
        distanceToUniversity: 1.8,
        availableDate: new Date('2024-07-01'),
        leaseTerm: 'month-to-month',
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
        amenities: ['parking', 'pet-friendly'],
        tags: ['house'],
        university: 'Oregon State University',
        distanceToUniversity: 2.5,
        availableDate: new Date('2024-08-20'),
        leaseTerm: '1-year',
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

    // Create Lifestyle Profiles (Solo Roommates)
    console.log('👤 Creating lifestyle profiles...');
    const lifestyleProfiles = await LifestyleProfile.insertMany([
      {
        user: users[3]._id, // Mark
        bio: 'CS major looking for a quiet place to study and code. I keep to myself mostly but enjoy board games.',
        gender: 'male',
        age: 20,
        cleanliness: 4,
        noiseLevel: 2,
        wakeTime: '08:00',
        sleepTime: '23:00',
        guestsFrequency: 'rarely',
        hasPets: false,
        smoking: 'non-smoker',
        socialPreference: 'introvert',
        cookingFrequency: 'sometimes',
        budgetMin: 500,
        budgetMax: 800,
        vibeTags: ['quiet', 'studious'],
        interests: ['gaming', 'reading', 'fitness'],
        lookingFor: {
          gender: 'any',
          ageRange: { min: 18, max: 25 },
          moveInDate: new Date('2024-09-01')
        }
      },
      {
        user: users[4]._id, // Sarah
        bio: 'Love hiking and outdoor activities. Early bird. Looking for clean and respectful roommates.',
        gender: 'female',
        age: 21,
        cleanliness: 5,
        noiseLevel: 3,
        wakeTime: '07:00',
        sleepTime: '22:00',
        guestsFrequency: 'sometimes',
        hasPets: true,
        petTypes: ['cat'],
        smoking: 'non-smoker',
        socialPreference: 'balanced',
        cookingFrequency: 'often',
        budgetMin: 600,
        budgetMax: 1000,
        vibeTags: ['homebody', 'early-bird', 'athletic'],
        interests: ['outdoors', 'fitness', 'reading'],
        lookingFor: {
          gender: 'female',
          ageRange: { min: 19, max: 24 },
          moveInDate: new Date('2024-09-01')
        }
      },
      {
        user: users[5]._id, // Emily
        bio: 'Art major. I paint a lot and listen to music. Looking for creative roommates!',
        gender: 'female',
        age: 19,
        cleanliness: 3,
        noiseLevel: 4,
        wakeTime: '10:00',
        sleepTime: '01:00',
        guestsFrequency: 'often',
        hasPets: false,
        smoking: 'outside-only',
        socialPreference: 'extrovert',
        cookingFrequency: 'sometimes',
        budgetMin: 400,
        budgetMax: 800,
        vibeTags: ['creative', 'night-owl', 'social'],
        interests: ['art', 'music', 'travel'],
        lookingFor: {
          gender: 'any',
          ageRange: { min: 18, max: 22 },
          moveInDate: new Date('2024-09-15')
        }
      },
      {
        user: users[7]._id, // Alex
        bio: 'Senior engineering student. Quiet, focused, and clean. I cook a lot!',
        gender: 'male',
        age: 22,
        cleanliness: 5,
        noiseLevel: 2,
        wakeTime: '07:30',
        sleepTime: '23:30',
        guestsFrequency: 'rarely',
        hasPets: false,
        smoking: 'non-smoker',
        socialPreference: 'introvert',
        cookingFrequency: 'daily',
        budgetMin: 600,
        budgetMax: 900,
        vibeTags: ['studious', 'quiet'],
        interests: ['cooking', 'reading', 'gaming'],
        lookingFor: {
          gender: 'male',
          ageRange: { min: 20, max: 25 },
          moveInDate: new Date('2024-09-01')
        }
      },
      {
        user: users[8]._id, // Jessica
        bio: 'Sociology major. Love meeting new people and exploring the city. I have a small dog!',
        gender: 'female',
        age: 20,
        cleanliness: 4,
        noiseLevel: 3,
        wakeTime: '09:00',
        sleepTime: '00:00',
        guestsFrequency: 'sometimes',
        hasPets: true,
        petTypes: ['dog'],
        smoking: 'non-smoker',
        socialPreference: 'extrovert',
        cookingFrequency: 'often',
        budgetMin: 500,
        budgetMax: 850,
        vibeTags: ['social', 'adventurous'],
        interests: ['travel', 'cooking', 'music'],
        lookingFor: {
          gender: 'female',
          ageRange: { min: 19, max: 23 },
          moveInDate: new Date('2024-08-20')
        }
      },
      {
        user: users[9]._id, // Ryan
        bio: 'Business major. Easy going, like sports and video games. Looking for a chill house.',
        gender: 'male',
        age: 21,
        cleanliness: 3,
        noiseLevel: 3,
        wakeTime: '08:30',
        sleepTime: '23:00',
        guestsFrequency: 'sometimes',
        hasPets: false,
        smoking: 'outside-only',
        socialPreference: 'balanced',
        cookingFrequency: 'sometimes',
        budgetMin: 550,
        budgetMax: 950,
        vibeTags: ['quiet', 'athletic'],
        interests: ['sports', 'gaming', 'fitness'],
        lookingFor: {
          gender: 'any',
          ageRange: { min: 19, max: 24 },
          moveInDate: new Date('2024-09-01')
        }
      }
    ]);
    console.log(`✅ Created ${lifestyleProfiles.length} lifestyle profiles`);

    // Create Roommate Groups
    console.log('👨‍👩‍👧‍👦 Creating roommate groups...');
    const groups = await RoommateGroup.create([
      {
        name: 'The Engineers',
        description: 'Group of CS and MechE students. We study hard and game harder.',
        admin: users[0]._id,
        members: [users[0]._id, users[6]._id], // John and Chris
        budget: { min: 600, max: 900 },
        location: 'Near Campus',
        vibe: ['Studious', 'Gamers', 'Tech'],
        lookingFor: '2 more',
        moveInDate: new Date('2024-09-01'),
      },
      {
        name: 'Weekend Hikers',
        description: 'We love the outdoors! Looking for someone who wants to join our weekend adventures.',
        admin: users[1]._id,
        members: [users[1]._id], // Jane
        budget: { min: 700, max: 1100 },
        location: 'North Corvallis',
        vibe: ['Outdoors', 'Clean', 'Active'],
        lookingFor: '1 more',
        moveInDate: new Date('2024-08-15'),
      },
      {
        name: 'Quiet Study House',
        description: 'Strict quiet hours after 10pm. Perfect for grad students or serious undergrads.',
        admin: users[4]._id,
        members: [users[4]._id], // David
        budget: { min: 500, max: 800 },
        location: 'Southtown',
        vibe: ['Quiet', 'Focused', 'Respectful'],
        lookingFor: '3 more',
        moveInDate: new Date('2024-09-01'),
      }
    ]);
    console.log(`✅ Created ${groups.length} roommate groups`);

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




