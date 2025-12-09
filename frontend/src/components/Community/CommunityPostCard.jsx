import React, { useState } from 'react';
import { FiMessageCircle, FiMoreHorizontal, FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiHash, FiEdit2, FiTrash2, FiFlag } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

// Brand colors
const BRAND = {
    orange: '#DB4A2B',
    navy: '#1E293B',
    beige: '#F5EBE0',
};

// Channel icons mapping
const channelIcons = {
    'housing': FiHome,
    'subleases': FiKey,
    'roommates': FiUsers,
    'furniture': FiShoppingBag,
    'study-groups': FiBook,
    'misc': FiHash,
};

// Channel labels
const channelLabels = {
    'housing': 'Housing',
    'subleases': 'Subleases',
    'roommates': 'Roommates',
    'furniture': 'Furniture',
    'study-groups': 'Study Groups',
    'misc': 'Misc',
};

// Intent styles
const intentStyles = {
    'looking-for': { bg: '#DBEAFE', color: '#1D4ED8', label: 'Looking for' },
    'offering': { bg: '#D1FAE5', color: '#059669', label: 'Offering' },
    'selling': { bg: '#FEF3C7', color: '#D97706', label: 'Selling' },
    'announcement': { bg: '#EDE9FE', color: '#7C3AED', label: 'Announcement' },
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

const CommunityPostCard = ({ post, onViewDetails, onMessage, onEdit, onDelete, onReport, channelColor = '#6B7280' }) => {
    const { user } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const intentStyle = intentStyles[post.intent] || { bg: '#F3F4F6', color: '#6B7280', label: 'Post' };
    const ChannelIcon = channelIcons[post.channel] || FiHash;
    const channelLabel = channelLabels[post.channel] || 'Community';

    const handleMessageClick = (e) => {
        e.stopPropagation();
        const authorId = post.author?._id || post.author?.id;
        if (authorId) {
            onMessage(authorId);
        }
    };

    const userId = user?._id || user?.id;
    const authorId = post.author?._id || post.author?.id;
    const canMessage = user && authorId && authorId !== userId;
    const isOwner = user && authorId && authorId === userId;

    return (
        <div
            onClick={() => onViewDetails(post)}
            className="relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md group"
            style={{
                backgroundColor: 'white',
                border: '1px solid rgba(0,0,0,0.04)',
            }}
        >
            {/* Left Color Strip */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: channelColor }}
            />

            <div className="pl-4 pr-4 py-4">

                {/* Row 1: Meta - Avatar, Name, Time, Channel */}
                <div className="flex items-center gap-3 mb-3">
                    {/* Avatar */}
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: BRAND.orange }}
                    >
                        {post.author?.profilePhoto ? (
                            <img src={post.author.profilePhoto} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="text-white font-bold text-xs">
                                {post.author?.firstName?.charAt(0) || '?'}
                            </span>
                        )}
                    </div>

                    {/* Name + Time */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium text-sm" style={{ color: BRAND.navy }}>
                            {post.author?.firstName} {post.author?.lastName?.charAt(0)}.
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</span>
                    </div>

                    {/* Channel Pill */}
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                        style={{ backgroundColor: channelColor, color: 'white' }}
                    >
                        <ChannelIcon size={12} />
                        <span>{channelLabel}</span>
                    </div>
                </div>

                {/* Row 2: Title + Intent Tag */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3
                        className="font-bold text-base leading-snug line-clamp-2 group-hover:underline"
                        style={{ color: BRAND.navy }}
                    >
                        {post.title}
                    </h3>
                    <span
                        className="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{ backgroundColor: intentStyle.bg, color: intentStyle.color }}
                    >
                        {intentStyle.label}
                    </span>
                </div>

                {/* Row 3: Body Snippet */}
                <p
                    className="text-sm leading-relaxed line-clamp-2 mb-3"
                    style={{ color: `${BRAND.navy}CC` }}
                >
                    {post.description}
                </p>

                {/* Row 4: Price + Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {/* Price */}
                    {(post.price || post.budgetMin || post.budgetMax) && (
                        <span
                            className="px-2.5 py-1 rounded-md text-xs font-bold"
                            style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                        >
                            {post.price ? `$${post.price}` : `$${post.budgetMin || 0} – $${post.budgetMax || '∞'}`}
                        </span>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.slice(0, 3).map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 rounded-md text-xs"
                            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Row 5: Actions */}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
                    {/* Left: Reply */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails(post); }}
                        className="flex items-center gap-1.5 text-sm transition-colors hover:underline"
                        style={{ color: '#6B7280' }}
                    >
                        <FiMessageCircle size={14} />
                        <span>Reply</span>
                        {(post.commentCount || 0) > 0 && (
                            <span className="text-gray-400">({post.commentCount})</span>
                        )}
                    </button>

                    {/* Right: More Menu */}
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#9CA3AF' }}
                        >
                            <FiMoreHorizontal size={16} />
                        </button>

                        {showMenu && (
                            <div
                                className="absolute right-0 bottom-full mb-1 w-36 rounded-lg shadow-lg overflow-hidden z-10"
                                style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                            >
                                {isOwner ? (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit && onEdit(post); }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                            style={{ color: BRAND.navy }}
                                        >
                                            <FiEdit2 size={14} />
                                            Edit Post
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete && onDelete(post); }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                        >
                                            <FiTrash2 size={14} />
                                            Delete Post
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {canMessage && (
                                            <button
                                                onClick={handleMessageClick}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                                style={{ color: BRAND.navy }}
                                            >
                                                Message
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowMenu(false); onReport && onReport(post); }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                        >
                                            <FiFlag size={14} />
                                            Report
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPostCard;
