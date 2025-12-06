import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiHome, FiUsers } from 'react-icons/fi';
import ModernBackground from '../shared/ModernBackground';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../shared/Modal';
import SignUp from '../Auth/SignUp';
import Login from '../Auth/Login';

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleListingsClick = () => {
    if (isAuthenticated) {
      navigate('/listings');
    } else {
      setShowSignUp(true);
    }
  };

  const handleRoommatesClick = () => {
    if (isAuthenticated) {
      navigate('/roommates');
    } else {
      setShowSignUp(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden min-h-[100svh] md:min-h-[85vh] flex items-center">
        {/* Background */}
        <ModernBackground />

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">

              {/* Main Headline - Responsive text sizes */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-4 sm:mb-6 md:mb-8 leading-[1.1] tracking-tight pt-24 sm:pt-28 md:pt-32">
                Find Your
                <br />
                <span className="text-yellow-200">
                  Perfect Place
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 md:mb-12 max-w-2xl leading-relaxed">
                Verified listings, AI roommate matching, and secure messaging — all in one place.
              </p>

              {/* CTA Buttons - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={handleListingsClick}
                  className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-white text-gray-900 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-1"
                >
                  <FiHome size={20} className="sm:w-[22px] sm:h-[22px]" />
                  Browse Listings
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleRoommatesClick}
                  className="group flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:bg-white/30 transition-all"
                >
                  <FiUsers size={20} className="sm:w-[22px] sm:h-[22px]" />
                  Find Roommates
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Stats - Responsive layout */}
              <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 text-white/70 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>500+ Active Listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>1,200+ Verified Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>.edu Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <Modal isOpen={showSignUp} onClose={() => setShowSignUp(false)} title="Join collegio">
        <SignUp
          onSuccess={() => setShowSignUp(false)}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
        />
      </Modal>

      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Log In to collegio">
        <Login
          onSuccess={() => setShowLogin(false)}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
        />
      </Modal>
    </>
  );
};

export default Hero;
