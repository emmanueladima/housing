import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiFileText, FiCalendar, FiEdit3, FiZap, FiUser, FiDollarSign, FiPhone } from 'react-icons/fi';
import applicationService from '../../services/applicationService';
import LoadingSpinner from '../shared/LoadingSpinner';

const QuickApplyModal = ({ isOpen, onClose, listing, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [prefillData, setPrefillData] = useState(null);
    const [formData, setFormData] = useState({
        moveInDate: '',
        leaseTerm: 'academic-year',
        coverLetter: '',
        useTemplate: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && listing?._id) {
            fetchPrefillData();
        }
    }, [isOpen, listing?._id]);

    const fetchPrefillData = async () => {
        try {
            setLoading(true);
            const data = await applicationService.getPrefillData(listing._id);
            setPrefillData(data);

            // Pre-fill form with template data
            if (data.template) {
                setFormData(prev => ({
                    ...prev,
                    moveInDate: data.template.preferredMoveInDate
                        ? new Date(data.template.preferredMoveInDate).toISOString().split('T')[0]
                        : data.listing?.availableDate
                            ? new Date(data.listing.availableDate).toISOString().split('T')[0]
                            : '',
                    leaseTerm: data.template.preferredLeaseTerm || 'academic-year',
                    coverLetter: data.template.defaultCoverLetter || '',
                }));
            } else if (data.listing?.availableDate) {
                setFormData(prev => ({
                    ...prev,
                    moveInDate: new Date(data.listing.availableDate).toISOString().split('T')[0],
                }));
            }
        } catch (err) {
            console.error('Error fetching prefill data:', err);
            setError('Failed to load application data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.moveInDate) {
            setError('Please select a move-in date');
            return;
        }

        try {
            setSubmitting(true);

            if (formData.useTemplate && prefillData?.template) {
                // Quick Apply with template
                await applicationService.quickApply(
                    listing._id,
                    prefillData.template.id,
                    {
                        moveInDate: formData.moveInDate,
                        leaseTerm: formData.leaseTerm,
                        coverLetter: formData.coverLetter,
                    }
                );
            } else {
                // Standard submit
                await applicationService.submitApplication({
                    listingId: listing._id,
                    moveInDate: formData.moveInDate,
                    leaseTerm: formData.leaseTerm,
                    coverLetter: formData.coverLetter,
                });
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-t-2xl">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <FiX size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <FiZap className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Quick Apply</h2>
                            <p className="text-white/80 text-sm">{listing?.title}</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {/* User Info Preview */}
                        {prefillData?.user && (
                            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Information</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FiUser className="text-gray-400" size={14} />
                                        <span>{prefillData.user.firstName} {prefillData.user.lastName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiPhone className="text-gray-400" size={14} />
                                        <span>{prefillData.user.phone}</span>
                                    </div>
                                </div>
                                {prefillData.user.school && (
                                    <div className="text-sm text-gray-600">
                                        {prefillData.user.school} • Class of {prefillData.user.graduationYear}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Template Info */}
                        {prefillData?.template && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FiCheck className="text-green-600" size={16} />
                                        <span className="text-sm font-medium text-green-800">
                                            Using template: {prefillData.template.name}
                                        </span>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.useTemplate}
                                            onChange={(e) => setFormData({ ...formData, useTemplate: e.target.checked })}
                                            className="rounded text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="text-xs text-gray-600">Use template</span>
                                    </label>
                                </div>
                                {prefillData.template.incomeInfo?.employer && (
                                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                        <FiDollarSign size={14} />
                                        <span>{prefillData.template.incomeInfo.employer}</span>
                                        {prefillData.template.incomeInfo.annualIncome && (
                                            <span className="text-gray-400">
                                                • ${prefillData.template.incomeInfo.annualIncome.toLocaleString()}/yr
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Move-in Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FiCalendar className="inline mr-1" size={14} />
                                Move-in Date
                            </label>
                            <input
                                type="date"
                                value={formData.moveInDate}
                                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>

                        {/* Lease Term */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lease Term
                            </label>
                            <select
                                value={formData.leaseTerm}
                                onChange={(e) => setFormData({ ...formData, leaseTerm: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="month-to-month">Month-to-Month</option>
                                <option value="6-months">6 Months</option>
                                <option value="1-year">1 Year</option>
                                <option value="academic-year">Academic Year</option>
                            </select>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FiEdit3 className="inline mr-1" size={14} />
                                Cover Letter (Optional)
                            </label>
                            <textarea
                                value={formData.coverLetter}
                                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                placeholder="Tell the landlord about yourself, why you'd be a great tenant..."
                                rows={4}
                                maxLength={2000}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                            />
                            <div className="text-xs text-gray-500 text-right mt-1">
                                {formData.coverLetter.length}/2000
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <>
                                        <FiZap size={16} />
                                        Apply Now
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default QuickApplyModal;
