import { FiShield, FiUsers, FiHome, FiAlertTriangle, FiFlag } from 'react-icons/fi';
import ModernBackground from '../components/shared/ModernBackground';

const Safety = () => {
  const sections = [
    {
      icon: FiUsers,
      title: 'Meeting Potential Roommates',
      tips: [
        'Always meet in public places first',
        'Tell a friend or family member where you\'re going',
        'Trust your instincts',
        'Video chat before meeting in person'
      ]
    },
    {
      icon: FiHome,
      title: 'Viewing Properties',
      tips: [
        'Schedule tours during daylight hours',
        'Bring a friend or family member',
        'Verify the landlord\'s identity',
        'Check for proper licensing'
      ]
    },
    {
      icon: FiAlertTriangle,
      title: 'Avoiding Scams',
      tips: [
        'Never send money before viewing the property',
        'Be wary of prices that seem too good to be true',
        'Use secure payment methods',
        'Get everything in writing'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header with Orange Gradient & Orbs */}
      <div className="relative overflow-hidden pt-32 pb-16">
        <ModernBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
              <FiShield className="text-yellow-200" size={16} />
              <span className="text-yellow-100 text-sm font-bold uppercase tracking-wider">Stay Protected</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Safety Tips
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Your safety is our priority. Follow these guidelines to protect yourself.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Safety Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={index} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                      <Icon size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 pt-1">{section.title}</h2>
                  </div>
                  <ul className="space-y-3 ml-16">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-3 text-gray-700">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0"></span>
                        <span className="font-medium">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {/* Report Section */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl border border-orange-100 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-md">
                  <FiFlag className="text-orange-500" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Report Suspicious Activity</h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you encounter any suspicious listings, users, or behavior, please report it immediately through our platform or contact support. We take all reports seriously and investigate promptly.
                  </p>
                  <button className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;
