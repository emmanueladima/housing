import React, { useState, useEffect } from 'react';
import { FiX, FiMessageCircle, FiSend, FiFlag, FiExternalLink, FiMapPin, FiDollarSign, FiChevronLeft, FiChevronRight, FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiHash, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import communityService from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';

// Brand colors
const BRAND = {
    orange: '#DB4A2B',
    navy: '#1E293B',
    beige: '#F5EBE0',
    beigeLight: '#FAF8F5',
};

// Intent styles
const intentStyles = {
    'looking-for': { bg: '#DBEAFE', color: '#1D4ED8', label: 'Looking for' },
    'offering': { bg: '#D1FAE5', color: '#059669', label: 'Offering' },
    'selling': { bg: '#FEF3C7', color: '#D97706', label: 'Selling' },
    'announcement': { bg: '#EDE9FE', color: '#7C3AED', label: 'Announcement' },
};

// Channel config
const channelConfig = {
    'housing': { icon: FiHome, color: '#DB4A2B', label: 'Housing' },
    'subleases': { icon: FiKey, color: '#10B981', label: 'Subleases' },
    'roommates': { icon: FiUsers, color: '#3B82F6', label: 'Roommates' },
    'furniture': { icon: FiShoppingBag, color: '#8B5CF6', label: 'Furniture' },
    'study-groups': { icon: FiBook, color: '#6B9080', label: 'Study Groups' },
    'misc': { icon: FiHash, color: '#6B7280', label: 'Misc' },
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

const CommunityPostDetailModal = ({ isOpen, onClose, post, onMessage, onEdit, onDelete }) => {
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

    const intentStyle = intentStyles[post.intent] || { bg: '#F3F4F6', color: '#6B7280', label: 'Post' };
    const channel = channelConfig[post.channel] || { icon: FiHash, color: '#6B7280', label: 'Community' };
    const ChannelIcon = channel.icon;

    const userId = user?._id || user?.id;
    const authorId = post.author?._id || post.author?.id;
    const canMessage = user && authorId && authorId !== userId;
    const isOwner = user && authorId && authorId === userId;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl"
                style={{ backgroundColor: 'white' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor: '#E4E2DD' }}
                >
                    <div className="flex items-center gap-3">
                        {/* Channel Pill */}
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: channel.color, color: 'white' }}
                        >
                            <ChannelIcon size={12} />
                            <span>{channel.label}</span>
                        </div>
                        {/* Intent Tag */}
                        <span
                            className="px-2.5 py-1 rounded-md text-xs font-medium"
                            style={{ backgroundColor: intentStyle.bg, color: intentStyle.color }}
                        >
                            {intentStyle.label}
                        </span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner ? (
                            <>
                                <button
                                    onClick={() => { onEdit && onEdit(post); onClose(); }}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                    style={{ color: '#6B7280' }}
                                    title="Edit Post"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                                <button
                                    onClick={() => { onDelete && onDelete(post); }}
                                    className="p-2 rounded-lg transition-colors hover:bg-red-50"
                                    style={{ color: '#EF4444' }}
                                    title="Delete Post"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleReport}
                                className="p-2 rounded-lg transition-colors hover:bg-red-50"
                                style={{ color: '#9CA3AF' }}
                                title="Report Post"
                            >
                                <FiFlag size={16} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                            style={{ color: '#6B7280' }}
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Images Carousel */}
                    {post.images && post.images.length > 0 && (
                        <div className="relative h-56" style={{ backgroundColor: '#F3F4F6' }}>
                            <img
                                src={post.images[currentImageIndex]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            {post.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex(i => (i > 0 ? i - 1 : post.images.length - 1))}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow"
                                    >
                                        <FiChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex(i => (i < post.images.length - 1 ? i + 1 : 0))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow"
                                    >
                                        <FiChevronRight size={18} />
                                    </button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                        {post.images.map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: i === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)' }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="p-5">
                        {/* Title */}
                        <h2 className="text-xl font-bold mb-3" style={{ color: BRAND.navy }}>{post.title}</h2>

                        {/* Description */}
                        <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: `${BRAND.navy}CC` }}>
                            {post.description}
                        </p>

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {(post.price || post.budgetMin || post.budgetMax) && (
                                <span
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold"
                                    style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                                >
                                    <FiDollarSign size={14} />
                                    {post.price ? `$${post.price}` : `$${post.budgetMin || 0} – $${post.budgetMax || '∞'}`}
                                </span>
                            )}
                            {post.location && (
                                <span
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                                >
                                    <FiMapPin size={14} />
                                    {post.location}
                                </span>
                            )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {post.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 rounded-lg text-xs"
                                        style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Linked Resources */}
                        {(post.linkedListing || post.linkedGroup) && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {post.linkedListing && (
                                    <Link
                                        to={`/listings/${post.linkedListing._id}`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                                        style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}
                                    >
                                        <FiExternalLink size={14} />
                                        View Listing
                                    </Link>
                                )}
                                {post.linkedGroup && (
                                    <Link
                                        to="/roommates"
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                                        style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
                                    >
                                        <FiExternalLink size={14} />
                                        View Group
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Author Card */}
                        <div
                            className="flex items-center justify-between p-4 rounded-xl mb-5"
                            style={{ backgroundColor: BRAND.beige }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden"
                                    style={{ backgroundColor: BRAND.orange }}
                                >
                                    {post.author?.profilePhoto ? (
                                        <img src={post.author.profilePhoto} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-bold">
                                            {post.author?.firstName?.charAt(0) || '?'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold" style={{ color: BRAND.navy }}>
                                        {post.author?.firstName} {post.author?.lastName}
                                    </p>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>{post.author?.school || 'Student'}</p>
                                </div>
                            </div>
                            {canMessage && (
                                <button
                                    onClick={() => onMessage(authorId)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                                    style={{ backgroundColor: BRAND.orange }}
                                >
                                    <FiMessageCircle size={16} />
                                    Message
                                </button>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div>
                            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: BRAND.navy }}>
                                <FiMessageCircle size={16} />
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
                                        className="flex-1 p-3 rounded-xl text-sm outline-none transition-all"
                                        style={{
                                            backgroundColor: BRAND.beigeLight,
                                            border: '1px solid #E4E2DD',
                                            color: BRAND.navy
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || newComment.length < 2}
                                        className="px-4 py-3 rounded-xl text-white transition-colors disabled:opacity-50"
                                        style={{ backgroundColor: BRAND.orange }}
                                    >
                                        <FiSend size={16} />
                                    </button>
                                </form>
                            )}

                            {/* Comments List */}
                            {loadingComments ? (
                                <p className="text-center py-4 text-sm text-gray-400">Loading comments...</p>
                            ) : comments.length === 0 ? (
                                <p className="text-center py-4 text-sm text-gray-400">No comments yet. Be the first!</p>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map(comment => (
                                        <div
                                            key={comment._id}
                                            className="flex gap-3 p-3 rounded-xl"
                                            style={{ backgroundColor: BRAND.beigeLight }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: BRAND.orange }}
                                            >
                                                {comment.author?.profilePhoto ? (
                                                    <img src={comment.author.profilePhoto} alt="" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <span className="text-white font-bold text-xs">
                                                        {comment.author?.firstName?.charAt(0) || '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm" style={{ color: BRAND.navy }}>
                                                        {comment.author?.firstName} {comment.author?.lastName?.charAt(0)}.
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatTimeAgo(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-sm" style={{ color: `${BRAND.navy}CC` }}>{comment.content}</p>
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
