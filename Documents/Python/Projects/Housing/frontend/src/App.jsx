import { Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetailPage from './pages/ListingDetailPage';
import Roommates from './pages/Roommates';
import RoommateToolkit from './pages/RoommateToolkit';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Applications from './pages/Applications';
import CreateListing from './pages/CreateListing';
import Subleases from './pages/Subleases';


import LandlordDashboard from './pages/LandlordDashboard';
import Notifications from './pages/Notifications';
import SavedSearches from './pages/SavedSearches';
import Safety from './pages/Safety';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route
            path="/listings/create"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route path="/subleases" element={<Subleases />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected routes */}
          <Route
            path="/roommates"
            element={
              <ProtectedRoute>
                <Roommates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roommate-toolkit"
            element={
              <ProtectedRoute>
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
            path="/landlord/dashboard"
            element={
              <ProtectedRoute>
                <LandlordDashboard />
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

