import { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import reportService from '../../services/reportService';

const ReportModal = ({ targetType, targetId, targetName, onClose }) => {
    const [reason, setReason] = useState('spam');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await reportService.createReport({
                targetType,
                targetId,
                reason,
                description,
            });
            alert('Report submitted successfully. We will review it shortly.');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FiAlertTriangle className="text-red-500" />
                        Report {targetType}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                        You are reporting <strong>{targetName}</strong>. Please provide details below.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                            <option value="spam">Spam</option>
                            <option value="harassment">Harassment</option>
                            <option value="inappropriate">Inappropriate Content</option>
                            <option value="fake">Fake Profile/Listing</option>
                            <option value="scam">Scam</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows="4"
                            placeholder="Please describe the issue..."
                            required
                            minLength={10}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
