import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Layout/Hero';
import FeaturesSection from '../components/Home/FeaturesSection';
import CTASection from '../components/Home/CTASection';
import listingService from '../services/listingService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { formatPrice } from '../utils/priceFormatter';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';

const Home = () => {
  const [trendingListings, setTrendingListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingListings = async () => {
      try {
        const data = await listingService.getListings({
          sortBy: 'popular',
          limit: 6,
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

  return (
    <div className="bg-white">
      <Hero />

      <FeaturesSection />

      {/* Trending Listings - Simplified */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">
                Trending Listings
              </h2>
              <p className="text-gray-600">
                Most popular near campus
              </p>
            </div>
            <Link 
              to="/listings" 
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
            >
              View All
              <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingListings.map((listing) => (
                <Link
                  key={listing._id}
                  to={`/listings/${listing._id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">
                      {listing.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <FiMapPin className="mr-1" size={14} />
                      <span>{listing.city}, {listing.state}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-3xl font-black text-gray-900">
                        {formatPrice(listing.rent)}
                        <span className="text-sm font-normal text-gray-500">/mo</span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {listing.bedrooms} bed • {listing.bathrooms} bath
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="mt-8 text-center md:hidden">
            <Link 
              to="/listings" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
            >
              View All Listings
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
};

export default Home;
