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
            isPressable
            onPress={() => onViewDetails(post)}
            padding="none"
            allowOverflow={true}
            className="group w-full transition-all duration-300 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-md hover:bg-white/70"
        >
            <CardBody className="p-6">
                {/* Header: Avatar, Author, Time, Intent */}
                <div className="flex items-center gap-3 mb-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white">
                        {post.author?.profilePhoto ? (
                            <img src={post.author.profilePhoto} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="text-white font-bold text-sm">
                                {post.author?.firstName?.charAt(0) || '?'}
                            </span>
                        )}
                    </div>

                    {/* Author Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                                {post.author?.firstName} {post.author?.lastName?.charAt(0)}.
                            </span>
                            <span className="text-gray-400 text-xs">·</span>
                            <span className="text-gray-400 text-xs">{formatTimeAgo(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <ChannelIcon size={12} style={{ color: channelColor }} />
                            <span>{channelLabel}</span>
                        </div>
                    </div>

                    {/* Intent Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${intentStyle.bg} ${intentStyle.text}`}>
                        {intentStyle.label}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {post.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                    {post.description}
                </p>

                {/* Price & Tags Row */}
                {(post.price || post.budgetMin || post.budgetMax || (post.tags && post.tags.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {/* Price */}
                        {(post.price || post.budgetMin || post.budgetMax) && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 backdrop-blur-sm border border-green-200">
                                {post.price ? `$${post.price}` : `$${post.budgetMin || 0} – $${post.budgetMax || '∞'}`}
                            </span>
                        )}

                        {/* Tags */}
                        {post.tags && post.tags.slice(0, 2).map((tag, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 rounded-full text-xs bg-white/50 text-gray-600 backdrop-blur-sm border border-white/40 font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </CardBody>

            {/* Footer Actions */}
            <CardFooter className="px-5 py-3 flex items-center justify-between rounded-b-3xl">
                {/* Left: Comments */}
                <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(post); }}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors text-sm font-medium"
                >
                    <FiMessageCircle size={16} />
                    <span>{post.commentCount || 0} {post.commentCount === 1 ? 'reply' : 'replies'}</span>
                </button>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Message Button */}
                    {canMessage && (
                        <button
                            onClick={handleMessageClick}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-colors shadow-sm"
                        >
                            <FiSend size={12} />
                            Message
                        </button>
                    )}

                    {/* More Menu */}
                    <div className="relative">
                        <button
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
                            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
                        >
                            <FiMoreHorizontal size={16} />
                        </button>

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
