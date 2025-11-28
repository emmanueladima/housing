import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 relative overflow-hidden bg-gray-900">
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
      
      {/* Subtle glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Join thousands of students finding their perfect home.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/signup')}
            className="px-10 py-5 bg-white text-gray-900 font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
          >
            Sign Up Free
            <FiArrowRight size={20} />
          </button>
          
          <button
            onClick={() => navigate('/listings')}
            className="px-10 py-5 bg-transparent border-2 border-white/20 text-white font-bold text-lg rounded-xl hover:border-white/40 transition-colors"
          >
            Browse Listings
          </button>
        </div>

        <p className="mt-6 text-gray-500 text-sm">
          No credit card required • Free to join
        </p>
      </div>
    </section>
  );
};

export default CTASection;
