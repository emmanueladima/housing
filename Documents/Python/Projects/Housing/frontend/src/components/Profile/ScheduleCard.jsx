import React from 'react';
import { FiCalendar, FiEdit2, FiClock } from 'react-icons/fi';

const ScheduleCard = ({ schedule = [], onEdit }) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // Helper to check if a specific hour on a day is busy
    const getActivityForHour = (dayIndex, hour) => {
        const dayName = days[dayIndex];
        const block = schedule.find(s =>
            s.day === dayName &&
            hour >= s.startHour &&
            hour < s.endHour
        );
        return block;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FiCalendar className="text-indigo-500" /> Weekly Schedule
                </h2>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                    <FiEdit2 size={14} /> Edit
                </button>
            </div>

            <div className="p-6">
                {schedule.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-500">
                            <FiClock size={24} />
                        </div>
                        <p className="text-gray-500 text-sm mb-4">
                            Add your weekly schedule to find roommates with compatible routines.
                        </p>
                        <button
                            onClick={onEdit}
                            className="text-indigo-600 font-medium text-sm hover:underline"
                        >
                            Add Schedule
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* Visual Grid */}
                        <div className="min-w-[300px]">
                            <div className="flex mb-2">
                                <div className="w-8"></div>
                                {dayLabels.map((day, i) => (
                                    <div key={i} className="flex-1 text-center text-xs font-bold text-gray-400">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Hours 8am to 10pm */}
                            {[8, 10, 12, 14, 16, 18, 20, 22].map(hour => (
                                <div key={hour} className="flex items-center h-8 mb-1">
                                    <div className="w-8 text-[10px] text-gray-400 text-right pr-2">
                                        {hour > 12 ? `${hour - 12}p` : `${hour}a`}
                                    </div>
                                    {days.map((_, dayIndex) => {
                                        const activity = getActivityForHour(dayIndex, hour);
                                        let colorClass = "bg-gray-100";
                                        if (activity) {
                                            if (activity.activity.toLowerCase().includes('class')) colorClass = "bg-orange-400";
                                            else if (activity.activity.toLowerCase().includes('work')) colorClass = "bg-blue-400";
                                            else if (activity.activity.toLowerCase().includes('social')) colorClass = "bg-pink-400";
                                            else colorClass = "bg-indigo-400";
                                        }

                                        return (
                                            <div key={dayIndex} className="flex-1 px-0.5 h-full">
                                                <div
                                                    className={`w-full h-full rounded-sm ${colorClass} ${activity ? 'opacity-90' : 'opacity-30'}`}
                                                    title={activity ? `${activity.activity} (${activity.startHour}:00 - ${activity.endHour}:00)` : 'Free'}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            <div className="flex justify-center gap-4 mt-4 text-[10px] text-gray-500">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Class</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Work</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-400"></div> Social</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleCard;
