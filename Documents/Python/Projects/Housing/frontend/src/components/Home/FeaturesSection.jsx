import { FiZap, FiHeart, FiShield, FiMessageSquare } from 'react-icons/fi';

const FeaturesSection = () => {
  const features = [
    {
      icon: FiZap,
      title: 'AI Matching',
      description: 'Find compatible roommates based on lifestyle and preferences.'
    },
    {
      icon: FiHeart,
      title: 'Save Favorites',
      description: 'Bookmark and compare properties easily.'
    },
    {
      icon: FiShield,
      title: 'Verified Listings',
      description: 'All listings verified. Only .edu emails accepted.'
    },
    {
      icon: FiMessageSquare,
      title: 'Direct Messaging',
      description: 'Chat instantly with landlords and roommates.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Simple Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600">
            Simple, secure, and built for students.
          </p>
        </div>

        {/* Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center"
            >
              {/* Icon */}
              <div className="inline-flex w-16 h-16 bg-orange-100 rounded-2xl items-center justify-center mb-4">
                <feature.icon className="text-orange-600" size={32} />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
