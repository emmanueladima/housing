import { FiZap, FiHeart, FiShield, FiMessageSquare } from 'react-icons/fi';

const FeaturesSection = () => {
  const features = [
    {
      icon: FiZap,
      title: 'AI Matching',
      description: 'Find compatible roommates based on lifestyle and preferences.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: FiHeart,
      title: 'Save Favorites',
      description: 'Bookmark and compare properties easily.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: FiShield,
      title: 'Verified Listings',
      description: 'All listings verified. Only .edu emails accepted.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: FiMessageSquare,
      title: 'Direct Messaging',
      description: 'Chat instantly with landlords and roommates.',
      color: 'from-blue-500 to-indigo-500'
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

        {/* Feature Cards with Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 bg-white rounded-2xl border border-gray-200 hover:border-orange-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon with Gradient Background */}
              <div className={`inline-flex w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="text-white" size={24} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle gradient accent on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-50/0 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
