import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import seedDevUser from './scripts/seedDevUser.js';
import seedFeatureFlags from './scripts/seedFeatureFlags.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://collegio.us',
      'https://www.collegio.us',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Connect to database and seed dev user if in development
connectDB().then(() => {
  // Seed dev user and feature flags in development mode
  if (process.env.NODE_ENV === 'development') {
    seedDevUser().catch(err => console.error('Dev user seeding error:', err));
    // Don't seed feature flags automatically to avoid disconnection
    // Run manually: node backend/scripts/seedFeatureFlags.js
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join user to their own room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle typing indicator
  socket.on('typing:start', ({ threadId, userId, firstName }) => {
    socket.to(threadId).emit('typing:start', { userId, firstName, threadId });
  });

  socket.on('typing:stop', ({ threadId, userId }) => {
    socket.to(threadId).emit('typing:stop', { userId, threadId });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Import routes
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import messageRoutes from './routes/messages.js';
import applicationRoutes from './routes/applications.js';
import reviewRoutes from './routes/reviews.js';
import notificationRoutes from './routes/notifications.js';
import savedSearchRoutes from './routes/savedSearches.js';
import featureFlagRoutes from './routes/featureFlags.js';
import verificationRoutes from './routes/verification.js';
import ambassadorRoutes from './routes/ambassador.js';
import lifestyleProfileRoutes from './routes/lifestyleProfiles.js';
import checklistRoutes from './routes/checklists.js';
import roommateGroupRoutes from './routes/roommateGroups.js';
import userRoutes from './routes/users.js';
import matchRoutes from './routes/matches.js';
import reportRoutes from './routes/reports.js';
import threadRoutes from './routes/threads.js';
import landlordRoutes from './routes/landlord.js';
import communityRoutes from './routes/community.js';

import uploadRoutes from './routes/uploads.js';

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Welcome to collegio API',
    version: '1.0.0',
    status: 'Server is running',
    endpoints: {
      auth: '/api/auth',
      listings: '/api/listings',
      messages: '/api/messages',
      applications: '/api/applications',
      reviews: '/api/reviews',
      notifications: '/api/notifications',
      savedSearches: '/api/saved-searches',
      featureFlags: '/api/feature-flags',
      verification: '/api/verification',
      ambassador: '/api/ambassador',
      lifestyleProfiles: '/api/lifestyle-profiles',
      checklists: '/api/checklists',
      roommateGroups: '/api/roommate-groups',
      users: '/api/users',
      matches: '/api/matches',
      reports: '/api/reports',
      threads: '/api/threads',
      uploads: '/api/uploads',
      community: '/api/community',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/feature-flags', featureFlagRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/ambassador', ambassadorRoutes);
app.use('/api/lifestyle-profiles', lifestyleProfileRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/roommate-groups', roommateGroupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/community', communityRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export { io };

