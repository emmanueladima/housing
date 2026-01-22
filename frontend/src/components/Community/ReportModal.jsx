import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiFlag } from 'react-icons/fi';
import Modal from '../shared/Modal';

import GlassModal from '../GlassModal';

const REPORT_REASONS = [
    { id: 'spam', label: 'Spam or Misleading' },
    { id: 'harassment', label: 'Harassment or Hate Speech' },
    { id: 'inappropriate', label: 'Inappropriate Content' },
    { id: 'fake', label: 'Fake Account or Listing' },
    { id: 'scam', label: 'Scam or Fraud' },
    { id: 'other', label: 'Other Issue' }
];

const ReportModal = ({ isOpen, onClose, targetTitle, onSubmit }) => {
    const [reason, setReason] = useState(REPORT_REASONS[0].id);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(reason, description);
            onClose();
            // Reset form
            setReason(REPORT_REASONS[0].id);
            setDescription('');
        } catch (error) {
            console.error('Report submission failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <GlassModal onClose={onClose} className="max-w-lg">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-white/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-500 border border-red-500/20">
                        <FiAlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Report Content</h3>
                </div>
                <button onClick={onClose} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                    <FiX size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                {targetTitle && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-1">Reporting</p>
                        <p className="font-medium text-white line-clamp-1">{targetTitle}</p>
                    </div>
                )}

                {/* Reason Selection */}
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Why are you reporting this?</label>
                    <div className="space-y-2">
                        {REPORT_REASONS.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setReason(r.id)}
                                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${reason === r.id
                                    ? 'bg-red-500/20 border-red-500 text-white ring-1 ring-red-500'
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span className={`font-medium`}>
                                    {r.label}
                                </span>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${reason === r.id ? 'border-red-500 bg-red-500' : 'border-white/20 bg-white/5'
                                    }`}>
                                    {reason === r.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-1">Additional Details (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please provide specific details..."
                        rows="3"
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none transition-all text-white placeholder-white/30"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </GlassModal>
    );
};

export default ReportModal;
