import React, { useState, useEffect } from 'react';
import { FiX, FiMessageCircle, FiSend, FiFlag, FiExternalLink, FiMapPin, FiDollarSign, FiChevronLeft, FiChevronRight, FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiHash, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import communityService from '../../services/communityService';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card';

// Channel config
const channelConfig = {
    'housing': { icon: FiHome, color: '#DB4A2B', label: 'Housing' },
    'subleases': { icon: FiKey, color: '#10B981', label: 'Subleases' },
    'roommates': { icon: FiUsers, color: '#3B82F6', label: 'Roommates' },
    'furniture': { icon: FiShoppingBag, color: '#8B5CF6', label: 'Furniture' },
    'study-groups': { icon: FiBook, color: '#6B9080', label: 'Study Groups' },
    'misc': { icon: FiHash, color: '#6B7280', label: 'Misc' },
};

// Intent styles
const intentStyles = {
    'looking-for': { bg: 'bg-blue-50/80', color: 'text-blue-600', label: 'Looking for' },
    'offering': { bg: 'bg-green-50/80', color: 'text-green-600', label: 'Offering' },
    'selling': { bg: 'bg-amber-50/80', color: 'text-amber-600', label: 'Selling' },
    'announcement': { bg: 'bg-purple-50/80', color: 'text-purple-600', label: 'Announcement' },
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

    const intentStyle = intentStyles[post.intent] || { bg: 'bg-gray-50/80', color: 'text-gray-600', label: 'Post' };
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
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <Card isBlurred className="w-full h-full border border-white/20 bg-white/10 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/20">
                        <div className="flex items-center gap-3">
                            {/* Channel Pill */}
                            <div
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-opacity-90"
                                style={{ backgroundColor: channel.color, color: 'white' }}
                            >
                                <ChannelIcon size={12} />
                                <span>{channel.label}</span>
                            </div>
                            {/* Intent Tag */}
                            <span
                                className={`px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm ${intentStyle.bg} ${intentStyle.color}`}
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
                                        className="p-2 rounded-lg transition-colors hover:bg-white/10 text-white hover:text-gray-200"
                                        title="Edit Post"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => { onDelete && onDelete(post); }}
                                        className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-red-300 hover:text-red-200"
                                        title="Delete Post"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleReport}
                                    className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-gray-300 hover:text-red-300"
                                    title="Report Post"
                                >
                                    <FiFlag size={16} />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg transition-colors hover:bg-white/10 text-white hover:text-gray-200"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Images Carousel */}
                        {post.images && post.images.length > 0 && (
                            <div className="relative h-64 bg-black/20">
                                <img
                                    src={post.images[currentImageIndex]}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                                {post.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImageIndex(i => (i > 0 ? i - 1 : post.images.length - 1))}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full backdrop-blur-md"
                                        >
                                            <FiChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex(i => (i < post.images.length - 1 ? i + 1 : 0))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full backdrop-blur-md"
                                        >
                                            <FiChevronRight size={18} />
                                        </button>
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                            {post.images.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="p-6">
                            {/* Title */}
                            <h2 className="text-2xl font-bold mb-3 text-white">{post.title}</h2>

                            {/* Description */}
                            <p className="text-gray-200 leading-relaxed mb-6 whitespace-pre-wrap text-base font-medium">
                                {post.description}
                            </p>

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                {(post.price || post.budgetMin || post.budgetMax) && (
                                    <span
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold bg-green-500/20 text-green-300 border border-green-500/30"
                                    >
                                        <FiDollarSign size={14} />
                                        {post.price ? `$${post.price}` : `$${post.budgetMin || 0} – $${post.budgetMax || '∞'}`}
                                    </span>
                                )}
                                {post.location && (
                                    <span
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white/10 text-gray-200 border border-white/10"
                                    >
                                        <FiMapPin size={14} />
                                        {post.location}
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-gray-300 border border-white/10"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Linked Resources */}
                            {(post.linkedListing || post.linkedGroup) && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.linkedListing && (
                                        <Link
                                            to={`/listings/${post.linkedListing._id}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-amber-50/80 text-amber-700 hover:bg-amber-100 transition-colors"
                                        >
                                            <FiExternalLink size={14} />
                                            View Listing
                                        </Link>
                                    )}
                                    {post.linkedGroup && (
                                        <Link
                                            to="/roommates"
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-50/80 text-blue-700 hover:bg-blue-100 transition-colors"
                                        >
                                            <FiExternalLink size={14} />
                                            View Group
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Author Card */}
                            <div
                                className="flex items-center justify-between p-4 rounded-2xl mb-6 bg-white/10 backdrop-blur-md border border-white/10 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 shadow-sm ring-2 ring-white"
                                    >
                                        {post.author?.profilePhoto ? (
                                            <img src={post.author.profilePhoto} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-lg">
                                                {post.author?.firstName?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg">
                                            {post.author?.firstName} {post.author?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-300 font-medium">{post.author?.school || 'Student'}</p>
                                    </div>
                                </div>
                                {canMessage && (
                                    <button
                                        onClick={() => onMessage(authorId)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-900 font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-white group"
                                    >
                                        <FiMessageCircle size={16} className="group-hover:scale-110 transition-transform" />
                                        Message
                                    </button>
                                )}
                            </div>

                            {/* Comments Section */}
                            <div>
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-white border-t border-white/10 pt-6">
                                    <FiMessageCircle size={18} />
                                    Comments ({comments.length})
                                </h3>

                                {/* Comment Form */}
                                {user && (
                                    <form onSubmit={handleSubmitComment} className="flex gap-3 mb-6">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="flex-1 p-3.5 rounded-xl text-sm outline-none transition-all bg-white/10 text-white placeholder-gray-300 border border-white/10 focus:bg-white/20 focus:border-orange-400/50 shadow-inner"
                                        />
                                        <button
                                            type="submit"
                                            disabled={submitting || newComment.length < 2}
                                            className="px-5 py-3.5 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg bg-orange-600 hover:bg-orange-700 active:scale-95"
                                        >
                                            <FiSend size={18} />
                                        </button>
                                    </form>
                                )}

                                {/* Comments List */}
                                {loadingComments ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-8 bg-white/10 rounded-xl border border-dashed border-white/20">
                                        <p className="text-sm text-gray-200">No comments yet. Be the first to start the conversation!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map(comment => (
                                            <div
                                                key={comment._id}
                                                className="flex gap-4 p-4 rounded-2xl bg-white/90 border border-white/20 shadow-sm"
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gray-100 ring-1 ring-gray-200"
                                                >
                                                    {comment.author?.profilePhoto ? (
                                                        <img src={comment.author.profilePhoto} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-500 font-bold text-sm">
                                                            {comment.author?.firstName?.charAt(0) || '?'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm text-gray-900">
                                                            {comment.author?.firstName} {comment.author?.lastName?.charAt(0)}.
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimeAgo(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CommunityPostDetailModal;
