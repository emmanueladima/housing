import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiSliders, FiMessageCircle, FiTrendingUp, FiClock, FiDollarSign, FiX } from 'react-icons/fi';
import communityService from '../services/communityService';
import ChannelSidebar from '../components/Community/ChannelSidebar';
import CommunityPostCard from '../components/Community/CommunityPostCard';
import CreatePostModal from '../components/Community/CreatePostModal';
import CommunityPostDetailModal from '../components/Community/CommunityPostDetailModal';
import ModernBackground from '../components/shared/ModernBackground';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const Community = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChannel, setActiveChannel] = useState('');
    const [activeIntent, setActiveIntent] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchPosts();
    }, [activeChannel, activeIntent, sortBy]);

    const fetchPosts = async (page = 1) => {
        setLoading(true);
        try {
            const filters = {
                page,
                limit: 20,
                sort: sortBy,
            };
            if (activeChannel) filters.channel = activeChannel;
            if (activeIntent) filters.intent = activeIntent;
            if (priceRange.min) filters.minPrice = priceRange.min;
            if (priceRange.max) filters.maxPrice = priceRange.max;
            if (searchQuery) filters.search = searchQuery;

            const data = await communityService.getPosts(filters);
            setPosts(data.posts || []);
            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts(1);
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

    const intentOptions = [
        { id: '', label: 'All Intents' },
        { id: 'looking-for', label: 'Looking For' },
        { id: 'offering', label: 'Offering' },
        { id: 'selling', label: 'Selling' },
        { id: 'announcement', label: 'Announcement' },
    ];

    const sortOptions = [
        { id: 'newest', label: 'Newest', icon: FiClock },
        { id: 'most-active', label: 'Most Active', icon: FiTrendingUp },
        { id: 'price-low', label: 'Price: Low to High', icon: FiDollarSign },
        { id: 'price-high', label: 'Price: High to Low', icon: FiDollarSign },
    ];

    return (
        <div className="min-h-screen relative">
            <ModernBackground />

            {/* Fixed Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Community</h1>
                            <p className="text-sm text-gray-500">Connect with fellow students</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <FiPlus size={18} />
                            Create Post
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Left Sidebar - Channels */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-28">
                            <ChannelSidebar
                                activeChannel={activeChannel}
                                onChannelChange={setActiveChannel}
                            />
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="flex-1 min-w-0">
                        {/* Search & Filters Bar */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search posts..."
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-4 py-3 rounded-xl border-2 transition-all ${showFilters ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >
                                    <FiSliders size={18} />
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    Search
                                </button>
                            </form>

                            {/* Expanded Filters */}
                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Intent</label>
                                        <select
                                            value={activeIntent}
                                            onChange={e => setActiveIntent(e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                        >
                                            {intentOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                        >
                                            {sortOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Price Range</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={priceRange.min}
                                                onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                                                placeholder="Min"
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                            />
                                            <input
                                                type="number"
                                                value={priceRange.max}
                                                onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                                                placeholder="Max"
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Sort Pills (Mobile/Tablet) */}
                            <div className="flex gap-2 overflow-x-auto lg:hidden mt-4 pb-1">
                                {sortOptions.map(opt => {
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSortBy(opt.id)}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${sortBy === opt.id
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Icon size={14} />
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(activeChannel || activeIntent) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {activeChannel && (
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                        Channel: {activeChannel}
                                        <button onClick={() => setActiveChannel('')} className="hover:text-orange-900">
                                            <FiX size={14} />
                                        </button>
                                    </span>
                                )}
                                {activeIntent && (
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        Intent: {activeIntent}
                                        <button onClick={() => setActiveIntent('')} className="hover:text-blue-900">
                                            <FiX size={14} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Posts Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <LoadingSpinner />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                                <FiMessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                                <p className="text-gray-500 mb-6">Be the first to start the conversation!</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                                >
                                    Create the First Post
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {posts.map(post => (
                                    <CommunityPostCard
                                        key={post._id}
                                        post={post}
                                        onViewDetails={handleViewDetails}
                                        onMessage={handleMessage}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => fetchPosts(page)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${pagination.page === page
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - CTA & Tips */}
                    <div className="hidden xl:block w-72 shrink-0">
                        <div className="sticky top-28 space-y-4">
                            {/* Create CTA */}
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white">
                                <h3 className="text-xl font-bold mb-2">Share with the Community</h3>
                                <p className="text-orange-100 text-sm mb-4">
                                    Looking for a sublease? Selling furniture? Find study buddies? Post it here!
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors"
                                >
                                    Create Post
                                </button>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Community Guidelines</h3>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Be respectful and helpful
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Provide clear details in posts
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Report suspicious content
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500">✗</span>
                                        No spam or duplicate posts
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
