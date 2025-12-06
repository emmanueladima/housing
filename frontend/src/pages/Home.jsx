import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Layout/Hero';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { formatPrice } from '../utils/priceFormatter';
import { FiArrowRight, FiMapPin, FiShield, FiZap, FiUsers, FiHeart, FiHome, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/shared/Modal';
import Login from '../components/Auth/Login';
import SignUp from '../components/Auth/SignUp';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trendingListings, setTrendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const fetchTrendingListings = async () => {
      try {
        const data = await listingService.getListings({
          sortBy: 'popular',
          limit: 4,
        });
        setTrendingListings(data.listings || []);
      } catch (error) {
        console.error('Error fetching trending listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingListings();
  }, []);

  const features = [
    { icon: FiZap, title: 'Smart Matching', desc: 'AI-powered roommate compatibility', color: 'amber' },
    { icon: FiShield, title: 'Verified Users', desc: 'Only .edu emails accepted', color: 'emerald' },
    { icon: FiMessageCircle, title: 'Direct Chat', desc: 'Message landlords instantly', color: 'blue' },
  ];

  return (
    <>
      <div className="bg-white">
        <Hero />

        {/* Value Props - Sleek Bar */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${f.color}-100 flex items-center justify-center text-${f.color}-600`}>
                    <f.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{f.title}</h3>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Listings - Premium Grid */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="text-orange-600 font-bold text-sm uppercase tracking-wider mb-2">Featured</p>
                <h2 className="text-4xl font-black text-gray-900">
                  Popular Near You
                </h2>
              </div>
              <Link
                to="/listings"
                className="hidden md:inline-flex items-center gap-2 text-gray-600 font-semibold hover:text-orange-600 transition-colors"
              >
                View all listings
                <FiArrowRight />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingListings.map((listing) => (
                  <Link
                    key={listing._id}
                    to={`/listings/${listing._id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiHome size={32} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                          <FiHeart size={16} className="text-gray-600" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-orange-600 transition-colors">
                        {listing.title}
                      </h3>

                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <FiMapPin size={12} className="mr-1 text-orange-500" />
                        <span className="truncate">{listing.city}, {listing.state}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div>
                          <span className="text-xl font-black text-gray-900">{formatPrice(listing.rent)}</span>
                          <span className="text-xs text-gray-400">/mo</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {listing.bedrooms}bd • {listing.bathrooms}ba
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile CTA */}
            <div className="mt-8 text-center md:hidden">
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl"
              >
                View All Listings
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section - Dark & Premium */}
        <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
          <div className="absolute top-0 right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-orange-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-orange-400 font-bold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Join Our Community</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6">
              Find Your Perfect Place
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of students who found their ideal home and roommates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/listings');
                  } else {
                    setShowSignUp(true);
                  }
                }}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-gray-900 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
              >
                Get Started Free
                <FiArrowRight size={20} />
              </button>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/listings');
                  } else {
                    setShowLogin(true);
                  }
                }}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-transparent border-2 border-white/20 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all"
              >
                Browse Listings
              </button>
            </div>

            <p className="mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm">
              Verified students only • No credit card required
            </p>
          </div>
        </section>
      </div>

      {/* Auth Modals */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Log In to collegio">
        <Login
          onSuccess={() => setShowLogin(false)}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
        />
      </Modal>

      <Modal isOpen={showSignUp} onClose={() => setShowSignUp(false)} title="Join collegio">
        <SignUp
          onSuccess={() => setShowSignUp(false)}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
        />
      </Modal>
    </>
  );
};

export default Home;
