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

    // Channel-specific intents
    const channelIntents = {
        '': [
            { id: '', label: 'All Intents', color: 'gray' },
            { id: 'looking-for', label: 'Looking For', color: 'blue' },
            { id: 'offering', label: 'Offering', color: 'green' },
            { id: 'selling', label: 'Selling', color: 'orange' },
            { id: 'announcement', label: 'Announcement', color: 'purple' },
        ],
        'housing': [
            { id: '', label: 'All', color: 'gray' },
            { id: 'looking-for', label: 'Looking for Place', color: 'blue' },
            { id: 'offering', label: 'Offering Lease', color: 'green' },
            { id: 'announcement', label: 'Announcement', color: 'purple' },
        ],
        'subleases': [
            { id: '', label: 'All', color: 'gray' },
            { id: 'looking-for', label: 'Need Sublease', color: 'blue' },
            { id: 'offering', label: 'Subletting', color: 'green' },
            { id: 'announcement', label: 'Announcement', color: 'purple' },
        ],
        'roommates': [
            { id: '', label: 'All', color: 'gray' },
            { id: 'looking-for', label: 'Need Roommate', color: 'blue' },
            { id: 'offering', label: 'Have Room', color: 'green' },
            { id: 'announcement', label: 'Announcement', color: 'purple' },
        ],
        'furniture': [
            { id: '', label: 'All', color: 'gray' },
            { id: 'selling', label: 'Selling', color: 'orange' },
            { id: 'offering', label: 'Giving Away', color: 'green' },
            { id: 'looking-for', label: 'Looking For', color: 'blue' },
        ],
        'study-groups': [
            { id: '', label: 'All', color: 'gray' },
            { id: 'looking-for', label: 'Looking for Group', color: 'blue' },
            { id: 'offering', label: 'Starting Group', color: 'green' },
            { id: 'announcement', label: 'Announcement', color: 'purple' },
        ],
        'misc': [
            { id: '', label: 'All', color: 'gray' },
            { id: 'announcement', label: 'Discussion', color: 'purple' },
            { id: 'looking-for', label: 'Question', color: 'blue' },
            { id: 'offering', label: 'Sharing', color: 'green' },
        ],
    };

    const currentIntents = channelIntents[activeChannel] || channelIntents[''];

    const sortOptions = [
        { id: 'newest', label: 'Newest', icon: FiClock },
        { id: 'most-active', label: 'Active', icon: FiTrendingUp },
        { id: 'price-low', label: 'Price ↑', icon: FiDollarSign },
        { id: 'price-high', label: 'Price ↓', icon: FiDollarSign },
    ];

    const intentColors = {
        gray: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    };

    const intentActiveColors = {
        gray: 'bg-gray-700 text-white border-gray-700',
        blue: 'bg-blue-600 text-white border-blue-600',
        green: 'bg-green-600 text-white border-green-600',
        orange: 'bg-orange-600 text-white border-orange-600',
        purple: 'bg-purple-600 text-white border-purple-600',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black mb-2">Community</h1>
                            <p className="text-orange-100 text-lg">
                                Connect, share, and discover with fellow students
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                            <FiPlus size={20} />
                            Create Post
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Left Sidebar - Channels */}
                    <div className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                                    <h3 className="font-bold text-white text-lg">Channels</h3>
                                </div>
                                <div className="p-4">
                                    <ChannelSidebar
                                        activeChannel={activeChannel}
                                        onChannelChange={setActiveChannel}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="flex-1 min-w-0">
                        {/* Search & Filters Bar */}
                        <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-5 mb-6">
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={20} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search posts..."
                                        className="w-full pl-12 pr-4 py-4 bg-orange-50 border-2 border-orange-100 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 focus:bg-white outline-none transition-all text-gray-700 placeholder-gray-400"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-5 py-4 rounded-2xl border-2 transition-all flex items-center gap-2 font-medium ${showFilters ? 'border-orange-500 bg-orange-500 text-white' : 'border-orange-200 text-orange-600 hover:border-orange-400 hover:bg-orange-50'}`}
                                >
                                    <FiSliders size={18} />
                                    <span className="hidden sm:inline">Filters</span>
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Search
                                </button>
                            </form>

                            {/* Expanded Filters - Pill Buttons */}
                            {showFilters && (
                                <div className="pt-5 mt-5 border-t border-orange-100 space-y-5">
                                    {/* Intent Pills */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {currentIntents.map(intent => (
                                                <button
                                                    key={intent.id}
                                                    onClick={() => setActiveIntent(intent.id)}
                                                    className={`px-4 py-2.5 rounded-full border-2 font-medium text-sm transition-all ${activeIntent === intent.id
                                                        ? intentActiveColors[intent.color]
                                                        : intentColors[intent.color]
                                                        }`}
                                                >
                                                    {intent.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sort Pills */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Sort By</label>
                                        <div className="flex flex-wrap gap-2">
                                            {sortOptions.map(opt => {
                                                const Icon = opt.icon;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => setSortBy(opt.id)}
                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-medium text-sm transition-all ${sortBy === opt.id
                                                            ? 'bg-gray-800 text-white border-gray-800'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        <Icon size={14} />
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Price Range - Compact */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Price Range</label>
                                        <div className="flex items-center gap-3 max-w-xs">
                                            <input
                                                type="number"
                                                value={priceRange.min}
                                                onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                                                placeholder="$0"
                                                className="w-24 p-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 outline-none transition-all text-center"
                                            />
                                            <span className="text-gray-400 font-medium">to</span>
                                            <input
                                                type="number"
                                                value={priceRange.max}
                                                onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                                                placeholder="$∞"
                                                className="w-24 p-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-300 outline-none transition-all text-center"
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
                            <div className="space-y-6">
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
                    <div className="hidden xl:block w-80 shrink-0">
                        <div className="sticky top-8 space-y-6">
                            {/* Create CTA */}
                            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-3xl p-6 text-white shadow-xl">
                                <h3 className="text-xl font-bold mb-3">Share with the Community</h3>
                                <p className="text-orange-100 text-sm mb-5 leading-relaxed">
                                    Looking for a sublease? Selling furniture? Find study buddies? Post it here!
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    Create Post
                                </button>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                                    <h3 className="font-bold text-white">Community Guidelines</h3>
                                </div>
                                <ul className="p-6 space-y-4 text-sm">
                                    <li className="flex items-start gap-3">
                                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                                        <span className="text-gray-600">Be respectful and helpful to others</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                                        <span className="text-gray-600">Provide clear details in your posts</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                                        <span className="text-gray-600">Report suspicious content</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">✗</span>
                                        <span className="text-gray-600">No spam or duplicate posts</span>
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
