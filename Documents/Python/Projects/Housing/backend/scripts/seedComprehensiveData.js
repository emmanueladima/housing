import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import LifestyleProfile from '../models/LifestyleProfile.js';
import MoveChecklist, { DEFAULT_CHECKLIST_ITEMS } from '../models/MoveChecklist.js';
import RoommateGroup from '../models/RoommateGroup.js';

dotenv.config();

const seedComprehensiveData = async () => {
  try {
    console.log('🌱 Seeding comprehensive data with all features...');

    // Check if we need to seed users (only skip if we have enough users with profiles)
    const existingProfiles = await LifestyleProfile.find();
    const existingUsers = await User.find({ userType: 'student' });
    if (existingProfiles.length >= 10 && existingUsers.length >= 10) {
      console.log('✅ Sample users and profiles already exist, skipping user seed');
      // Still create listings if they don't exist
      const existingListings = await Listing.find();
      if (existingListings.length > 0) {
        console.log('✅ Sample listings already exist, skipping seed');
        return;
      }
    }
    
    // Check if users exist, if not create them
    let landlord1 = await User.findOne({ email: 'sarah.landlord@oregonstate.edu' });
    let student1 = await User.findOne({ email: 'alex.chen@oregonstate.edu' });
    let student2 = await User.findOne({ email: 'jordan.miller@oregonstate.edu' });
    
    const users = [];
    
    if (!landlord1) {
      landlord1 = await User.create({
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.landlord@oregonstate.edu',
        password: 'password123',
        phone: '555-0101',
        school: 'Oregon State University',
        graduationYear: 2020,
        userType: 'landlord',
        verification: {
          email: true,
          studentDomain: true,
          governmentId: true,
          idUploadDate: new Date(),
        },
        avgResponseTime: 2,
      });
      users.push(landlord1);
    }
    
    if (!student1) {
      student1 = await User.create({
        firstName: 'Alex',
        lastName: 'Chen',
        email: 'alex.chen@oregonstate.edu',
        password: 'password123',
        phone: '555-0102',
        school: 'Oregon State University',
        graduationYear: 2025,
        userType: 'student',
        verification: {
          email: true,
          studentDomain: true,
          governmentId: false,
        },
      });
      users.push(student1);
    }
    
    if (!student2) {
      student2 = await User.create({
        firstName: 'Jordan',
        lastName: 'Miller',
        email: 'jordan.miller@oregonstate.edu',
        password: 'password123',
        phone: '555-0103',
        school: 'Oregon State University',
        graduationYear: 2026,
        userType: 'student',
        verification: {
          email: true,
          studentDomain: true,
          governmentId: true,
          idUploadDate: new Date(),
        },
      });
      users.push(student2);
    }
    
    // Create or update lifestyle profiles
    await LifestyleProfile.findOneAndUpdate(
      { user: student1._id },
      {
        user: student1._id,
        cleanliness: 4,
        noiseLevel: 2,
        sleepTime: '22:30',
        wakeTime: '07:00',
        guestsFrequency: 'rarely',
        hasPets: false,
        petAllergies: false,
        smoking: 'non-smoker',
        studyStyle: 'quiet',
        budgetMin: 500,
        budgetMax: 1000,
        vibeTags: ['studious', 'early-bird', 'quiet'],
        weeklySchedule: [
          { day: 'monday', startHour: 8, endHour: 17, activity: 'Classes & Study' },
          { day: 'tuesday', startHour: 8, endHour: 17, activity: 'Classes & Study' },
          { day: 'wednesday', startHour: 8, endHour: 17, activity: 'Classes & Study' },
          { day: 'thursday', startHour: 8, endHour: 17, activity: 'Classes & Study' },
          { day: 'friday', startHour: 8, endHour: 15, activity: 'Classes' },
        ],
      },
      { upsert: true, new: true }
    );

    await LifestyleProfile.findOneAndUpdate(
      { user: student2._id },
      {
        user: student2._id,
        cleanliness: 3,
        noiseLevel: 4,
        sleepTime: '01:00',
        wakeTime: '10:00',
        guestsFrequency: 'often',
        hasPets: true,
        petTypes: ['cat'],
        petAllergies: false,
        smoking: 'non-smoker',
        studyStyle: 'music',
        budgetMin: 600,
        budgetMax: 1200,
        vibeTags: ['social', 'night-owl', 'creative'],
        weeklySchedule: [
          { day: 'monday', startHour: 10, endHour: 18, activity: 'Classes' },
          { day: 'wednesday', startHour: 10, endHour: 18, activity: 'Classes' },
          { day: 'friday', startHour: 20, endHour: 23, activity: 'Social' },
          { day: 'saturday', startHour: 19, endHour: 23, activity: 'Social' },
        ],
      },
      { upsert: true, new: true }
    );

    // Create additional students with diverse profiles
    const additionalStudents = [
      {
        firstName: 'Maya',
        lastName: 'Patel',
        email: 'maya.patel@oregonstate.edu',
        phone: '555-0104',
        graduationYear: 2025,
        verification: { email: true, studentDomain: true, governmentId: true, idUploadDate: new Date() },
        profile: {
          cleanliness: 5,
          noiseLevel: 1,
          sleepTime: '22:00',
          wakeTime: '06:30',
          guestsFrequency: 'rarely',
          hasPets: false,
          petAllergies: true,
          smoking: 'non-smoker',
          studyStyle: 'quiet',
          budgetMin: 700,
          budgetMax: 1100,
          vibeTags: ['studious', 'early-bird', 'minimalist', 'organized'],
          weeklySchedule: [
            { day: 'monday', startHour: 7, endHour: 18, activity: 'Classes & Study' },
            { day: 'tuesday', startHour: 7, endHour: 18, activity: 'Classes & Study' },
            { day: 'wednesday', startHour: 7, endHour: 18, activity: 'Classes & Study' },
            { day: 'thursday', startHour: 7, endHour: 18, activity: 'Classes & Study' },
            { day: 'friday', startHour: 7, endHour: 15, activity: 'Classes' },
          ],
        },
      },
      {
        firstName: 'Chris',
        lastName: 'Rodriguez',
        email: 'chris.rodriguez@oregonstate.edu',
        phone: '555-0105',
        graduationYear: 2026,
        verification: { email: true, studentDomain: true, governmentId: false },
        profile: {
          cleanliness: 2,
          noiseLevel: 5,
          sleepTime: '02:00',
          wakeTime: '11:00',
          guestsFrequency: 'very-often',
          hasPets: false,
          petAllergies: false,
          smoking: 'social-smoker',
          studyStyle: 'music',
          budgetMin: 500,
          budgetMax: 900,
          vibeTags: ['social', 'night-owl', 'party', 'extroverted'],
          weeklySchedule: [
            { day: 'monday', startHour: 12, endHour: 16, activity: 'Classes' },
            { day: 'wednesday', startHour: 12, endHour: 16, activity: 'Classes' },
            { day: 'friday', startHour: 18, endHour: 23, activity: 'Social' },
            { day: 'saturday', startHour: 15, endHour: 23, activity: 'Social' },
            { day: 'sunday', startHour: 14, endHour: 20, activity: 'Social' },
          ],
        },
      },
      {
        firstName: 'Taylor',
        lastName: 'Kim',
        email: 'taylor.kim@oregonstate.edu',
        phone: '555-0106',
        graduationYear: 2027,
        verification: { email: true, studentDomain: true, governmentId: true, idUploadDate: new Date() },
        profile: {
          cleanliness: 4,
          noiseLevel: 2,
          sleepTime: '23:00',
          wakeTime: '08:00',
          guestsFrequency: 'sometimes',
          hasPets: true,
          petTypes: ['dog'],
          petAllergies: false,
          smoking: 'non-smoker',
          studyStyle: 'quiet',
          budgetMin: 800,
          budgetMax: 1300,
          vibeTags: ['active', 'outdoorsy', 'friendly', 'pet-lover'],
          weeklySchedule: [
            { day: 'monday', startHour: 9, endHour: 17, activity: 'Classes' },
            { day: 'tuesday', startHour: 9, endHour: 17, activity: 'Classes' },
            { day: 'wednesday', startHour: 9, endHour: 17, activity: 'Classes' },
            { day: 'thursday', startHour: 9, endHour: 17, activity: 'Classes' },
            { day: 'friday', startHour: 9, endHour: 14, activity: 'Classes' },
            { day: 'saturday', startHour: 8, endHour: 12, activity: 'Exercise' },
          ],
        },
      },
      {
        firstName: 'Sam',
        lastName: 'Anderson',
        email: 'sam.anderson@oregonstate.edu',
        phone: '555-0107',
        graduationYear: 2025,
        verification: { email: true, studentDomain: true, governmentId: false },
        profile: {
          cleanliness: 3,
          noiseLevel: 3,
          sleepTime: '23:30',
          wakeTime: '07:30',
          guestsFrequency: 'sometimes',
          hasPets: false,
          petAllergies: false,
          smoking: 'non-smoker',
          studyStyle: 'background',
          budgetMin: 600,
          budgetMax: 1000,
          vibeTags: ['balanced', 'flexible', 'easygoing'],
          weeklySchedule: [
            { day: 'monday', startHour: 8, endHour: 16, activity: 'Classes' },
            { day: 'tuesday', startHour: 8, endHour: 16, activity: 'Classes' },
            { day: 'wednesday', startHour: 8, endHour: 16, activity: 'Classes' },
            { day: 'thursday', startHour: 8, endHour: 16, activity: 'Classes' },
            { day: 'friday', startHour: 8, endHour: 13, activity: 'Classes' },
          ],
        },
      },
      {
        firstName: 'Riley',
        lastName: 'Thompson',
        email: 'riley.thompson@oregonstate.edu',
        phone: '555-0108',
        graduationYear: 2026,
        verification: { email: true, studentDomain: true, governmentId: true, idUploadDate: new Date() },
        profile: {
          cleanliness: 5,
          noiseLevel: 1,
          sleepTime: '21:30',
          wakeTime: '06:00',
          guestsFrequency: 'never',
          hasPets: false,
          petAllergies: true,
          smoking: 'non-smoker',
          studyStyle: 'quiet',
          budgetMin: 750,
          budgetMax: 1150,
          vibeTags: ['studious', 'early-bird', 'introverted', 'focused'],
          weeklySchedule: [
            { day: 'monday', startHour: 7, endHour: 19, activity: 'Classes & Study' },
            { day: 'tuesday', startHour: 7, endHour: 19, activity: 'Classes & Study' },
            { day: 'wednesday', startHour: 7, endHour: 19, activity: 'Classes & Study' },
            { day: 'thursday', startHour: 7, endHour: 19, activity: 'Classes & Study' },
            { day: 'friday', startHour: 7, endHour: 16, activity: 'Classes & Study' },
            { day: 'saturday', startHour: 9, endHour: 17, activity: 'Study' },
            { day: 'sunday', startHour: 10, endHour: 18, activity: 'Study' },
          ],
        },
      },
      {
        firstName: 'Morgan',
        lastName: 'Lee',
        email: 'morgan.lee@oregonstate.edu',
        phone: '555-0109',
        graduationYear: 2027,
        verification: { email: true, studentDomain: true, governmentId: false },
        profile: {
          cleanliness: 2,
          noiseLevel: 4,
          sleepTime: '00:30',
          wakeTime: '09:30',
          guestsFrequency: 'often',
          hasPets: true,
          petTypes: ['cat', 'hamster'],
          petAllergies: false,
          smoking: 'non-smoker',
          studyStyle: 'music',
          budgetMin: 550,
          budgetMax: 950,
          vibeTags: ['creative', 'artistic', 'night-owl', 'laid-back'],
          weeklySchedule: [
            { day: 'monday', startHour: 11, endHour: 17, activity: 'Classes' },
            { day: 'tuesday', startHour: 11, endHour: 17, activity: 'Classes' },
            { day: 'wednesday', startHour: 11, endHour: 17, activity: 'Classes' },
            { day: 'thursday', startHour: 11, endHour: 17, activity: 'Classes' },
            { day: 'friday', startHour: 11, endHour: 15, activity: 'Classes' },
            { day: 'saturday', startHour: 14, endHour: 22, activity: 'Creative Work' },
          ],
        },
      },
      {
        firstName: 'Casey',
        lastName: 'Wright',
        email: 'casey.wright@oregonstate.edu',
        phone: '555-0110',
        graduationYear: 2025,
        verification: { email: true, studentDomain: true, governmentId: true, idUploadDate: new Date() },
        profile: {
          cleanliness: 4,
          noiseLevel: 2,
          sleepTime: '22:00',
          wakeTime: '07:00',
          guestsFrequency: 'rarely',
          hasPets: false,
          petAllergies: false,
          smoking: 'non-smoker',
          studyStyle: 'quiet',
          budgetMin: 700,
          budgetMax: 1200,
          vibeTags: ['athletic', 'health-conscious', 'organized', 'focused'],
          weeklySchedule: [
            { day: 'monday', startHour: 6, endHour: 8, activity: 'Exercise' },
            { day: 'monday', startHour: 9, endHour: 17, activity: 'Classes' },
            { day: 'tuesday', startHour: 6, endHour: 8, activity: 'Exercise' },
            { day: 'tuesday', startHour: 9, endHour: 17, activity: 'Classes' },
            { day: 'wednesday', startHour: 6, endHour: 8, activity: 'Exercise' },
            { day: 'wednesday', startHour: 9, endHour: 17, activity: 'Classes' },
            { day: 'thursday', startHour: 6, endHour: 8, activity: 'Exercise' },
            { day: 'thursday', startHour: 9, endHour: 17, activity: 'Classes' },
            { day: 'friday', startHour: 6, endHour: 8, activity: 'Exercise' },
            { day: 'friday', startHour: 9, endHour: 14, activity: 'Classes' },
          ],
        },
      },
      {
        firstName: 'Jamie',
        lastName: 'Martinez',
        email: 'jamie.martinez@oregonstate.edu',
        phone: '555-0111',
        graduationYear: 2026,
        verification: { email: true, studentDomain: true, governmentId: false },
        profile: {
          cleanliness: 3,
          noiseLevel: 3,
          sleepTime: '23:00',
          wakeTime: '08:00',
          guestsFrequency: 'sometimes',
          hasPets: false,
          petAllergies: false,
          smoking: 'non-smoker',
          studyStyle: 'background',
          budgetMin: 650,
          budgetMax: 1050,
          vibeTags: ['friendly', 'balanced', 'social', 'easygoing'],
          weeklySchedule: [
            { day: 'monday', startHour: 9, endHour: 16, activity: 'Classes' },
            { day: 'tuesday', startHour: 9, endHour: 16, activity: 'Classes' },
            { day: 'wednesday', startHour: 9, endHour: 16, activity: 'Classes' },
            { day: 'thursday', startHour: 9, endHour: 16, activity: 'Classes' },
            { day: 'friday', startHour: 9, endHour: 14, activity: 'Classes' },
            { day: 'saturday', startHour: 12, endHour: 18, activity: 'Social' },
          ],
        },
      },
      {
        firstName: 'Avery',
        lastName: 'Brown',
        email: 'avery.brown@oregonstate.edu',
        phone: '555-0112',
        graduationYear: 2027,
        verification: { email: true, studentDomain: true, governmentId: true, idUploadDate: new Date() },
        profile: {
          cleanliness: 4,
          noiseLevel: 2,
          sleepTime: '22:30',
          wakeTime: '07:30',
          guestsFrequency: 'rarely',
          hasPets: true,
          petTypes: ['cat'],
          petAllergies: false,
          smoking: 'non-smoker',
          studyStyle: 'quiet',
          budgetMin: 750,
          budgetMax: 1250,
          vibeTags: ['studious', 'pet-lover', 'quiet', 'responsible'],
          weeklySchedule: [
            { day: 'monday', startHour: 8, endHour: 17, activity: 'Classes & Study' },
            { day: 'tuesday', startHour: 8, endHour: 17, activity: 'Classes & Study' },
            { day: 'wednesday', startHour: 8, endHour: 17, activity: 'Classes & Study' },
            { day: 'thursday', startHour: 8, endHour: 17, activity: 'Classes & Study' },
            { day: 'friday', startHour: 8, endHour: 15, activity: 'Classes' },
          ],
        },
      },
      {
        firstName: 'Quinn',
        lastName: 'Davis',
        email: 'quinn.davis@oregonstate.edu',
        phone: '555-0113',
        graduationYear: 2025,
        verification: { email: true, studentDomain: true, governmentId: false },
        profile: {
          cleanliness: 2,
          noiseLevel: 5,
          sleepTime: '01:30',
          wakeTime: '10:30',
          guestsFrequency: 'very-often',
          hasPets: false,
          petAllergies: false,
          smoking: 'social-smoker',
          studyStyle: 'music',
          budgetMin: 500,
          budgetMax: 850,
          vibeTags: ['party', 'social', 'night-owl', 'extroverted', 'music'],
          weeklySchedule: [
            { day: 'monday', startHour: 13, endHour: 16, activity: 'Classes' },
            { day: 'wednesday', startHour: 13, endHour: 16, activity: 'Classes' },
            { day: 'friday', startHour: 19, endHour: 23, activity: 'Social' },
            { day: 'saturday', startHour: 16, endHour: 23, activity: 'Social' },
            { day: 'sunday', startHour: 15, endHour: 22, activity: 'Social' },
          ],
        },
      },
    ];

    // Create additional students
    for (const studentData of additionalStudents) {
      let student = await User.findOne({ email: studentData.email });
      if (!student) {
        student = await User.create({
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email,
          password: 'password123',
          phone: studentData.phone,
          school: 'Oregon State University',
          graduationYear: studentData.graduationYear,
          userType: 'student',
          verification: studentData.verification,
        });
        users.push(student);

        // Create lifestyle profile
        await LifestyleProfile.findOneAndUpdate(
          { user: student._id },
          {
            user: student._id,
            ...studentData.profile,
          },
          { upsert: true, new: true }
        );
      }
    }

    // Create sample listings near OSU campus
    const listings = [];

    // Listing 1: Near campus, high quality
    const listing1 = await Listing.create({
      title: 'Modern 2BR near OSU Campus',
      description: 'Beautiful modern apartment just minutes from Oregon State University. Features include hardwood floors, stainless steel appliances, in-unit laundry, and a private balcony with campus views. Perfect for students! Includes all utilities except electricity. Pet-friendly building with on-site management.',
      address: '145 NW Monroe Ave',
      city: 'Corvallis',
      state: 'Oregon',
      zipCode: '97330',
      rent: 950,
      price: 950,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      ],
      amenities: ['parking', 'laundry', 'pet-friendly', 'WiFi', 'dishwasher', 'balcony'],
      tags: ['apartment', 'student-housing'],
      university: 'Oregon State University',
      distanceToUniversity: 0.3,
      availableDate: new Date('2025-09-01'),
      leaseTerm: 'academic-year',
      utilities: {
        water: true,
        gas: true,
        internet: true,
        trash: true,
        electricity: false,
      },
      rules: {
        petsAllowed: true,
        smokingAllowed: false,
        partiesAllowed: false,
      },
      landlord: landlord1._id,
      coordinates: { lat: 44.5669, lng: -123.2784 },
      location: {
        address: '145 NW Monroe Ave',
        city: 'Corvallis',
        state: 'Oregon',
        zipCode: '97330',
        coordinates: { lat: 44.5669, lng: -123.2784 },
      },
      isSublease: false,
      isActive: true,
      boost: {
        active: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    listings.push(listing1);

    // Listing 2: On-campus area
    const listing2 = await Listing.create({
      title: 'Cozy Studio in Campus District',
      description: 'Affordable studio apartment in the heart of the campus area. Walking distance to all university buildings. Quiet building perfect for studying.',
      address: '520 SW 26th St',
      city: 'Corvallis',
      state: 'Oregon',
      zipCode: '97331',
      rent: 675,
      price: 675,
      bedrooms: 0,
      bathrooms: 1,
      sqft: 450,
      images: [
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
      ],
      amenities: ['WiFi', 'laundry'],
      tags: ['studio', 'student-housing'],
      university: 'Oregon State University',
      distanceToUniversity: 0.1,
      availableDate: new Date('2025-08-15'),
      leaseTerm: '1-year',
      utilities: {
        water: true,
        trash: true,
        electricity: false,
        gas: false,
        internet: false,
      },
      rules: {
        petsAllowed: false,
        smokingAllowed: false,
        partiesAllowed: false,
      },
      landlord: landlord1._id,
      coordinates: { lat: 44.5633, lng: -123.2598 },
      location: {
        address: '520 SW 26th St',
        city: 'Corvallis',
        state: 'Oregon',
        zipCode: '97331',
        coordinates: { lat: 44.5633, lng: -123.2598 },
      },
      isSublease: false,
      isActive: true,
    });
    listings.push(listing2);

    // Listing 3: Sublease
    const listing3 = await Listing.create({
      title: 'Summer Sublease - 1BR near Campus',
      description: 'Available for summer term! Great location, fully furnished.',
      address: '789 NW Harrison Blvd',
      city: 'Corvallis',
      state: 'Oregon',
      zipCode: '97330',
      rent: 800,
      price: 800,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 600,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      ],
      amenities: ['furnished', 'parking', 'laundry'],
      tags: ['apartment', 'student-housing'],
      university: 'Oregon State University',
      distanceToUniversity: 0.5,
      availableDate: new Date('2025-06-15'),
      leaseTerm: 'month-to-month',
      utilities: {
        water: true,
        electricity: true,
        gas: true,
        internet: true,
        trash: true,
      },
      rules: {
        petsAllowed: false,
        smokingAllowed: false,
        partiesAllowed: false,
      },
      landlord: landlord1._id,
      coordinates: { lat: 44.5698, lng: -123.2710 },
      location: {
        address: '789 NW Harrison Blvd',
        city: 'Corvallis',
        state: 'Oregon',
        zipCode: '97330',
        coordinates: { lat: 44.5698, lng: -123.2710 },
      },
      isSublease: true,
      subleaseDetails: {
        originalLeaseEnd: new Date('2025-08-31'),
        reason: 'Summer internship',
        originalTenant: student2._id,
      },
      isActive: true,
    });
    listings.push(listing3);

    // Count students with profiles
    const studentsWithProfiles = await LifestyleProfile.find().populate('user');
    const studentCount = studentsWithProfiles.length;

    console.log(`✅ Created ${users.length} users`);
    console.log(`✅ Created ${listings.length} listings`);
    console.log(`✅ Created ${studentCount} students with lifestyle profiles`);

    console.log('\n📊 Summary:');
    console.log(`- Verified landlord: ${landlord1.email}`);
    console.log(`- Students with profiles: ${studentCount}`);
    console.log(`- Listings: ${listings.map(l => l.title).join(', ')}`);
    console.log(`- Quality scores calculated automatically on save`);
    console.log(`- Campus detection enabled`);
    console.log(`- Listing 1 is boosted`);
    console.log(`- Listing 3 is a sublease`);

  } catch (error) {
    console.error('❌ Error seeding comprehensive data:', error);
    throw error;
  }
};

// Run if called directly
if (process.argv[1].includes('seedComprehensiveData.js')) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edyou-housing')
    .then(async () => {
      console.log('📦 Connected to MongoDB');
      await seedComprehensiveData();
      console.log('✅ Comprehensive seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    });
}

export default seedComprehensiveData;

