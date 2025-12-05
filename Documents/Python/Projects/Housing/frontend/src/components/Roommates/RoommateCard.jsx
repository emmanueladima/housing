import { FiMessageCircle, FiHeart, FiSun, FiMoon, FiVolume2, FiCheckCircle, FiDollarSign, FiCalendar, FiStar } from 'react-icons/fi';

const RoommateCard = ({ roommate, onMessage, onFavorite, isSaved, onInvite, onClick }) => {
  const {
    firstName = 'Alex',
    lastName = 'Johnson',
    photo = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
    major = 'Computer Science',
    year = 'Junior',
    budget = { min: 600, max: 900 },
    tags = ['Early Riser', 'Clean', 'Studious'],
    compatibility = 92,
    bio = "Looking for a chill place near campus.",
    moveIn = "Sept 1",
    habits = {
      cleanliness: 'High',
      sleep: 'Early Bird',
      noise: 'Quiet'
    },
    matchReasons = ['Cleanliness', 'Sleep Schedule', 'Budget']
  } = roommate || {};

  // Different colors for habit icons
  const habitColors = {
    sleep: 'bg-amber-100 text-amber-600',
    noise: 'bg-blue-100 text-blue-600',
    cleanliness: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full border border-gray-200"
    >
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Photo & Match Score */}
        <div className="flex justify-between items-start mb-4">
          <div className="relative">
            <img
              src={photo}
              alt={`${firstName} ${lastName}`}
              className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
            <FiStar className="text-green-600 fill-current" size={14} />
            <span className="text-green-700 font-black text-sm">{compatibility}%</span>
            <span className="text-green-600 text-xs font-bold uppercase">Match</span>
          </div>
        </div>

        {/* Name & Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-0.5">{firstName} {lastName}</h3>
          <p className="text-sm text-gray-500 font-medium">{major} • {year}</p>
        </div>

        {/* Quick Info Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
            <FiDollarSign className="text-gray-600" size={14} />
            <span className="text-sm font-semibold text-gray-700">${budget.min}-${budget.max}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
            <FiCalendar className="text-gray-600" size={14} />
            <span className="text-sm font-semibold text-gray-700">{moveIn}</span>
          </div>
        </div>

        {/* Match Reasons */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">You match on</p>
          <div className="flex flex-wrap gap-1.5">
            {matchReasons.slice(0, 3).map((reason, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                <FiCheckCircle size={10} /> {reason}
              </span>
            ))}
          </div>
        </div>

        {/* Habits Strip - Different Colors */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4 mt-auto">
          <div className="flex flex-col items-center gap-1 text-center flex-1">
            <div className={`p-1.5 rounded-lg ${habitColors.sleep}`}>
              {habits.sleep === 'Night Owl' ? <FiMoon size={12} /> : <FiSun size={12} />}
            </div>
            <span className="text-[10px] font-semibold text-gray-600">{habits.sleep}</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center gap-1 text-center flex-1">
            <div className={`p-1.5 rounded-lg ${habitColors.noise}`}>
              <FiVolume2 size={12} />
            </div>
            <span className="text-[10px] font-semibold text-gray-600">{habits.noise}</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center gap-1 text-center flex-1">
            <div className={`p-1.5 rounded-lg ${habitColors.cleanliness}`}>
              <FiCheckCircle size={12} />
            </div>
            <span className="text-[10px] font-semibold text-gray-600">{habits.cleanliness}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite && onFavorite(); }}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${isSaved
            ? 'bg-red-50 text-red-500'
            : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'
            }`}
        >
          <FiHeart size={20} className={isSaved ? 'fill-current' : ''} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onMessage && onMessage(); }}
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <FiMessageCircle size={16} />
          Message
        </button>
      </div>
    </div>
  );
};

export default RoommateCard;
