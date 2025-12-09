import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiHash, FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import communityService from '../services/communityService';
import CommunityPostCard from '../components/Community/CommunityPostCard';
import CreatePostModal from '../components/Community/CreatePostModal';
import CommunityPostDetailModal from '../components/Community/CommunityPostDetailModal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

// Brand colors
const BRAND = {
    orange: '#DB4A2B',
    beige: '#F5EBE0',
    beigeLight: '#FAF8F5',
    navy: '#1E293B',
    sage: '#6B9080',
};

// Channel configuration with colors
const channels = [
    { id: '', label: 'All Channels', icon: FiHash, color: '#6B7280' },
    { id: 'housing', label: 'Housing', icon: FiHome, color: '#DB4A2B' },
    { id: 'subleases', label: 'Subleases', icon: FiKey, color: '#10B981' },
    { id: 'roommates', label: 'Roommates', icon: FiUsers, color: '#3B82F6' },
    { id: 'furniture', label: 'Furniture', icon: FiShoppingBag, color: '#8B5CF6' },
    { id: 'study-groups', label: 'Study Groups', icon: FiBook, color: '#6B9080' },
    { id: 'misc', label: 'Misc', icon: FiHash, color: '#6B7280' },
];

// Intent/filter options
const filterOptions = [
    { id: '', label: 'All' },
    { id: 'looking-for', label: 'Looking for' },
    { id: 'offering', label: 'Offering' },
    { id: 'selling', label: 'Selling' },
    { id: 'announcement', label: 'Announcement' },
];

const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'most-active', label: 'Top' },
];

const Community = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChannel, setActiveChannel] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchPosts();
    }, [activeChannel, activeFilter, sortBy]);

    const fetchPosts = async (page = 1) => {
        setLoading(true);
        try {
            const filters = { page, limit: 20, sort: sortBy };
            if (activeChannel) filters.channel = activeChannel;
            if (activeFilter) filters.intent = activeFilter;

            const data = await communityService.getPosts(filters);
            setPosts(data.posts || []);
            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (post) => {
        setSelectedPost(post);
        setShowDetailModal(true);
    };

    const handleMessage = (userId) => {
        navigate(`/messages?user=${userId}`);
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const getActiveChannelData = () => channels.find(c => c.id === activeChannel) || channels[0];

    return (
        <div className="min-h-screen" style={{ backgroundColor: BRAND.beigeLight }}>
            {/* Minimal Header Bar */}
            <div className="border-b" style={{ borderColor: '#E4E2DD', backgroundColor: '#fff' }}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-2xl font-black" style={{ color: BRAND.navy }}>Community</h1>
                </div>
            </div>

            {/* 3-Column Layout */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex gap-6">

                    {/* LEFT SIDEBAR - Channels (Discord-style) */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-24">
                            <div
                                className="rounded-2xl shadow-sm overflow-hidden"
                                style={{ backgroundColor: BRAND.beige }}
                            >
                                <div className="px-4 py-3 border-b" style={{ borderColor: '#E4E2DD' }}>
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND.navy }}>
                                        Channels
                                    </span>
                                </div>
                                <div className="p-2 space-y-1">
                                    {channels.map(channel => {
                                        const Icon = channel.icon;
                                        const isActive = activeChannel === channel.id;

                                        return (
                                            <button
                                                key={channel.id}
                                                onClick={() => setActiveChannel(channel.id)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-sm"
                                                style={{
                                                    backgroundColor: isActive ? BRAND.orange : 'white',
                                                    color: isActive ? 'white' : BRAND.navy,
                                                    border: isActive ? 'none' : '1px solid #E4E2DD',
                                                }}
                                            >
                                                <Icon size={16} />
                                                <span>{channel.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER - Feed */}
                    <div className="flex-1 min-w-0">

                        {/* Composer Card */}
                        <div
                            className="rounded-2xl p-4 mb-4 flex items-center gap-4"
                            style={{ backgroundColor: 'white', border: '1px solid #E4E2DD' }}
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: BRAND.orange }}
                            >
                                <span className="text-white font-bold text-sm">
                                    {user?.firstName?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex-1 text-left px-4 py-2.5 rounded-xl text-sm"
                                style={{ backgroundColor: BRAND.beigeLight, color: '#9CA3AF' }}
                            >
                                Share something with the community...
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                                style={{ backgroundColor: BRAND.orange }}
                            >
                                Create post
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div
                            className="rounded-2xl p-3 mb-4 flex items-center justify-between gap-4"
                            style={{ backgroundColor: 'white', border: '1px solid #E4E2DD' }}
                        >
                            {/* Filter Chips */}
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {filterOptions.map(filter => {
                                    const isActive = activeFilter === filter.id;
                                    return (
                                        <button
                                            key={filter.id}
                                            onClick={() => setActiveFilter(filter.id)}
                                            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                                            style={{
                                                backgroundColor: isActive ? BRAND.orange : 'white',
                                                color: isActive ? 'white' : BRAND.navy,
                                                border: isActive ? 'none' : '1px solid #E4E2DD',
                                            }}
                                        >
                                            {filter.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative shrink-0">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer"
                                    style={{
                                        backgroundColor: BRAND.beigeLight,
                                        color: BRAND.navy,
                                        border: '1px solid #E4E2DD'
                                    }}
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                                <FiChevronDown
                                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                                    size={14}
                                    style={{ color: BRAND.navy }}
                                />
                            </div>
                        </div>

                        {/* Posts List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <LoadingSpinner />
                            </div>
                        ) : posts.length === 0 ? (
                            <div
                                className="text-center py-16 rounded-2xl"
                                style={{ backgroundColor: 'white', border: '1px solid #E4E2DD' }}
                            >
                                <FiMessageCircle size={40} className="mx-auto mb-4" style={{ color: '#D1D5DB' }} />
                                <h3 className="text-lg font-bold mb-2" style={{ color: BRAND.navy }}>No posts yet</h3>
                                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Be the first to start the conversation!</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 rounded-xl text-white font-bold text-sm"
                                    style={{ backgroundColor: BRAND.orange }}
                                >
                                    Create Post
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {posts.map(post => (
                                    <CommunityPostCard
                                        key={post._id}
                                        post={post}
                                        onViewDetails={handleViewDetails}
                                        onMessage={handleMessage}
                                        channelColor={channels.find(c => c.id === post.channel)?.color || '#6B7280'}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => fetchPosts(page)}
                                        className="w-9 h-9 rounded-lg font-bold text-sm transition-all"
                                        style={{
                                            backgroundColor: pagination.page === page ? BRAND.orange : 'white',
                                            color: pagination.page === page ? 'white' : BRAND.navy,
                                            border: pagination.page === page ? 'none' : '1px solid #E4E2DD'
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="hidden xl:block w-72 shrink-0">
                        <div className="sticky top-24 space-y-4">

                            {/* CTA Card */}
                            <div
                                className="rounded-2xl p-5 text-white"
                                style={{ backgroundColor: BRAND.orange }}
                            >
                                <h3 className="font-bold text-lg mb-2">Share with the community</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Looking for a sublease? Selling furniture? Post it here!
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                                    style={{ backgroundColor: 'white', color: BRAND.orange }}
                                >
                                    Create Post
                                </button>
                            </div>

                            {/* Guidelines Card */}
                            <div
                                className="rounded-2xl overflow-hidden"
                                style={{ backgroundColor: 'white', border: '1px solid #E4E2DD' }}
                            >
                                <div className="px-4 py-3 border-b" style={{ borderColor: '#E4E2DD', backgroundColor: BRAND.navy }}>
                                    <span className="text-white font-bold text-sm">Community Guidelines</span>
                                </div>
                                <ul className="p-4 space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>✓</span>
                                        <span style={{ color: BRAND.navy }}>Be respectful and helpful</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>✓</span>
                                        <span style={{ color: BRAND.navy }}>Provide clear details</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>✓</span>
                                        <span style={{ color: BRAND.navy }}>Report suspicious content</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>✗</span>
                                        <span style={{ color: BRAND.navy }}>No spam or duplicates</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreatePostModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={handlePostCreated}
            />

            <CommunityPostDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                post={selectedPost}
                onMessage={handleMessage}
            />
        </div>
    );
};

export default Community;
