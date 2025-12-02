import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import LifestyleProfile from '../models/LifestyleProfile.js';

dotenv.config();

const seedRoommates = async () => {
    try {
        console.log('🌱 Seeding diverse roommate profiles...');

        // Clear existing student users created by this script (optional, but good for idempotency if we had a way to track them)
        // For now, we'll just add new ones to ensure we have enough.

        const schools = ['Oregon State University'];
        const majors = ['Computer Science', 'Engineering', 'Business', 'Psychology', 'Biology', 'Art', 'Environmental Science'];
        const vibes = [
            ['studious', 'quiet', 'early-bird'],
            ['social', 'outgoing', 'night-owl'],
            ['creative', 'artistic', 'musical'],
            ['athletic', 'active', 'outdoorsy'],
            ['gamer', 'techie', 'night-owl'],
            ['clean', 'organized', 'minimalist'],
            ['foodie', 'cook', 'social'],
            ['chill', 'relaxed', 'easygoing']
        ];

        const firstNames = ['Jordan', 'Alex', 'Taylor', 'Morgan', 'Casey', 'Jamie', 'Riley', 'Avery', 'Quinn', 'Sam', 'Dakota', 'Reese', 'Cameron', 'Sage', 'Rowan', 'Hayden', 'Emerson', 'Finley', 'River', 'Skyler'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

        const createdUsers = [];

        for (let i = 0; i < 20; i++) {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[i % lastNames.length];
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@oregonstate.edu`;

            // Check if user exists
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    firstName,
                    lastName,
                    email,
                    password: 'password123',
                    phone: `555-0${100 + i}`,
                    school: schools[0],
                    graduationYear: 2024 + Math.floor(Math.random() * 4),
                    userType: 'student',
                    verification: {
                        email: true,
                        studentDomain: true,
                        governmentId: Math.random() > 0.5,
                    },
                    major: majors[Math.floor(Math.random() * majors.length)],
                    bio: `Hi, I'm ${firstName}! I'm a ${majors[Math.floor(Math.random() * majors.length)]} major looking for roommates who are chill and respectful.`,
                });
            }
            createdUsers.push(user);

            // Create Lifestyle Profile
            const vibeSet = vibes[Math.floor(Math.random() * vibes.length)];
            const cleanliness = Math.floor(Math.random() * 5) + 1; // 1-5 scale mapped to 1-10 later? Model uses 1-10 usually? Let's check model. 
            // Model usually 1-10. Let's use 1-10.
            const cleanliness10 = Math.floor(Math.random() * 10) + 1;
            const noise10 = Math.floor(Math.random() * 10) + 1;

            const sleepTimes = ['21:00', '22:00', '23:00', '00:00', '01:00', '02:00'];
            const wakeTimes = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'];

            await LifestyleProfile.findOneAndUpdate(
                { user: user._id },
                {
                    user: user._id,
                    cleanliness: cleanliness10,
                    noiseLevel: noise10,
                    sleepTime: sleepTimes[Math.floor(Math.random() * sleepTimes.length)],
                    wakeTime: wakeTimes[Math.floor(Math.random() * wakeTimes.length)],
                    guestsFrequency: ['never', 'rarely', 'sometimes', 'often', 'very-often'][Math.floor(Math.random() * 5)],
                    hasPets: Math.random() > 0.7,
                    petTypes: Math.random() > 0.7 ? (Math.random() > 0.5 ? ['dog'] : ['cat']) : [],
                    petAllergies: Math.random() > 0.8,
                    smoking: ['non-smoker', 'social-smoker', 'smoker'][Math.floor(Math.random() * 3)], // Weighted towards non-smoker?
                    studyStyle: ['quiet', 'music', 'background', 'group'][Math.floor(Math.random() * 4)],
                    budgetMin: 500 + Math.floor(Math.random() * 5) * 100,
                    budgetMax: 1000 + Math.floor(Math.random() * 10) * 100,
                    vibeTags: vibeSet,
                    interests: vibeSet.concat(['movies', 'hiking', 'cooking', 'gaming'].slice(0, Math.floor(Math.random() * 3))),
                    weeklySchedule: generateRandomSchedule(),
                },
                { upsert: true, new: true }
            );
        }

        console.log(`✅ Successfully seeded ${createdUsers.length} roommates!`);

    } catch (error) {
        console.error('❌ Error seeding roommates:', error);
        process.exit(1);
    }
};

const generateRandomSchedule = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule = [];

    days.forEach((day, index) => {
        // Weekdays
        if (index < 5) {
            // Classes
            schedule.push({
                day,
                startHour: 9 + Math.floor(Math.random() * 3),
                endHour: 14 + Math.floor(Math.random() * 3),
                activity: 'Classes'
            });
            // Study/Work
            if (Math.random() > 0.3) {
                schedule.push({
                    day,
                    startHour: 18,
                    endHour: 21,
                    activity: 'Study'
                });
            }
        } else {
            // Weekend
            if (Math.random() > 0.5) {
                schedule.push({
                    day,
                    startHour: 12,
                    endHour: 16,
                    activity: 'Social'
                });
            }
        }
    });
    return schedule;
};

// Run if called directly
if (process.argv[1].includes('seedRoommates.js')) {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edyou-housing')
        .then(async () => {
            console.log('📦 Connected to MongoDB');
            await seedRoommates();
            console.log('✅ Roommate seeding completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ MongoDB connection error:', error);
            process.exit(1);
        });
}

export default seedRoommates;
