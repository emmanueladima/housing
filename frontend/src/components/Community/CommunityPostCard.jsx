import React from 'react';
import { FiMessageCircle, FiExternalLink, FiMapPin, FiClock, FiDollarSign, FiMail, FiCornerDownRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const intentStyles = {
    'looking-for': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Looking For' },
    'offering': { bg: 'bg-green-100', text: 'text-green-700', label: 'Offering' },
    'selling': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Selling' },
    'announcement': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Announcement' },
};

const channelLabels = {
    'housing': 'Housing',
    'subleases': 'Subleases',
    'roommates': 'Roommates',
    'furniture': 'Furniture',
    'study-groups': 'Study Groups',
    'misc': 'Misc',
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

const CommunityPostCard = ({ post, onViewDetails, onMessage }) => {
    const { user } = useAuth();
    const intentStyle = intentStyles[post.intent] || intentStyles['announcement'];
    const channelLabel = channelLabels[post.channel] || 'Community';

    const handleMessageClick = (e) => {
        e.stopPropagation();
        if (post.author?._id) {
            onMessage(post.author._id);
        }
    };

    const canMessage = user && post.author?._id && post.author._id !== user._id;

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => onViewDetails(post)}
        >
            <div className="flex gap-4 p-5">
                {/* Left: Author Avatar */}
                <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden shadow-md">
                        {post.author?.profilePhoto ? (
                            <img src={post.author.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-lg">
                                {post.author?.firstName?.charAt(0) || '?'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Middle: Content */}
                <div className="flex-1 min-w-0">
                    {/* Top row: Author + Time */}
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-gray-900">
                            {post.author?.firstName} {post.author?.lastName?.charAt(0)}.
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                            <FiClock size={12} />
                            {formatTimeAgo(post.createdAt)}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{channelLabel}</span>
                    </div>

                    {/* Intent Badge + Title */}
                    <div className="flex items-start gap-2 mb-2">
                        <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${intentStyle.bg} ${intentStyle.text}`}>
                            {intentStyle.label}
                        </span>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-orange-600 transition-colors">
                            {post.title}
                        </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.description}</p>

                    {/* Meta: Price + Location */}
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                        {(post.price || post.budgetMin || post.budgetMax) && (
                            <div className="flex items-center gap-1 font-bold text-green-600">
                                <FiDollarSign size={14} />
                                {post.price ? (
                                    <span>${post.price}</span>
                                ) : (
                                    <span>${post.budgetMin || 0} - ${post.budgetMax || '∞'}</span>
                                )}
                            </div>
                        )}
                        {post.location && (
                            <div className="flex items-center gap-1 text-gray-500">
                                <FiMapPin size={14} />
                                <span>{post.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {post.tags.slice(0, 4).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        {/* Reply/View Button */}
                        <button
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                            onClick={(e) => { e.stopPropagation(); onViewDetails(post); }}
                        >
                            <FiCornerDownRight size={16} />
                            <span>Reply</span>
                            {(post.commentCount || 0) > 0 && (
                                <span className="text-gray-400">({post.commentCount})</span>
                            )}
                        </button>

                        {/* Message Button - Prominent */}
                        {canMessage && (
                            <button
                                onClick={handleMessageClick}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-sm hover:shadow-md"
                            >
                                <FiMail size={14} />
                                Message
                            </button>
                        )}

                        {/* Linked Resources */}
                        {post.linkedListing && (
                            <Link
                                to={`/listings/${post.linkedListing._id}`}
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors"
                            >
                                <FiExternalLink size={12} />
                                Listing
                            </Link>
                        )}
                        {post.linkedGroup && (
                            <Link
                                to={`/roommates`}
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                            >
                                <FiExternalLink size={12} />
                                Group
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right: Image Thumbnail (if exists) */}
                {post.images && post.images.length > 0 && (
                    <div className="hidden sm:block shrink-0">
                        <div className="w-28 h-28 rounded-xl overflow-hidden shadow-sm">
                            <img
                                src={post.images[0]}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPostCard;
