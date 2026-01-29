import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiMessageCircle, FiMoreHorizontal, FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiHash, FiEdit2, FiTrash2, FiFlag, FiHeart, FiSend } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { CardBody, CardFooter } from '@heroui/card';
import GlassCard from '../shared/GlassCard';

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

// Intent styles - softer colors
// Intent styles - translucent colors
const intentStyles = {
    'looking-for': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Looking for' },
    'offering': { bg: 'bg-green-100', text: 'text-green-700', label: 'Offering' },
    'selling': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Selling' },
    'announcement': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Announcement' },
};

const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
};

const CommunityPostCard = ({ post, onViewDetails, onMessage, onEdit, onDelete, onReport, channelColor = '#6B7280' }) => {
    const { user } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const menuButtonRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const intentStyle = intentStyles[post.intent] || { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Post' };
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
        <GlassCard
            padding="none"
            allowOverflow={true}
            className="group w-full transition-all duration-300 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-md hover:bg-white/70 cursor-pointer"
        >
            <CardBody className="p-4" onClick={() => onViewDetails(post)}>
                {/* Header Row: Avatar, Author, Time, Channel, Intent */}
                <div className="flex items-center gap-2.5 mb-2">
                    {/* Avatar - smaller */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                        {post.author?.profilePhoto ? (
                            <img src={post.author.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-xs">
                                {post.author?.firstName?.charAt(0) || '?'}
                            </span>
                        )}
                    </div>

                    {/* Author & Channel */}
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-gray-900 truncate">
                            {post.author?.firstName} {post.author?.lastName?.charAt(0)}.
                        </span>
                        <span className="text-gray-400">·</span>
                        <ChannelIcon size={11} style={{ color: channelColor }} className="shrink-0" />
                        <span className="text-gray-500 truncate">{channelLabel}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-400 shrink-0">{formatTimeAgo(post.createdAt)}</span>
                    </div>

                    {/* Intent Badge - smaller */}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${intentStyle.bg} ${intentStyle.text}`}>
                        {intentStyle.label}
                    </span>
                </div>

                {/* Title - single line */}
                <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {post.title}
                </h3>

                {/* Description - single line */}
                <p className="text-gray-600 text-sm leading-snug line-clamp-1 mb-2">
                    {post.description}
                </p>

                {/* Price & Tags Row - inline, compact */}
                {(post.price || post.budgetMin || post.budgetMax || (post.tags && post.tags.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {/* Price */}
                        {(post.price || post.budgetMin || post.budgetMax) && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                                {post.price ? `$${post.price}` : `$${post.budgetMin || 0} – $${post.budgetMax || '∞'}`}
                            </span>
                        )}

                        {/* Tags - only first tag */}
                        {post.tags && post.tags.slice(0, 1).map((tag, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 rounded-full text-[11px] bg-white/50 text-gray-500 font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </CardBody>

            {/* Footer Actions - compact */}
            <CardFooter className="px-4 py-2 flex items-center justify-between rounded-b-3xl relative z-10">
                {/* Left: Comments */}
                <span
                    onClick={(e) => { e.stopPropagation(); onViewDetails(post); }}
                    role="button"
                    tabIndex={0}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-orange-600 transition-colors text-xs font-medium cursor-pointer"
                >
                    <FiMessageCircle size={14} />
                    <span>{post.commentCount || 0} {post.commentCount === 1 ? 'reply' : 'replies'}</span>
                </span>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Message Button */}
                    {canMessage && (
                        <span
                            onClick={handleMessageClick}
                            role="button"
                            tabIndex={0}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-colors shadow-sm cursor-pointer"
                        >
                            <FiSend size={12} />
                            Message
                        </span>
                    )}

                    {/* More Menu */}
                    <div className="relative">
                        <span
                            ref={menuButtonRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!showMenu && menuButtonRef.current) {
                                    const rect = menuButtonRef.current.getBoundingClientRect();
                                    setMenuPosition({
                                        top: rect.bottom + 4,
                                        left: rect.right - 160 // 160 = menu width (w-40)
                                    });
                                }
                                setShowMenu(!showMenu);
                            }}
                            role="button"
                            tabIndex={0}
                            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors cursor-pointer inline-flex"
                        >
                            <FiMoreHorizontal size={16} />
                        </span>

                        {showMenu && createPortal(
                            <>
                                {/* Backdrop to close menu */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                                />
                                <div
                                    className="fixed w-40 rounded-xl shadow-xl bg-white border border-gray-100 overflow-hidden z-50"
                                    style={{ top: menuPosition.top, left: menuPosition.left }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {isOwner ? (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit && onEdit(post); }}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                            >
                                                <FiEdit2 size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete && onDelete(post); }}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                            >
                                                <FiTrash2 size={14} />
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowMenu(false); onReport && onReport(post); }}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                        >
                                            <FiFlag size={14} />
                                            Report
                                        </button>
                                    )}
                                </div>
                            </>,
                            document.body
                        )}
                    </div>
                </div>
            </CardFooter>
        </GlassCard >
    );
};

export default CommunityPostCard;
