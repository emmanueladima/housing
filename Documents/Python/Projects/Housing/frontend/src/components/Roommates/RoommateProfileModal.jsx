import { FiX, FiMapPin, FiCalendar, FiDollarSign, FiMessageCircle, FiCheck } from 'react-icons/fi';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const RoommateProfileModal = ({ isOpen, onClose, roommate }) => {
    if (!isOpen || !roommate) return null;

    // Mock data for chart if not present
    const chartData = roommate.chartData || [
        { subject: 'Cleanliness', A: 90, fullMark: 100 },
        { subject: 'Sleep', A: 85, fullMark: 100 },
        { subject: 'Noise', A: 60, fullMark: 100 },
        { subject: 'Social', A: 70, fullMark: 100 },
        { subject: 'Study', A: 95, fullMark: 100 },
        { subject: 'Guests', A: 80, fullMark: 100 },
    ];

    const introTemplates = [
        "Hey! I noticed we have similar sleep schedules. Are you still looking?",
        "Hi! Your budget and location preferences match mine perfectly.",
        "Hey, I'm also a CS major! Would love to chat about housing."
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Left Side: Photo & Key Stats (40%) */}
                <div className="w-full md:w-2/5 bg-gray-50 p-6 md:p-8 flex flex-col overflow-y-auto">
                    <div className="relative mb-6">
                        <img
                            src={roommate.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800'}
                            alt="Profile"
                            className="w-full aspect-square object-cover rounded-2xl shadow-lg"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                            {roommate.compatibility || 92}% Match
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-1">
                        {roommate.firstName} {roommate.lastName}
                    </h2>
                    <p className="text-gray-500 font-medium mb-6">
                        {roommate.major} • {roommate.year}
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                                <FiDollarSign size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Budget</p>
                                <p className="font-semibold">${roommate.budget?.min || 600} - ${roommate.budget?.max || 900}/mo</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                                <FiCalendar size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Move-in</p>
                                <p className="font-semibold">{roommate.moveIn || 'Sept 1'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                            <FiMessageCircle /> Send Message
                        </button>
                    </div>
                </div>

                {/* Right Side: Detailed Info (60%) */}
                <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX size={24} />
                    </button>

                    {/* Compatibility Chart */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Compatibility Breakdown</h3>
                        <div className="h-64 w-full -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Compatibility"
                                        dataKey="A"
                                        stroke="#000000"
                                        strokeWidth={2}
                                        fill="#000000"
                                        fillOpacity={0.1}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* About & Habits */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">About Me</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            {roommate.bio || "I'm a dedicated student who loves to keep things organized. I enjoy cooking on weekends and exploring the city. Looking for roommates who respect quiet hours but are also down to hang out occasionally."}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Weekly Rhythm</p>
                                <p className="font-semibold text-gray-900">Early Riser ☀️</p>
                                <p className="text-xs text-gray-500 mt-1">Up by 7AM, quiet by 10PM</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Cleanliness</p>
                                <p className="font-semibold text-gray-900">Very Clean ✨</p>
                                <p className="text-xs text-gray-500 mt-1">Daily tidying, weekly deep clean</p>
                            </div>
                        </div>
                    </section>

                    {/* Quick Intro Templates */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Intro</h3>
                        <div className="space-y-2">
                            {introTemplates.map((template, i) => (
                                <button
                                    key={i}
                                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all text-sm text-gray-600 hover:text-gray-900 flex items-center justify-between group"
                                >
                                    {template}
                                    <FiMessageCircle className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default RoommateProfileModal;
