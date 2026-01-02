// Test script for image upload optimization
// Run with: node scripts/testImageUpload.js

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5001/api';

async function testImageUpload() {
    console.log('🧪 Testing Image Upload Optimization...\n');

    // First, login to get a token
    console.log('1. Logging in to get auth token...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'dev@oregonstate.edu',
            password: 'devtest123'
        })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
        console.error('❌ Login failed:', loginData.error);
        console.log('   Make sure you have a test user or update the credentials above.');
        process.exit(1);
    }

    const token = loginData.token;
    console.log('✅ Logged in successfully\n');

    // Create a valid test image using Sharp (100x100 red square)
    const testImagePath = path.join(__dirname, 'test_image.png');

    await sharp({
        create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 255, g: 0, b: 0 }
        }
    }).png().toFile(testImagePath);

    console.log('2. Created test image: test_image.png (100x100 red square)\n');

    // Test profile photo upload
    console.log('3. Testing profile photo upload (PUT /auth/profile-photo)...');
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath), {
        filename: 'test_image.png',
        contentType: 'image/png'
    });

    try {
        const uploadRes = await fetch(`${BASE_URL}/auth/profile-photo`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            },
            body: form
        });

        const uploadData = await uploadRes.json();

        if (uploadData.success) {
            console.log('✅ Upload successful!');
            console.log('   Profile Photo URL:', uploadData.user?.profilePhoto);

            // Check if it's a WebP URL from Cloudinary
            const photoUrl = uploadData.user?.profilePhoto || '';
            if (photoUrl.includes('cloudinary') && photoUrl.includes('webp')) {
                console.log('✅ Image is optimized to WebP format!');
            } else if (photoUrl.includes('cloudinary')) {
                console.log('⚠️  Image uploaded to Cloudinary but may not be WebP format.');
                console.log('   (This is okay - Cloudinary may serve different formats based on browser)');
            } else {
                console.log('⚠️  Could not verify WebP optimization. URL:', photoUrl);
            }
        } else {
            console.error('❌ Upload failed:', uploadData.error);
        }
    } catch (error) {
        console.error('❌ Request error:', error.message);
    }

    // Cleanup
    fs.unlinkSync(testImagePath);
    console.log('\n4. Cleaned up test image.');
    console.log('\n🎉 Test complete!');
}

testImageUpload().catch(console.error);
