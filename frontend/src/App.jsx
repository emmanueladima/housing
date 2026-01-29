import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ModernBackground from './components/shared/ModernBackground';
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
import ResetPassword from './pages/ResetPassword';
import JoinByCode from './pages/JoinByCode';
import ProfileEditMockup from './components/Profile/ProfileEditMockup';

// Admin
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import ListingManagement from './pages/Admin/ListingManagement';
import ReportCenter from './pages/Admin/ReportCenter';
import AuditLogs from './pages/Admin/AuditLogs';
import MessagingSystem from './pages/Admin/MessagingSystem';

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
    '/terms',
    '/privacy',
    '/cookie-policy',
    '/admin', // Added Admin to transparent pages so sidebar works correctly
  ];
  const isTransparentPage = transparentPages.some(page =>
    location.pathname === page || location.pathname.startsWith(page + '/')
  );

  const isAnimatedBackgroundPage = ['/', '/safety', '/terms', '/privacy', '/cookies', '/roommate-toolkit', '/landlord/dashboard', '/saved', '/settings', '/profile', '/applications', '/messages', '/community', '/notifications'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fixed animated background for specific pages */}
      {isAnimatedBackgroundPage && !isAdminRoute && (
        <div className="fixed inset-0 z-0">
          <ModernBackground />
        </div>
      )}

      {/* Header - Always Show */}
      <Header />

      <main className={`flex-grow ${!isTransparentPage ? 'pt-24' : ''} relative z-10`}>
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
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/join/:code" element={<JoinByCode />} />

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
                <ProfileEditMockup />
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
            element={<Navigate to="/landlord/dashboard?tab=applications" replace />}
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
                <ProfileEditMockup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEditMockup />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="listings" element={<ListingManagement />} />
            <Route path="reports" element={<ReportCenter />} />
            <Route path="logs" element={<AuditLogs />} />
            <Route path="messaging" element={<MessagingSystem />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default App;
