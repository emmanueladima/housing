import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import ModernBackground from '../shared/ModernBackground';

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?city=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Background */}
      <ModernBackground />

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-block mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                Student Housing Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Find Your
              <br />
              <span className="text-yellow-200">
                Perfect Place
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-12 max-w-2xl leading-relaxed">
              Verified listings, AI roommate matching, and secure messaging — all in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative max-w-2xl">
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="flex items-center pl-6 pr-4">
                    <FiSearch className="text-gray-400" size={24} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by city or university..."
                    className="flex-1 py-5 px-2 text-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="m-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-xl transition-shadow duration-200 flex items-center gap-2"
                  >
                    Search
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </form>

            {/* Simple Links */}
            <div className="flex flex-wrap gap-6 text-white/70 text-sm">
              <button
                onClick={() => navigate('/listings')}
                className="hover:text-white transition-colors"
              >
                Browse Listings →
              </button>
              <button
                onClick={() => navigate('/roommates')}
                className="hover:text-white transition-colors"
              >
                Find Roommates →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
