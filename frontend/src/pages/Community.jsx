import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiHash, FiChevronDown, FiMessageCircle, FiPlus, FiSearch } from 'react-icons/fi';
import communityService from '../services/communityService';
import CommunityPostCard from '../components/Community/CommunityPostCard';
import CreatePostModal from '../components/Community/CreatePostModal';
import CommunityPostDetailModal from '../components/Community/CommunityPostDetailModal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ModernBackground from '../components/shared/ModernBackground';
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
    const [searchQuery, setSearchQuery] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

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

    const handleEditPost = (post) => {
        setEditingPost(post);
        setShowCreateModal(true);
        setShowDetailModal(false);
    };

    const handleDeletePost = async (post) => {
        if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            try {
                await communityService.deletePost(post._id);
                setPosts(posts.filter(p => p._id !== post._id));
                setShowDetailModal(false);
                setSelectedPost(null);
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post. Please try again.');
            }
        }
    };

    const handleReportPost = async (post) => {
        if (window.confirm('Report this post for violating community guidelines?')) {
            try {
                await communityService.reportPost(post._id, 'Inappropriate content');
                alert('Post reported. Our team will review it.');
            } catch (error) {
                console.error('Error reporting:', error);
                alert('Failed to report post. Please try again.');
            }
        }
    };

    const handlePostUpdated = (updatedPost) => {
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
        setEditingPost(null);
    };

    const handleModalClose = () => {
        setShowCreateModal(false);
        setEditingPost(null);
    };

    const getActiveChannelData = () => channels.find(c => c.id === activeChannel) || channels[0];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header with Orange Gradient - same as Roommates page */}
            <div className="relative overflow-hidden">
                {/* Orange Gradient Background */}
                <div className="absolute inset-0">
                    <ModernBackground />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title & Subtitle */}
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-4 tracking-tight">
                            Community
                        </h1>
                        <p className="text-white/80 text-sm sm:text-lg max-w-2xl mx-auto">
                            Connect with fellow students. Share tips, find subleases, and build your network.
                        </p>
                    </div>

                    {/* Channel Pills */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-2 p-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20 overflow-x-auto max-w-full">
                            {channels.slice(0, 5).map(channel => {
                                const Icon = channel.icon;
                                const isActive = activeChannel === channel.id;
                                return (
                                    <button
                                        key={channel.id}
                                        onClick={() => setActiveChannel(channel.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm whitespace-nowrap ${isActive
                                            ? 'bg-white text-orange-600 shadow-lg font-bold'
                                            : 'text-white hover:bg-white/10 font-bold'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        <span className="hidden sm:inline">{channel.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search Bar & Create Button */}
                    <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                        <div className="relative flex-1">
                            <div className="relative flex items-center bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
                                <div className="flex items-center pl-4 sm:pl-5 pr-2 sm:pr-3">
                                    <FiSearch className="text-gray-400" size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search discussions..."
                                    className="flex-1 py-3 sm:py-4 px-2 text-gray-900 placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-white text-gray-900 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5 text-sm sm:text-base whitespace-nowrap"
                        >
                            <FiPlus size={16} />
                            <span>Create Post</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                    <div className="flex gap-6">

                        {/* CENTER - Feed */}
                        <div className="flex-1 min-w-0">

                            {/* Filter Bar */}
                            <div className="rounded-2xl p-3 mb-4 flex items-center justify-between gap-4 bg-white border border-gray-100">
                                {/* Filter Chips */}
                                <div className="flex items-center gap-2 overflow-x-auto">
                                    {filterOptions.map(filter => {
                                        const isActive = activeFilter === filter.id;
                                        return (
                                            <button
                                                key={filter.id}
                                                onClick={() => setActiveFilter(filter.id)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                                                    }`}
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
                                        className="appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer bg-gray-50 text-gray-700 border border-gray-200"
                                    >
                                        {sortOptions.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <FiChevronDown
                                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                                        size={14}
                                    />
                                </div>
                            </div>

                            {/* Posts List */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <LoadingSpinner />
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-16 rounded-2xl bg-white border border-gray-100">
                                    <FiMessageCircle size={40} className="mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-bold mb-2 text-gray-900">No posts yet</h3>
                                    <p className="text-sm mb-6 text-gray-500">Be the first to start the conversation!</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-6 py-3 rounded-xl text-white font-bold text-sm bg-orange-600 hover:bg-orange-700 transition-all"
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
                                            onEdit={handleEditPost}
                                            onDelete={handleDeletePost}
                                            onReport={handleReportPost}
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
                                            className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${pagination.page === page
                                                ? 'bg-orange-600 text-white'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                                                }`}
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
                                <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-orange-500 to-red-600">
                                    <h3 className="font-bold text-lg mb-2">Share with the community</h3>
                                    <p className="text-sm opacity-90 mb-4">
                                        Looking for a sublease? Selling furniture? Post it here!
                                    </p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 bg-white text-orange-600"
                                    >
                                        Create Post
                                    </button>
                                </div>

                                {/* Guidelines Card */}
                                <div className="rounded-2xl overflow-hidden bg-white border border-gray-100">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-900">
                                        <span className="text-white font-bold text-sm">Community Guidelines</span>
                                    </div>
                                    <ul className="p-4 space-y-3 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-green-100 text-green-600">✓</span>
                                            <span className="text-gray-700">Be respectful and helpful</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-green-100 text-green-600">✓</span>
                                            <span className="text-gray-700">Provide clear details</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-green-100 text-green-600">✓</span>
                                            <span className="text-gray-700">Report suspicious content</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-red-100 text-red-600">✗</span>
                                            <span className="text-gray-700">No spam or duplicates</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreatePostModal
                isOpen={showCreateModal}
                onClose={handleModalClose}
                onCreated={handlePostCreated}
                onUpdated={handlePostUpdated}
                editPost={editingPost}
            />

            <CommunityPostDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                post={selectedPost}
                onMessage={handleMessage}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
            />
        </div>
    );
};

export default Community;
