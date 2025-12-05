import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiHome, FiUsers } from 'react-icons/fi';
import ModernBackground from '../shared/ModernBackground';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Background */}
      <ModernBackground />

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight pt-32">
              Find Your
              <br />
              <span className="text-yellow-200">
                Perfect Place
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-12 max-w-2xl leading-relaxed">
              Verified listings, AI roommate matching, and secure messaging — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => navigate('/listings')}
                className="group flex items-center gap-3 px-8 py-5 bg-white text-gray-900 font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-1"
              >
                <FiHome size={22} />
                Browse Listings
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/roommates')}
                className="group flex items-center gap-3 px-8 py-5 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 font-bold text-lg rounded-2xl hover:bg-white/30 transition-all"
              >
                <FiUsers size={22} />
                Find Roommates
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats or Trust Badges */}
            <div className="flex flex-wrap gap-8 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>500+ Active Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>1,200+ Verified Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>.edu Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
