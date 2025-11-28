import { FiUser, FiMessageCircle, FiHeart, FiUserPlus, FiMapPin, FiMoon, FiSun, FiVolume2, FiCheckCircle } from 'react-icons/fi';

const RoommateCard = ({ roommate, onMessage, onFavorite, onInvite, onClick }) => {
  // Mock data if not provided (for development)
  const {
    firstName = 'Alex',
    lastName = 'Johnson',
    photo = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
    major = 'Computer Science',
    year = 'Junior',
    budget = { min: 600, max: 900 },
    tags = ['Early Riser', 'Clean', 'Studious'],
    compatibility = 92,
    bio = "Looking for a chill place near campus. I study a lot but like to hang out on weekends.",
    moveIn = "Sept 1",
    habits = {
      cleanliness: 'High',
      sleep: 'Early Bird',
      noise: 'Quiet'
    },
    matchReasons = ['Cleanliness', 'Sleep Schedule', 'Budget']
  } = roommate || {};

  // Color code for compatibility
  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full"
    >
      <div className="p-5 flex-1">
        {/* Header: Large Photo & Match Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="relative">
            <img
              src={photo}
              alt={`${firstName} ${lastName}`}
              className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
              <div className="bg-green-500 w-3 h-3 rounded-full"></div>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full border text-xs font-bold flex flex-col items-end ${getScoreColor(compatibility)}`}>
            <span className="text-lg leading-none">{compatibility}%</span>
            <span className="text-[10px] opacity-80 uppercase tracking-wide">Match</span>
          </div>
        </div>

        {/* Name & Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{firstName} {lastName}</h3>
          <p className="text-sm text-gray-500 font-medium">{major} • {year}</p>
        </div>

        {/* Match Reasons */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">You match on</p>
          <div className="flex flex-wrap gap-1.5">
            {matchReasons.map((reason, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                <FiCheckCircle size={10} /> {reason}
              </span>
            ))}
          </div>
        </div>

        {/* Habits Icons */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
          <div className="flex flex-col items-center gap-1 text-center w-1/3 border-r border-gray-200 last:border-0">
            <span className="text-gray-400"><FiSun size={14} /></span>
            <span className="text-xs font-semibold text-gray-700">{habits.sleep}</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center w-1/3 border-r border-gray-200 last:border-0">
            <span className="text-gray-400"><FiVolume2 size={14} /></span>
            <span className="text-xs font-semibold text-gray-700">{habits.noise}</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center w-1/3">
            <span className="text-gray-400">✨</span>
            <span className="text-xs font-semibold text-gray-700">{habits.cleanliness}</span>
          </div>
        </div>

        {/* Looking For Summary */}
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
          <p className="text-xs text-orange-800 font-medium line-clamp-2">
            <span className="font-bold">Looking for:</span> Room in a quiet house near Engineering Hall. Budget ${budget.min}-${budget.max}.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(); }}
          className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-colors"
        >
          <FiHeart size={20} />
        </button>

        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onMessage(); }}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
          >
            <FiMessageCircle size={16} />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoommateCard;
