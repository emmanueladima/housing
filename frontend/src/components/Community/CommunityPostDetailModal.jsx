import React, { useState, useEffect } from 'react';
import { FiX, FiMessageCircle, FiSend, FiFlag, FiExternalLink, FiMapPin, FiClock, FiDollarSign, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import communityService from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';

const intentStyles = {
    'looking-for': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Looking For' },
    'offering': { bg: 'bg-green-100', text: 'text-green-700', label: 'Offering' },
    'selling': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Selling' },
    'announcement': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Announcement' },
};

const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const CommunityPostDetailModal = ({ isOpen, onClose, post, onMessage }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (isOpen && post) {
            fetchComments();
        }
    }, [isOpen, post]);

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const data = await communityService.getComments(post._id);
            setComments(data.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || newComment.length < 2) return;

        setSubmitting(true);
        try {
            const comment = await communityService.addComment(post._id, newComment);
            setComments([...comments, comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReport = async () => {
        if (window.confirm('Report this post for violating community guidelines?')) {
            try {
                await communityService.reportPost(post._id, 'Inappropriate content');
                alert('Post reported. Our team will review it.');
            } catch (error) {
                console.error('Error reporting:', error);
            }
        }
    };

    if (!isOpen || !post) return null;

    const intentStyle = intentStyles[post.intent] || intentStyles['announcement'];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${intentStyle.bg} ${intentStyle.text}`}>
                            {intentStyle.label}
                        </span>
                        <span className="text-sm text-gray-400">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReport}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Report post"
                        >
                            <FiFlag size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Images Carousel */}
                    {post.images && post.images.length > 0 && (
                        <div className="relative h-64 bg-gray-100">
                            <img
                                src={post.images[currentImageIndex]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            {post.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(i => (i > 0 ? i - 1 : post.images.length - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                                    >
                                        <FiChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex(i => (i < post.images.length - 1 ? i + 1 : 0))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                                    >
                                        <FiChevronRight size={20} />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                        {post.images.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="p-6">
                        {/* Title & Description */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h2>
                        <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.description}</p>

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                            {(post.price || post.budgetMin || post.budgetMax) && (
                                <div className="flex items-center gap-1 font-bold text-gray-900">
                                    <FiDollarSign size={14} className="text-green-500" />
                                    {post.price ? (
                                        <span>${post.price}</span>
                                    ) : (
                                        <span>${post.budgetMin || 0} - ${post.budgetMax || '∞'}</span>
                                    )}
                                </div>
                            )}
                            {post.location && (
                                <div className="flex items-center gap-1 text-gray-600">
                                    <FiMapPin size={14} />
                                    <span>{post.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Linked Listing/Group */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {post.linkedListing && (
                                <Link
                                    to={`/listings/${post.linkedListing._id}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-bold hover:bg-orange-200 transition-colors"
                                >
                                    <FiExternalLink size={16} />
                                    View Linked Listing
                                </Link>
                            )}
                            {post.linkedGroup && (
                                <Link
                                    to="/roommates"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-colors"
                                >
                                    <FiExternalLink size={16} />
                                    View Linked Group
                                </Link>
                            )}
                        </div>

                        {/* Author Card */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl mb-6 border border-orange-100">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden shadow-md">
                                    {post.author?.profilePhoto ? (
                                        <img src={post.author.profilePhoto} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-bold text-xl">
                                            {post.author?.firstName?.charAt(0) || '?'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {post.author?.firstName} {post.author?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{post.author?.school || 'Student'}</p>
                                </div>
                            </div>
                            {user && post.author?._id !== user._id && (
                                <button
                                    onClick={() => onMessage(post.author._id)}
                                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <FiMessageCircle size={18} />
                                    Message
                                </button>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiMessageCircle size={18} />
                                Comments ({comments.length})
                            </h3>

                            {/* Comment Form */}
                            {user && (
                                <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || newComment.length < 2}
                                        className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                                    >
                                        <FiSend size={18} />
                                    </button>
                                </form>
                            )}

                            {/* Comments List */}
                            {loadingComments ? (
                                <p className="text-gray-500 text-center py-4">Loading comments...</p>
                            ) : comments.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">No comments yet. Be the first!</p>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map(comment => (
                                        <div key={comment._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden shrink-0">
                                                {comment.author?.profilePhoto ? (
                                                    <img src={comment.author.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-orange-600 font-bold text-xs">
                                                        {comment.author?.firstName?.charAt(0) || '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900 text-sm">
                                                        {comment.author?.firstName} {comment.author?.lastName?.charAt(0)}.
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatTimeAgo(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPostDetailModal;
