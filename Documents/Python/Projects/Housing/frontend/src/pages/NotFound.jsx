import { Link } from 'react-router-dom';
import { FiHome, FiArrowRight } from 'react-icons/fi';
import ModernBackground from '../components/shared/ModernBackground';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Orange Gradient & Orbs */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <ModernBackground />

        <div className="relative z-10 w-full">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-[150px] md:text-[200px] font-black text-white/30 leading-none mb-0">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 -mt-8">
              Page Not Found
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-lg mx-auto">
              Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5"
            >
              <FiHome size={20} />
              <span>Go Home</span>
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
