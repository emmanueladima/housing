import { useState } from 'react';
import { FiX, FiUsers, FiDollarSign, FiMapPin, FiSmile } from 'react-icons/fi';

const CreateGroupModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        budget: '',
        lookingFor: 1,
        description: '',
        vibe: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900">Create a Group</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Group Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Group Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. The Study Hub"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Location & Budget Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                            <div className="relative">
                                <FiMapPin className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Downtown"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Max Budget</label>
                            <div className="relative">
                                <FiDollarSign className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="number"
                                    required
                                    placeholder="per person"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Looking For */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Looking For</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <FiUsers className="absolute left-3 top-3.5 text-gray-400" />
                                <select
                                    value={formData.lookingFor}
                                    onChange={(e) => setFormData({ ...formData, lookingFor: parseInt(e.target.value) })}
                                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none appearance-none transition-all"
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>{num} Roommate{num > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Vibe */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Group Vibe</label>
                        <div className="relative">
                            <FiSmile className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                required
                                placeholder="e.g. Quiet & Studious, Party & Fun..."
                                value={formData.vibe}
                                onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                                className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="Tell us more about your group..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Create Group
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
