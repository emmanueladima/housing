import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Glass Modal Card */}
            <div className="relative bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Glass Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <FiX size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl">
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
                    <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* User Info Preview */}
                        {prefillData?.user && (
                            <div className="bg-white/10 rounded-xl p-4 border border-white/20 space-y-2">
                                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Your Information</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-white">
                                        <FiUser className="text-orange-400" size={14} />
                                        <span>{prefillData.user.firstName} {prefillData.user.lastName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <FiPhone className="text-orange-400" size={14} />
                                        <span>{prefillData.user.phone}</span>
                                    </div>
                                </div>
                                {prefillData.user.school && (
                                    <div className="text-sm text-white/70">
                                        {prefillData.user.school} • Class of {prefillData.user.graduationYear}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Template Info */}
                        {prefillData?.template && (
                            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FiCheck className="text-green-400" size={16} />
                                        <span className="text-sm font-medium text-green-300">
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
                                        <span className="text-xs text-white/60">Use template</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Move-in Date */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                <FiCalendar className="inline mr-1" size={14} />
                                Move-in Date
                            </label>
                            <input
                                type="date"
                                value={formData.moveInDate}
                                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>

                        {/* Lease Term */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Lease Term
                            </label>
                            <select
                                value={formData.leaseTerm}
                                onChange={(e) => setFormData({ ...formData, leaseTerm: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="month-to-month" className="bg-gray-800">Month-to-Month</option>
                                <option value="6-months" className="bg-gray-800">6 Months</option>
                                <option value="1-year" className="bg-gray-800">1 Year</option>
                                <option value="academic-year" className="bg-gray-800">Academic Year</option>
                            </select>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                <FiEdit3 className="inline mr-1" size={14} />
                                Cover Letter (Optional)
                            </label>
                            <textarea
                                value={formData.coverLetter}
                                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                placeholder="Tell the landlord about yourself..."
                                rows={3}
                                maxLength={2000}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                            />
                            <div className="text-xs text-white/40 text-right mt-1">
                                {formData.coverLetter.length}/2000
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-red-300 text-sm">
                                {error}
                            </div>
                        )}
                    </form>
                )}

                {/* Footer Actions */}
                <div className="p-5 pt-0 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || loading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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
            </div>
        </div>,
        document.body
    );
};

export default QuickApplyModal;
