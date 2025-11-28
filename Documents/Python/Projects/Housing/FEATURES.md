# 🎯 EdYOU Advanced Features Guide

This document describes the 11 advanced features added to the EdYOU housing platform, including how to enable/disable them, testing scenarios, and accessibility considerations.

## 📋 Feature Overview

All features are controlled by feature flags and can be toggled independently. The features include:

1. **User Verification & Badges**
2. **Listing Quality Score**
3. **Roommate Compatibility Score**
4. **Life Rhythm Calendar**
5. **Conflict Preview**
6. **Commute Time Layer**
7. **Campus Overlay**
8. **Pre-Move Checklist**
9. **Roommate Toolkit**
10. **Listing Boost**
11. **Campus Ambassador Program**

---

## 🎛️ Feature Flags

### Backend Configuration

Feature flags are stored in MongoDB and can be managed via the API:

```bash
# Get all feature flags
GET /api/feature-flags

# Update a specific flag
PUT /api/feature-flags/:name
Body: { "enabled": true/false }
```

### Frontend Usage

Features are accessed via the `FeatureFlagContext`:

```javascript
import { useFeatureFlags } from '../contexts/FeatureFlagContext';

const MyComponent = () => {
  const { isEnabled, loading } = useFeatureFlags();
  
  if (isEnabled('userVerification')) {
    // Show verification badges
  }
};
```

### Available Flags

| Flag Name | Description | Default |
|-----------|-------------|---------|
| `userVerification` | Email, .edu domain, and government ID verification | ✅ Enabled |
| `listingQualityScore` | 0-100 score based on listing completeness | ✅ Enabled |
| `roommateCompatibility` | Compatibility scoring between users | ✅ Enabled |
| `lifeRhythmCalendar` | Weekly schedule editor and overlap | ✅ Enabled |
| `conflictPreview` | Automatic conflict detection | ✅ Enabled |
| `commuteTimeLayer` | Map layer showing commute times | ✅ Enabled |
| `campusOverlay` | Campus boundary polygon on map | ✅ Enabled |
| `preMoveChecklist` | Per-listing move-in checklist | ✅ Enabled |
| `roommateToolkit` | Chore rotation, expenses, rules | ✅ Enabled |
| `listingBoost` | Time-bound listing promotion | ✅ Enabled |
| `ambassadorProgram` | Referral system and leaderboard | ✅ Enabled |

---

## 📱 Feature Details

### 1. User Verification & Badges

**Purpose**: Build trust by verifying user identities

**Components**:
- Email verification (auto-check on login)
- .edu domain verification (automatic for .edu emails)
- Government ID verification (mock upload flow)

**Where to See It**:
- User profile pages
- Listing cards (landlord verification badges)
- Listing detail pages

**Testing Scenarios**:
1. Sign up with a `.edu` email → automatically get student domain badge
2. Navigate to profile settings → click "Verify Government ID" → see ID badge appear
3. View listings → see verification badges next to verified landlords

**API Endpoints**:
```
GET  /api/verification/status
POST /api/verification/verify-email
POST /api/verification/verify-id
```

---

### 2. Listing Quality Score

**Purpose**: Help users identify high-quality listings

**Calculation** (0-100 points):
- Photos count (max 25 pts)
- Description length (max 20 pts)
- Price competitiveness (max 25 pts)
- Landlord response time (max 30 pts)

**Where to See It**:
- Listing cards (chip with score)
- Listing detail pages
- Search results sorting

**Testing Scenarios**:
1. View listings → see quality score chips
2. Create a listing with 5+ photos and long description → see high score
3. Sort listings by quality score

**Recalculation**: Automatic on listing save

---

### 3. Roommate Compatibility Score

**Purpose**: Match compatible roommates based on lifestyle

**Factors Considered**:
- Cleanliness standards (1-5 scale)
- Noise tolerance (1-5 scale)
- Sleep schedule
- Guest frequency
- Pets and allergies
- Smoking preferences
- Study style
- Budget range
- Vibe tags (quiet, social, party, studious, etc.)

**Where to See It**:
- Listing detail pages (when viewing as a student)
- Profile comparison pages

**Testing Scenarios**:
1. Create/edit your lifestyle profile
2. View a listing → see compatibility score with host
3. See top 2-3 reasons for match/mismatch

**API Endpoints**:
```
GET  /api/lifestyle-profiles/me
PUT  /api/lifestyle-profiles/me
POST /api/lifestyle-profiles/compatibility
```

---

### 4. Life Rhythm Calendar

**Purpose**: Visualize weekly schedule overlap with roommates

**Features**:
- Weekly schedule editor
- Time blocks by day (0-23 hours)
- Activity labels
- Overlap percentage calculation

**Where to See It**:
- User profile settings
- Listing detail pages (schedule overlap %)

**Testing Scenarios**:
1. Edit your profile → add weekly schedule blocks
2. View a listing → see "Schedule Overlap: X%" with host
3. Compare schedules for conflict-free living

---

### 5. Conflict Preview

**Purpose**: Warn users about potential incompatibilities

**Detected Conflicts**:
- Smoking preferences mismatch
- Pet allergies with pet owners
- Sleep schedule mismatches (night owl vs early bird)
- Budget conflicts
- Cleanliness gaps (3+ point difference)

**Severity Levels**:
- 🔴 High (deal-breakers)
- 🟡 Medium (manageable)
- 🔵 Low (minor concerns)

**Where to See It**:
- Listing detail pages (conflict chips)
- Compact view on listing cards

**Testing Scenarios**:
1. Set yourself as non-smoker with pet allergies
2. View listings with smoking allowed or pets → see conflicts
3. View different sleep schedules → see mismatch warnings

---

### 6. Commute Time Layer

**Purpose**: Help students find housing near campus

**Features**:
- Map markers colored by commute time
- Estimation based on distance (~13 min/mile walking/biking)
- Filter by "≤ X minutes"
- Legend showing time buckets

**Color Coding**:
- 🟢 Green: < 10 min
- 🟡 Yellow: 10-20 min
- 🟠 Orange: 20-30 min
- 🔴 Red: > 30 min

**Where to See It**:
- Listings page map (toggle button)
- Map legend when active

**Testing Scenarios**:
1. Go to Listings page
2. Click "Commute Time" toggle on map
3. See markers change color by distance
4. Hover over listings to see estimated commute

---

### 7. Campus Overlay

**Purpose**: Show which listings are within campus boundaries

**Features**:
- OSU campus polygon overlay on map
- "On-Campus Area" chip on listings
- Automatic detection on listing save

**Campus Boundary**: Oregon State University (approximate)
- Bounded by 9th St, Harrison Blvd, Jefferson Ave, and 26th St

**Where to See It**:
- Listings page map (toggle button)
- Listing cards (on-campus chip)
- Listing detail pages

**Testing Scenarios**:
1. Go to Listings page
2. Click "Campus Area" toggle on map
3. See orange polygon overlay
4. View listings inside boundary → see "On-Campus Area" chip

---

### 8. Pre-Move Checklist

**Purpose**: Help students organize their move-in process

**Default Items**:
1. Sign lease agreement
2. Set up utilities
3. Get renters insurance
4. Order moving truck/service
5. Pack essentials box
6. Update mailing address
7. Transfer internet/cable
8. Schedule walkthrough
9. Get keys and access codes
10. Meet roommates

**Where to See It**:
- Listing detail pages (drawer/panel)
- Per-listing persistence

**Testing Scenarios**:
1. View a listing → open checklist drawer
2. Check off items → see progress
3. Add custom items
4. Return to same listing → see saved checklist

**API Endpoints**:
```
GET /api/checklists/listing/:listingId
PUT /api/checklists/listing/:listingId
POST /api/checklists/listing/:listingId/items
```

---

### 9. Roommate Toolkit

**Purpose**: Manage shared responsibilities and expenses

**Features**:

**A. Chore Rotation Generator**
- Add chores with frequency (daily/weekly/biweekly/monthly)
- Auto-generate weekly assignments
- Fair rotation among roommates

**B. Expense Splitter**
- Add expenses (rent, utilities, groceries)
- Split equally or custom percentages
- Track who paid and due dates

**C. House Rules Document**
- Rich text editor
- Shared document per roommate group
- Version history

**Where to See It**:
- Dedicated Roommate Toolkit page (accessible after signing lease)
- Per-listing roommate groups

**Testing Scenarios**:
1. Navigate to Roommate Toolkit for a listing
2. Add chores → generate rotation → see assignments
3. Add expenses → split equally or custom %
4. Edit house rules → save shared document

**API Endpoints**:
```
GET  /api/roommate-groups/listing/:listingId
POST /api/roommate-groups/listing/:listingId/chores/generate
PUT  /api/roommate-groups/listing/:listingId/chores
POST /api/roommate-groups/listing/:listingId/expenses
PUT  /api/roommate-groups/listing/:listingId/rules
```

---

### 10. Listing Boost

**Purpose**: Allow landlords to promote listings

**Features**:
- Time-bound activation (e.g., 7 days)
- "Boosted" pill on listing cards
- Higher placement in search results
- Automatic deactivation on expiry

**Where to See It**:
- Listing cards (purple "Boosted" chip)
- Landlord dashboard (boost activation controls)
- Search results (boosted listings appear higher)

**Testing Scenarios**:
1. As landlord, activate boost on a listing
2. View listings → see "Boosted" chip
3. Wait for expiry → chip disappears
4. Search results show boosted listings first

**Database Fields**:
```javascript
boost: {
  active: Boolean,
  expiresAt: Date
}
```

---

### 11. Campus Ambassador Program

**Purpose**: Incentivize user referrals and grow platform

**Features**:
- Unique referral code per user (6 characters)
- Shareable referral link
- Referral count tracking
- Public leaderboard (top 10 ambassadors)

**Where to See It**:
- User profile → "Ambassador" tab
- Referral dashboard showing code, link, count
- Public leaderboard page

**Testing Scenarios**:
1. Go to profile → see your referral code
2. Copy referral link
3. Sign up with referral code → original user's count increases
4. View leaderboard → see top referrers

**API Endpoints**:
```
GET /api/ambassador/my-referrals
GET /api/ambassador/leaderboard
```

**Referral Code Generation**: Automatic on user creation (6 uppercase alphanumeric, excluding similar chars like O/0, I/1)

---

## 🎨 Design & Accessibility

### Design Language
- **Primary Color**: Orange (#f97316 - Tailwind orange-600)
- **Accent Colors**: Blue, Green, Yellow, Purple (for different features)
- **Typography**: System fonts, bold headings
- **Spacing**: Consistent 4px/8px grid
- **Borders**: Rounded corners (rounded-lg, rounded-xl, rounded-full)

### Mobile Responsiveness
- ✅ Responsive grid layouts
- ✅ Mobile-first design
- ✅ Collapsible filters on mobile
- ✅ Touch-friendly button sizes (min 44x44px)
- ✅ Drawer/modal UI for small screens

### Accessibility Features

**Keyboard Navigation**:
- ✅ All interactive elements are keyboard accessible
- ✅ Tab order follows visual order
- ✅ Focus indicators visible (blue ring)
- ✅ Escape key closes modals/drawers
- ✅ Enter/Space activates buttons

**Screen Readers**:
- ✅ ARIA labels on icon buttons
- ✅ `aria-pressed` for toggle buttons
- ✅ `role="dialog"` for modals
- ✅ `role="checkbox"` for checklist items
- ✅ `alt` text on all images

**Color Contrast**:
- ✅ Text meets WCAG AA standards (4.5:1 minimum)
- ✅ Interactive elements have 3:1 contrast with background
- ✅ Focus indicators have 3:1 contrast
- ✅ Color is not the only indicator (icons + text)

**Semantic HTML**:
- ✅ Proper heading hierarchy (h1 → h2 → h3)
- ✅ `<button>` for actions, `<a>` for navigation
- ✅ `<form>` elements with labels
- ✅ `<section>`, `<article>`, `<nav>` for structure

---

## 🧪 Testing Scenarios

### Developer Mode
For quick testing, developer mode auto-logs you in:

```bash
# Frontend .env.development
VITE_DEV_MODE=true

# Auto-login credentials
Email: dev@oregonstate.edu
Password: devtest123
```

### Feature Testing Workflow

1. **Map Features** (Commute + Campus):
   - Go to Listings page
   - Toggle "Commute Time" → see colored markers
   - Toggle "Campus Area" → see polygon overlay
   - Hover over listings → see commute estimates

2. **Verification System**:
   - View user profile
   - Click "Verify" buttons
   - See badges appear on profile and listings

3. **Quality Scores**:
   - Create listing with varying detail levels
   - See different quality scores
   - View listings sorted by quality

4. **Compatibility & Conflicts**:
   - Edit lifestyle profile
   - View listings → see compatibility %
   - See conflict chips for mismatches

5. **Checklists**:
   - Open listing detail
   - Access checklist drawer
   - Check items, add custom items
   - Return later → see saved state

6. **Ambassador Program**:
   - View profile → see referral code
   - Copy link, sign up new user with code
   - Check leaderboard

---

## 🛠️ Seed Data

To populate the database with sample data demonstrating all features:

```bash
cd backend
node scripts/seedComprehensiveData.js
```

This creates:
- 3 users (1 verified landlord, 2 students with lifestyle profiles)
- 3 listings (varied quality scores, one boosted, one sublease)
- Lifestyle profiles with different preferences
- Realistic Oregon State University locations

---

## 🔧 Troubleshooting

### Feature Not Showing
1. Check feature flag is enabled in database
2. Clear frontend cache and reload
3. Verify API endpoint is responding
4. Check browser console for errors

### Map Not Loading
1. Ensure Leaflet CSS is imported
2. Check listing has valid coordinates
3. Verify React Leaflet version compatibility
4. Check for console errors related to Leaflet

### Quality Scores Not Calculating
1. Ensure listing has `landlord` populated
2. Check `qualityScoreCalculator.js` is imported correctly
3. Verify `pre-save` middleware is running
4. Check MongoDB connection

---

## 📚 Additional Resources

- **API Documentation**: See inline JSDoc comments in route files
- **Component Documentation**: See PropTypes/comments in component files
- **Database Schema**: See model files in `backend/models/`
- **Feature Flag Management**: `backend/routes/featureFlags.js`

---

## 🎯 Future Enhancements

Potential improvements for each feature:

1. **Verification**: Real ID upload with OCR, background checks
2. **Quality Score**: ML-based scoring, photo quality analysis
3. **Compatibility**: More factors, AI-driven recommendations
4. **Life Rhythm**: Calendar sync (Google/iCal), recurring events
5. **Conflicts**: More conflict types, resolution suggestions
6. **Commute**: Real-time transit API, multiple destinations
7. **Campus**: Multiple campus support, building-level granularity
8. **Checklist**: Templates by move type, deadline reminders
9. **Toolkit**: Bill payment integration, automatic rotation reminders
10. **Boost**: Payment integration, analytics dashboard
11. **Ambassador**: Rewards system, tiered benefits

---

**Last Updated**: November 2025  
**Platform Version**: 2.0.0  
**Documentation by**: EdYOU Development Team




