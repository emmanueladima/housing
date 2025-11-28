import { FiX, FiUsers, FiDollarSign, FiMapPin, FiCheckCircle } from 'react-icons/fi';

const GroupDetailsModal = ({ isOpen, onClose, group, onJoin }) => {
    if (!isOpen || !group) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{group.name}</h2>
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <FiMapPin /> {group.location}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                            <p className="text-xs text-orange-600 font-bold uppercase mb-1">Budget</p>
                            <p className="text-lg font-black text-gray-900">${group.budget}</p>
                            <p className="text-xs text-gray-500">per person</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Looking For</p>
                            <p className="text-lg font-black text-gray-900">{group.lookingFor}</p>
                            <p className="text-xs text-gray-500">more members</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                            <p className="text-xs text-green-600 font-bold uppercase mb-1">Compatibility</p>
                            <p className="text-lg font-black text-gray-900">{group.compatibility}%</p>
                            <p className="text-xs text-gray-500">match with you</p>
                        </div>
                    </div>

                    {/* Members */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiUsers /> Current Members
                        </h3>
                        <div className="space-y-3">
                            {group.members && group.members.map((member, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors">
                                    <img src={member.photo} alt="Member" className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-900">Member {i + 1}</p>
                                        <p className="text-xs text-gray-500">Computer Science • Junior</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Vibe & Description */}
                    <section className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">The Vibe</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {group.description || "We are a group of focused students who value a quiet study environment but also enjoy movie nights on weekends. We keep the common areas clean and respect each other's privacy."}
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        Close
                    </button>
                    <button
                        onClick={() => { onJoin(); onClose(); }}
                        className="px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
                    >
                        <FiCheckCircle /> Request to Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailsModal;
