import React, { useState } from 'react';
import { FiCalendar, FiPlus, FiClock, FiHome, FiDollarSign, FiStar } from 'react-icons/fi';

const SharedTimeline = () => {
    // Mock Data
    const [events, setEvents] = useState([
        { id: 1, title: 'Rent Due', date: '2023-12-01', type: 'payment', description: 'Monthly rent payment due to landlord.' },
        { id: 2, title: 'House Cleaning Day', date: '2023-12-03', type: 'chore', description: 'Deep clean of common areas.' },
        { id: 3, title: 'Game Night', date: '2023-12-08', type: 'social', description: 'Board games and pizza!' },
        { id: 4, title: 'Lease Renewal Deadline', date: '2024-01-15', type: 'admin', description: 'Decide on renewing lease for next year.' },
    ]);

    const getIcon = (type) => {
        switch (type) {
            case 'payment': return <FiDollarSign />;
            case 'chore': return <FiHome />;
            case 'social': return <FiStar />;
            default: return <FiCalendar />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'payment': return 'green';
            case 'chore': return 'blue';
            case 'social': return 'pink';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Shared Timeline</h2>
                    <p className="text-gray-500 text-sm">Upcoming events and important dates.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm">
                    <FiPlus /> Add Event
                </button>
            </div>

            {/* Timeline Feed */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                    {events.map((event, index) => {
                        const color = getColor(event.type);
                        return (
                            <div key={event.id} className="relative pl-8">
                                {/* Dot */}
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white bg-${color}-500 shadow-sm`}></div>

                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                    <div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-${color}-50 text-${color}-700 mb-1`}>
                                            {getIcon(event.type)} {event.type}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                        <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium bg-gray-50 px-3 py-1 rounded-lg">
                                        <FiClock size={14} />
                                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SharedTimeline;
