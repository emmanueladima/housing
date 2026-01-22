import { useState } from 'react';
import { FiSend, FiUsers, FiMail, FiBell, FiCheckCircle } from 'react-icons/fi';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';

const MessagingSystem = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetAudience, setTargetAudience] = useState('all');
    const [type, setType] = useState('both'); // notification, email, both
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!title || !message) return toast.error('Please fill in all fields');

        setSending(true);
        try {
            await adminService.sendAnnouncement({
                title,
                message,
                targetAudience,
                type
            });
            setSuccess(true);
            toast.success('Announcement sent successfully');

            // Reset after success
            setTimeout(() => {
                setSuccess(false);
                setTitle('');
                setMessage('');
            }, 3000);
        } catch (error) {
            toast.error(error.message || 'Failed to send announcement');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                System Messaging
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Compose Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <form onSubmit={handleSend} className="space-y-6">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Subject / Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Platform Maintenance Update"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Message Content</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="8"
                                    placeholder="Write your announcement here..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={sending || success}
                                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${success
                                        ? 'bg-green-500 text-white'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/20'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {success ? (
                                        <>
                                            <FiCheckCircle /> Sent Successfully
                                        </>
                                    ) : sending ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            <FiSend /> Send Message
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="space-y-6">
                    {/* Audience Selector */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <FiUsers className="text-blue-400" /> Target Audience
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'all', label: 'All Users' },
                                { id: 'student', label: 'Students Only' },
                                { id: 'landlord', label: 'Landlords Only' }
                            ].map((option) => (
                                <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${targetAudience === option.id
                                        ? 'border-blue-500 bg-blue-500/20'
                                        : 'border-gray-500 group-hover:border-gray-400'
                                        }`}>
                                        {targetAudience === option.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="audience"
                                        value={option.id}
                                        checked={targetAudience === option.id}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                        className="hidden"
                                    />
                                    <span className={targetAudience === option.id ? 'text-white' : 'text-gray-400'}>
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Method */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <FiMail className="text-purple-400" /> Delivery Method
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'notification', label: 'In-App Notification', icon: FiBell },
                                { id: 'email', label: 'Email Broadcast', icon: FiMail },
                                { id: 'both', label: 'Both Channels', icon: FiSend }
                            ].map((option) => (
                                <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${type === option.id
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-gray-500 group-hover:border-gray-400'
                                        }`}>
                                        {type === option.id && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="type"
                                        value={option.id}
                                        checked={type === option.id}
                                        onChange={(e) => setType(e.target.value)}
                                        className="hidden"
                                    />
                                    <span className={type === option.id ? 'text-white' : 'text-gray-400'}>
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-blue-200 text-sm">
                            <span className="font-bold">Note:</span> Emails use a queue system. For large audiences (1000+), delivery may take a few minutes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagingSystem;
