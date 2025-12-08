import React from 'react';
import { FiMessageCircle, FiExternalLink, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const intentStyles = {
    'looking-for': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Looking For' },
    'offering': { bg: 'bg-green-100', text: 'text-green-700', label: 'Offering' },
    'selling': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Selling' },
    'announcement': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Announcement' },
};

const channelStyles = {
    'housing': { bg: 'bg-orange-50', border: 'border-orange-200' },
    'subleases': { bg: 'bg-teal-50', border: 'border-teal-200' },
    'roommates': { bg: 'bg-blue-50', border: 'border-blue-200' },
    'furniture': { bg: 'bg-purple-50', border: 'border-purple-200' },
    'study-groups': { bg: 'bg-green-50', border: 'border-green-200' },
    'misc': { bg: 'bg-gray-50', border: 'border-gray-200' },
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
    const intentStyle = intentStyles[post.intent] || intentStyles['announcement'];
    const channelStyle = channelStyles[post.channel] || channelStyles['misc'];

    return (
        <div
            className={`bg-white rounded-2xl border ${channelStyle.border} shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden`}
            onClick={() => onViewDetails(post)}
        >
            {/* Header with Image or Gradient */}
            {post.images && post.images.length > 0 ? (
                <div className="h-40 overflow-hidden">
                    <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className={`h-20 ${channelStyle.bg}`} />
            )}

            <div className="p-4">
                {/* Intent Badge */}
                <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${intentStyle.bg} ${intentStyle.text}`}>
                        {intentStyle.label}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FiClock size={12} />
                        {formatTimeAgo(post.createdAt)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.description}</p>

                {/* Price / Budget */}
                {(post.price || post.budgetMin || post.budgetMax) && (
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-900 mb-3">
                        <FiDollarSign size={14} className="text-green-500" />
                        {post.price ? (
                            <span>${post.price}</span>
                        ) : (
                            <span>${post.budgetMin || 0} - ${post.budgetMax || '∞'}</span>
                        )}
                    </div>
                )}

                {/* Location */}
                {post.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <FiMapPin size={12} />
                        <span>{post.location}</span>
                    </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer: Author + Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden">
                            {post.author?.profilePhoto ? (
                                <img src={post.author.profilePhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-orange-600 font-bold text-xs">
                                    {post.author?.firstName?.charAt(0) || '?'}
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {post.author?.firstName} {post.author?.lastName?.charAt(0)}.
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Comment count */}
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FiMessageCircle size={14} />
                            {post.commentCount || 0}
                        </span>

                        {/* Linked Listing/Group */}
                        {post.linkedListing && (
                            <Link
                                to={`/listings/${post.linkedListing._id}`}
                                onClick={e => e.stopPropagation()}
                                className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-orange-200 transition-colors"
                            >
                                <FiExternalLink size={12} />
                                View Listing
                            </Link>
                        )}
                        {post.linkedGroup && (
                            <Link
                                to={`/roommates`}
                                onClick={e => e.stopPropagation()}
                                className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-blue-200 transition-colors"
                            >
                                <FiExternalLink size={12} />
                                View Group
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPostCard;
