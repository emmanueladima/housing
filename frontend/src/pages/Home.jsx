import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Layout/Hero';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { formatPrice } from '../utils/priceFormatter';
import { FiArrowRight, FiMapPin, FiShield, FiZap, FiUsers, FiHeart, FiHome, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/shared/Modal';
import Login from '../components/Auth/Login';
import SignUp from '../components/Auth/SignUp';
import ModernBackground from '../components/shared/ModernBackground';

// Animation variants for feature cards - 3D carousel rotation
const cardVariants = {
  hidden: (i) => ({
    opacity: 0,
    rotateY: i === 0 ? -90 : i === 2 ? 90 : 0, // left card from left, right from right, middle from front
    x: i === 0 ? -100 : i === 2 ? 100 : 0,
    scale: 0.8,
  }),
  visible: (i) => ({
    opacity: 1,
    rotateY: 0,
    x: 0,
    scale: 1,
    transition: {
      delay: 0.3 + i * 0.2,
      duration: 1,
      ease: [0.34, 1.56, 0.64, 1], // slight overshoot for settling effect
    },
  }),
};

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
      <div className="relative min-h-screen">
        <Hero />

        {/* Value Props - Feature Cards with 3D carousel effect */}
        <motion.section
          className="py-6 -mt-8 relative"
          style={{ perspective: 1200 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    rotateY: 180, // all cards start flipped
                    scale: 0.8,
                  }}
                  whileInView={{
                    opacity: 1,
                    rotateY: 0, // spin to face forward
                    scale: 1,
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: 0.1 + i * 0.2, // stagger: card 1, then 2, then 3
                    duration: 1.2, // longer for smooth spin
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    scale: 1.04,
                    y: -6,
                    transition: { duration: 0.25 }
                  }}
                  className="flex items-center gap-4 p-6 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/30 transition-colors duration-300 cursor-pointer"
                  style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center text-white">
                    <f.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{f.title}</h3>
                    <p className="text-sm text-white/80">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section - Glass Card */}
        <section className="py-16 sm:py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-2xl"
            >
              <p className="text-yellow-200 font-bold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Join Our Community</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6">
                Find Your Perfect Place
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-10 max-w-2xl mx-auto">
                Join thousands of students who found their ideal home and roommates.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <motion.button
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/listings');
                    } else {
                      setShowSignUp(true);
                    }
                  }}
                  className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-gray-900 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Free
                  <FiArrowRight size={20} />
                </motion.button>

                <motion.button
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/listings');
                    } else {
                      setShowLogin(true);
                    }
                  }}
                  className="px-8 sm:px-10 py-4 sm:py-5 bg-white/20 backdrop-blur-md border-2 border-white/30 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:border-white/50 hover:bg-white/30 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse Listings
                </motion.button>
              </div>

              <p className="mt-6 sm:mt-8 text-white/60 text-xs sm:text-sm">
                Verified students only • No credit card required
              </p>
            </motion.div>
          </div>
        </section>
      </div >

      {/* Auth Modals */}
      < Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Log In to collegio" >
        <Login
          onSuccess={() => setShowLogin(false)}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
        />
      </Modal >

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
