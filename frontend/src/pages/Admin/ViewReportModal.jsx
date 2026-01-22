import { FiX, FiUser, FiHome, FiMessageCircle, FiTrash2, FiSlash, FiCheck, FiMapPin, FiCalendar } from 'react-icons/fi';
import GlassModal from '../../components/GlassModal';

const ViewReportModal = ({ report, onClose, onAction, processingId }) => {
    if (!report) return null;

    const { targetType, targetUser, targetListing, targetPost } = report;

    // Helper to format date
    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Render content based on target type
    const renderContent = () => {
        if (targetType === 'User') {
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        {targetUser?.profilePhoto ? (
                            <img src={targetUser.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white">
                                <FiUser size={32} />
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-white">{targetUser?.firstName} {targetUser?.lastName}</h3>
                            <p className="text-gray-400 text-sm">{targetUser?.email}</p>
                            <p className="text-gray-400 text-sm mt-1">Joined: {targetUser?.createdAt ? formatDate(targetUser.createdAt) : 'Unknown'}</p>
                        </div>
                    </div>
                    {/* User Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => onAction('ban_user', targetUser?._id)}
                            disabled={processingId}
                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                        >
                            <FiSlash />
                            {targetUser?.isBanned ? 'Unban User' : 'Ban User'}
                        </button>
                    </div>
                </div>
            );
        }

        if (targetType === 'Listing') {
            return (
                <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        {targetListing?.images?.[0] && (
                            <div className="h-48 w-full">
                                <img src={targetListing.images[0]} alt="Listing" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-white mb-2">{targetListing?.title || 'Untitled Listing'}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                <FiMapPin />
                                {targetListing?.address}, {targetListing?.city}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-green-400 font-bold">${targetListing?.price}/mo</span>
                                <span className="text-gray-500">{formatDate(targetListing?.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    {/* Listing Moderator Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => onAction('delete_listing', targetListing?._id)}
                            disabled={processingId}
                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                        >
                            <FiTrash2 />
                            Delete Listing
                        </button>
                    </div>
                </div>
            );
        }

        if (targetType === 'CommunityPost') {
            return (
                <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {targetPost?.author?.profilePhoto ? (
                                    <img src={targetPost.author.profilePhoto} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><FiUser /></div>
                                )}
                                <div>
                                    <p className="text-white font-medium">{targetPost?.author?.firstName}</p>
                                    <p className="text-xs text-gray-500">{formatDate(targetPost?.createdAt)}</p>
                                </div>
                            </div>
                            <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">
                                {targetPost?.channel}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">{targetPost?.title}</h3>
                        <p className="text-gray-300 leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar">
                            {targetPost?.description}
                        </p>

                        {/* Images if any */}
                        {targetPost?.images?.length > 0 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                {targetPost.images.map((img, i) => (
                                    <img key={i} src={img} className="h-24 w-auto rounded-lg" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => onAction('delete_post', targetPost?._id)}
                            disabled={processingId}
                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                        >
                            <FiTrash2 />
                            Delete Post
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <GlassModal onClose={onClose} className="max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3 text-white">
                    {targetType === 'User' && <FiUser className="text-blue-400" size={24} />}
                    {targetType === 'Listing' && <FiHome className="text-green-400" size={24} />}
                    {targetType === 'CommunityPost' && <FiMessageCircle className="text-purple-400" size={24} />}
                    <h2 className="text-xl font-bold">Review {targetType}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <FiX size={24} />
                </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                {/* Report Details */}
                <div className="mb-8 bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                    <h4 className="text-red-400 font-bold text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                        <FiAlertTriangle /> Reported For {report.reason}
                    </h4>
                    <p className="text-white/80 text-sm">"{report.description}"</p>
                    <p className="text-gray-500 text-xs mt-2">
                        Reported by {report.reporter?.firstName} {report.reporter?.lastName} on {formatDate(report.createdAt)}
                    </p>
                </div>

                {renderContent()}

                {/* General Actions */}
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium"
                    >
                        Close
                    </button>
                    {report.status === 'pending' && (
                        <>
                            <button
                                onClick={() => onAction('dismiss', null)}
                                disabled={processingId}
                                className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors"
                            >
                                Dismiss Report
                            </button>
                            <button
                                onClick={() => onAction('resolve', null)}
                                disabled={processingId}
                                className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg transition-colors flex items-center gap-2"
                            >
                                <FiCheck />
                                Resolve Without Action
                            </button>
                        </>
                    )}
                </div>
            </div>
        </GlassModal>
    );
};

export default ViewReportModal;
