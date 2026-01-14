import React, { useState, useEffect } from 'react';
import { FiCalendar, FiPlus, FiClock, FiHome, FiDollarSign, FiStar, FiX, FiTrash2 } from 'react-icons/fi';

const EXAMPLE_EVENTS = [
    { id: 'ex1', title: 'Rent Due', date: new Date().toISOString().split('T')[0], type: 'payment', description: 'Monthly rent payment due to landlord.', isExample: true },
    { id: 'ex2', title: 'House Cleaning Day', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'chore', description: 'Deep clean of common areas.', isExample: true },
    { id: 'ex3', title: 'Game Night', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'social', description: 'Board games and pizza!', isExample: true },
];

const SharedTimeline = ({
    events: propEvents = [],
    onAddEvent,
    onDeleteEvent,
    isPersonal = false
}) => {
    const [localEvents, setLocalEvents] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'social', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use prop events for group mode, localStorage for personal mode
    const events = isPersonal ? localEvents : (propEvents.length > 0 ? propEvents : EXAMPLE_EVENTS);

    useEffect(() => {
        if (isPersonal) {
            // Load events from localStorage for personal use
            const saved = localStorage.getItem('timeline_events');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) {
                    setLocalEvents(parsed);
                } else {
                    setLocalEvents(EXAMPLE_EVENTS);
                }
            } else {
                setLocalEvents(EXAMPLE_EVENTS);
            }
        }
        setIsLoaded(true);
    }, [isPersonal]);

    const saveLocalEvents = (newEvents) => {
        // Filter out example events before saving
        const userEvents = newEvents.filter(e => !e.isExample);
        localStorage.setItem('timeline_events', JSON.stringify(userEvents));
    };

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.date) return;

        setIsSubmitting(true);

        try {
            if (isPersonal) {
                // Personal mode: use localStorage
                const event = {
                    id: Date.now().toString(),
                    ...newEvent,
                    isExample: false
                };

                const userEvents = localEvents.filter(e => !e.isExample);
                const updated = [...userEvents, event].sort((a, b) => new Date(a.date) - new Date(b.date));

                setLocalEvents(updated);
                saveLocalEvents(updated);
            } else if (onAddEvent) {
                // Group mode: use API callback
                await onAddEvent({
                    title: newEvent.title,
                    date: newEvent.date,
                    type: newEvent.type,
                    description: newEvent.description
                });
            }

            setShowModal(false);
            setNewEvent({ title: '', date: '', type: 'social', description: '' });
        } catch (error) {
            console.error('Failed to add event:', error);
            alert('Failed to add event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            if (isPersonal) {
                // Personal mode: use localStorage
                const updated = localEvents.filter(e => e.id !== id);
                if (updated.length === 0) {
                    setLocalEvents(EXAMPLE_EVENTS);
                    localStorage.removeItem('timeline_events');
                } else {
                    setLocalEvents(updated);
                    saveLocalEvents(updated);
                }
            } else if (onDeleteEvent) {
                // Group mode: use API callback
                await onDeleteEvent(id);
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('Failed to delete event. Please try again.');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'payment': return <FiDollarSign />;
            case 'chore': return <FiHome />;
            case 'social': return <FiStar />;
            default: return <FiCalendar />;
        }
    };

    const getColorClasses = (type) => {
        switch (type) {
            case 'payment': return { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' };
            case 'chore': return { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' };
            case 'social': return { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-700' };
            default: return { bg: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-700' };
        }
    };

    const hasUserEvents = events.some(e => !e.isExample);
    const displayEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white">Shared Timeline</h2>
                    <p className="text-white/80 text-sm">Upcoming events and important dates.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg"
                >
                    <FiPlus /> Add Event
                </button>
            </div>

            {/* Info Banner for Example Events */}
            {!hasUserEvents && (
                <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-200 text-sm backdrop-blur-md">
                    <strong>Example Timeline:</strong> Add your own events to replace these examples.
                </div>
            )}

            {/* Timeline Feed */}
            {!isLoaded ? (
                <div className="h-40 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm p-6 animate-fade-in">
                    <div className="relative border-l-2 border-white/20 ml-3 space-y-8">
                        {displayEvents.map((event) => {
                            const colors = getColorClasses(event.type);
                            const eventId = event._id || event.id;
                            return (
                                <div key={eventId} className={`relative pl-8 ${event.isExample ? 'opacity-60' : ''}`}>
                                    {/* Dot */}
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white/30 ${colors.bg} shadow-sm`}></div>

                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${colors.light} ${colors.text} mb-1 border border-black/5`}>
                                                {getIcon(event.type)} {event.type}
                                            </span>
                                            <h3 className="text-lg font-bold text-white">{event.title}</h3>
                                            <p className="text-white/60 text-sm mt-1">{event.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 text-white/70 text-sm font-medium bg-white/10 border border-white/20 px-3 py-1 rounded-lg">
                                                <FiClock size={14} />
                                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            {!event.isExample && (
                                                <button
                                                    onClick={() => handleDeleteEvent(eventId)}
                                                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Add Event</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="e.g., Rent Due, Movie Night"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                <select
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                                >
                                    <option value="social">Social</option>
                                    <option value="payment">Payment</option>
                                    <option value="chore">Chore</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Optional details..."
                                    rows="2"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddEvent}
                                disabled={!newEvent.title || !newEvent.date || isSubmitting}
                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedTimeline;
