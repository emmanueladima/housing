import { FiMessageCircle, FiHeart, FiSun, FiMoon, FiVolume2, FiCheckCircle, FiDollarSign, FiCalendar, FiStar } from 'react-icons/fi';
import { Card, CardBody, CardFooter } from '@heroui/card';

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
    cleanliness: 'bg-teal-100 text-teal-600'
  };

  return (
    <Card
      isPressable
      onPress={onClick}
      isBlurred
      className="border-none bg-white/80 dark:bg-default-100/50 shadow-lg hover:shadow-2xl transition-all duration-300 h-full rounded-3xl overflow-hidden"
    >
      {/* Content */}
      <CardBody className="p-5 flex-1 flex flex-col overflow-visible">
        {/* Header: Photo & Match Score */}
        <div className="flex justify-between items-start mb-4">
          <div className="relative">
            <img
              src={photo}
              alt={`${firstName} ${lastName}`}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white/50 shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
            {/* Removed green online dot */}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/80 backdrop-blur-sm rounded-full border border-teal-100/50">
            <FiStar className="text-teal-600 fill-current" size={14} />
            <span className="text-teal-700 font-black text-sm">{compatibility}%</span>
            <span className="text-teal-600 text-xs font-bold uppercase">Match</span>
          </div>
        </div>

        {/* Name & Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-0.5">{firstName} {lastName}</h3>
          <p className="text-sm text-gray-500 font-medium">{major} • {year}</p>
        </div>

        {/* Quick Info Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 border border-white/20 rounded-full shadow-sm">
            <FiDollarSign className="text-gray-600" size={14} />
            <span className="text-sm font-semibold text-gray-700">${budget.min}-${budget.max}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 border border-white/20 rounded-full shadow-sm">
            <FiCalendar className="text-gray-600" size={14} />
            <span className="text-sm font-semibold text-gray-700">{moveIn}</span>
          </div>
        </div>

        {/* Match Reasons */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">You match on</p>
          <div className="flex flex-wrap gap-1.5">
            {matchReasons.slice(0, 3).map((reason, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50/50 text-teal-700 text-xs font-semibold border border-teal-100/30">
                <FiCheckCircle size={10} /> {reason}
              </span>
            ))}
          </div>
        </div>

        {/* Habits Strip - Different Colors */}
        <div className="flex items-center justify-between bg-gray-50/50 border border-white/20 rounded-xl p-3 mb-4 mt-auto">
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
      </CardBody>

      {/* Action Footer */}
      <CardFooter className="px-5 py-4 border-t border-gray-100/50 flex items-center justify-between bg-white/40 backdrop-blur-md">
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite && onFavorite(); }}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${isSaved
            ? 'bg-red-50 text-red-500 shadow-sm'
            : 'text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-md'
            }`}
        >
          <FiHeart size={20} className={isSaved ? 'fill-current' : ''} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onMessage && onMessage(); }}
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
        >
          <FiMessageCircle size={16} />
          Message
        </button>
      </CardFooter>
    </Card>
  );
};

export default RoommateCard;
