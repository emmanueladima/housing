import { useState } from 'react';
import { FiX, FiSend } from 'react-icons/fi';

const JoinGroupModal = ({ isOpen, onClose, groupName, onSend }) => {
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSend(message);
        setMessage('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Join {groupName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Introduce yourself to the group! Mention why you think you'd be a good fit.
                    </p>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Hey! I'm a CS major too and I love your group's vibe..."
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none text-sm mb-6"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        <FiSend /> Send Request
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinGroupModal;
