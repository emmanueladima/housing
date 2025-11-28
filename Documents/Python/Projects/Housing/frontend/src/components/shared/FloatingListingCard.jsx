import { FiHome, FiMapPin, FiStar } from 'react-icons/fi';
import Badge from './Badge';

const FloatingListingCard = () => {
  return (
    <div className="animate-float">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-80 transform hover:scale-105 transition-transform duration-300">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-accent-orange to-accent-red">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/20 text-8xl">
              <FiHome />
            </div>
          </div>
          {/* Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="success" size="sm">
              Verified
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="warning" size="sm">
              New
            </Badge>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-xl mb-2 text-gray-900">
            Modern 2BR Near Campus
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <FiMapPin className="mr-1" size={14} />
            <span>0.5 mi from OSU</span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl font-bold text-accent-orange">
              $850<span className="text-base font-normal text-gray-500">/mo</span>
            </div>
            <div className="flex items-center text-yellow-500">
              <FiStar className="fill-current mr-1" size={16} />
              <span className="text-gray-900 font-semibold">4.8</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-gray-600 text-sm pt-3 border-t">
            <div className="flex items-center">
              <span className="font-semibold mr-1">2</span>
              <span>bed</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">1</span>
              <span>bath</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-1">850</span>
              <span>sqft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingListingCard;

