# EdYOU - Student Housing Platform

A comprehensive Zillow-inspired college student housing web application with roommate matching, sublease support, real-time messaging, and 11 advanced features for enhanced user experience.

> **📖 For detailed information about the 11 new features, see [FEATURES.md](./FEATURES.md)**

## Features

### Core Functionality
- 🏠 **Housing Listings** - Browse, search, and filter student housing with advanced filters
- 👥 **AI Roommate Matching** - Compatibility-based roommate matching with 10-question quiz
- 🔄 **Sublease Support** - Dedicated sublease marketplace for students
- 💬 **Real-time Messaging** - Socket.io-powered instant messaging
- 📝 **Applications & Tours** - Apply for housing and schedule property tours
- ⭐ **Reviews & Ratings** - Review landlords and roommates
- 🔔 **Notifications** - Real-time notifications for messages, matches, and applications
- 🔍 **Saved Searches** - Save search criteria and get alerts for new listings

### Technical Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (real-time)
- Multer (file uploads)
- Nodemailer (email verification)

**Frontend:**
- React 18 + Vite
- TailwindCSS
- React Router
- Axios
- Socket.io Client
- React Icons

## Project Structure

```
Housing/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   ├── RoommateProfile.js
│   │   ├── Message.js
│   │   ├── Review.js
│   │   ├── Application.js
│   │   ├── Notification.js
│   │   └── SavedSearch.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   ├── roommates.js
│   │   ├── messages.js
│   │   ├── applications.js
│   │   ├── reviews.js
│   │   ├── notifications.js
│   │   └── savedSearches.js
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── uploads/
│   ├── package.json
│   ├── server.js
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   ├── Layout/
    │   │   └── shared/
    │   ├── pages/
    │   ├── services/
    │   ├── contexts/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory (use the existing template or create with these values):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/edyou-housing
JWT_SECRET=your_super_secret_jwt_key_change_in_production_edyou_2024
JWT_EXPIRE=30d
DEV_MODE=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

4. Start MongoDB (if not already running):
```bash
# macOS/Linux
mongod

# Windows
mongod.exe
```

5. Start the backend server:
```bash
npm start
# or for development with auto-restart
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

### Getting Started

1. **Sign Up**: Create an account with your .edu email
2. **Verify Email**: Check console for verification link (DEV_MODE) or your email
3. **Browse Listings**: Search for housing near your campus
4. **Find Roommates**: Complete the compatibility quiz
5. **Apply**: Submit applications for properties you like
6. **Message**: Connect with landlords and potential roommates

### User Roles

**Student:**
- Browse and search listings
- Complete roommate profile
- View matches and compatibility scores
- Apply for housing
- Message landlords and roommates

**Landlord:**
- Create and manage listings
- Upload up to 10 images per listing
- Receive and review applications
- Message potential tenants
- View analytics dashboard

**Both:**
- Access to all student and landlord features

### API Endpoints

**Authentication:**
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/verify-email/:token` - Verify email
- GET `/api/auth/me` - Get current user

**Listings:**
- GET `/api/listings` - Get all listings (with filters)
- GET `/api/listings/:id` - Get single listing
- POST `/api/listings` - Create listing (Protected, Landlord)
- PUT `/api/listings/:id` - Update listing
- DELETE `/api/listings/:id` - Delete listing
- POST `/api/listings/:id/favorite` - Toggle favorite
- POST `/api/listings/:id/sublease` - Convert to sublease

**Roommates:**
- POST `/api/roommates/profile` - Create/update profile
- GET `/api/roommates/profile` - Get my profile
- GET `/api/roommates/matches` - Get compatibility matches
- GET `/api/roommates/:id` - Get specific profile

**Messages:**
- POST `/api/messages` - Send message
- GET `/api/messages/conversations` - Get all conversations
- GET `/api/messages/:userId` - Get conversation with user

**Applications:**
- POST `/api/applications` - Submit application
- GET `/api/applications` - Get my applications
- GET `/api/applications/received` - Get received applications (Landlord)
- PATCH `/api/applications/:id` - Update application status

**Reviews, Notifications, Saved Searches** - See backend routes for full API

## Features in Detail

### Advanced Filtering
- Location (city, state, zip)
- Price range
- Bedrooms & bathrooms
- Amenities (parking, laundry, pet-friendly, etc.)
- Lease terms
- Square footage
- Distance to campus
- Utilities included
- Property type
- Sublease availability

### AI Roommate Matching
Compatibility algorithm considers:
- Sleep schedule (20% weight)
- Cleanliness level (25% weight)
- Social preferences (15% weight)
- Noise tolerance (15% weight)
- Pet compatibility (15% weight)
- Shared interests (10% weight)

Results show match percentage and top 3 compatibility reasons.

### Email System
- **DEV_MODE=true**: Emails logged to console
- **DEV_MODE=false**: Real emails via nodemailer

### Real-time Features (Socket.io)
- Instant messaging
- Live notifications
- Typing indicators
- Online status
- New listing alerts

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Building for Production

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run build
npm run preview  # Preview production build
```

## Security Features

- JWT-based authentication
- .edu email verification required
- Password hashing with bcryptjs
- Protected API routes
- File upload validation
- CORS configuration
- Input validation (express-validator)

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - Token expiration time
- `DEV_MODE` - Email mode (true=console, false=SMTP)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` - SMTP config
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check connection string in `.env`

**Port Already in Use:**
- Backend: Change `PORT` in backend `.env`
- Frontend: Vite will prompt for alternative port

**Email Verification Not Working:**
- In development, check console for verification link
- For production, configure SMTP settings in `.env`

**File Upload Issues:**
- Check `backend/uploads/` directory exists and is writable
- Verify multer configuration in `backend/middleware/multer.js`

## Future Enhancements

- Mobile app (React Native)
- Payment integration
- Virtual tours (3D/VR)
- Advanced analytics dashboard
- Multi-language support
- Social media integration
- Background checks integration
- Lease agreement templates

## Contributing

This is a student project. For issues or suggestions, please contact the development team.

## License

MIT License - Feel free to use this project for educational purposes.

## Support

For questions or support:
- Check the troubleshooting section
- Review API documentation
- Contact: support@edyou.com (placeholder)

---

**Built with ❤️ for college students**

Version 1.0.0

