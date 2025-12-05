const StatsSection = () => {
  const stats = [
    {
      number: '1,500+',
      label: 'Active Listings',
      subtext: 'Verified properties',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      number: '10,000+',
      label: 'Students Helped',
      subtext: 'Finding their home',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      number: '50+',
      label: 'Universities',
      subtext: 'Across the nation',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      number: '4.8/5',
      label: 'Average Rating',
      subtext: 'From verified students',
      gradient: 'from-yellow-500 to-orange-600'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* University Badges */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Trusted by students at 50+ universities
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            <span className="text-xl font-black text-gray-700">OREGON STATE</span>
            <span className="text-xl font-black text-gray-700">UO</span>
            <span className="text-xl font-black text-gray-700">PORTLAND STATE</span>
            <span className="text-xl font-black text-gray-700">OSU</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Card */}
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`text-5xl font-black mb-3 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent group-hover:text-white transition-all duration-300`}>
                    {stat.number}
                  </div>
                  <div className="text-lg font-bold text-gray-900 group-hover:text-white mb-1 transition-colors duration-300">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-white/80 transition-colors duration-300">
                    {stat.subtext}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;



