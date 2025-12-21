import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetailPage from './pages/ListingDetailPage';
import Roommates from './pages/Roommates';
import Community from './pages/Community';
import RoommateToolkit from './pages/RoommateToolkit';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Applications from './pages/Applications';
import CreateListingWizard from './pages/CreateListingWizard';
import LandlordApplicationDashboard from './pages/LandlordApplicationDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import EditListing from './pages/EditListing';
import GroupDashboard from './pages/GroupDashboard';
import Notifications from './pages/Notifications';
import SavedSearches from './pages/SavedSearches';
import SavedPage from './pages/SavedPage';
import Safety from './pages/Safety';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import CompatibilityTest from './pages/CompatibilityTest';
import Settings from './pages/Settings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';

function App() {
  const location = useLocation();
  // Pages with gradient headers that handle their own top padding
  const transparentPages = [
    '/',
    '/listings',
    '/roommates',
    '/saved',
    '/community',
    '/roommate-toolkit',
    '/profile',
    '/messages',
    '/applications',
    '/notifications',
    '/landlord/dashboard',
    '/group-dashboard',
    '/compatibility-test',
    '/settings',
    '/safety',
  ];
  const isTransparentPage = transparentPages.some(page =>
    location.pathname === page || location.pathname.startsWith(page + '/')
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${!isTransparentPage ? 'pt-24' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route
            path="/listings/create"
            element={
              <ProtectedRoute>
                <CreateListingWizard />
              </ProtectedRoute>
            }
          />
          <Route path="/safety" element={<Safety />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />

          {/* Protected routes */}
          <Route
            path="/roommates"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <Roommates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roommate-toolkit"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <RoommateToolkit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-searches"
            element={
              <ProtectedRoute>
                <SavedSearches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/dashboard"
            element={
              <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/applications"
            element={
              <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                <LandlordApplicationDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/edit/:id"
            element={
              <ProtectedRoute>
                <EditListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group-dashboard"
            element={
              <ProtectedRoute>
                <GroupDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compatibility-test"
            element={
              <ProtectedRoute>
                <CompatibilityTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
