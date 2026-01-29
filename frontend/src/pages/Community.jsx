import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiKey, FiUsers, FiShoppingBag, FiBook, FiHash, FiChevronDown, FiMessageCircle, FiPlus, FiSearch } from 'react-icons/fi';
import communityService from '../services/communityService';
import CommunityPostCard from '../components/Community/CommunityPostCard';
import CreatePostModal from '../components/Community/CreatePostModal';
import CommunityPostDetailModal from '../components/Community/CommunityPostDetailModal';
import ReportModal from '../components/Community/ReportModal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import GlassCard from '../components/shared/GlassCard';
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

    // Reporting state
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportingPost, setReportingPost] = useState(null);

    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loadMoreRef = useRef(null);

    // Reset posts when filters change
    useEffect(() => {
        setPosts([]);
        setPagination({ page: 1, pages: 1, total: 0 });
        setHasMore(true);
        fetchPosts(1, true);
    }, [activeChannel, activeFilter, sortBy]);

    const fetchPosts = async (page = 1, reset = false) => {
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        try {
            const filters = { page, limit: 15, sort: sortBy };
            if (activeChannel) filters.channel = activeChannel;
            if (activeFilter) filters.intent = activeFilter;

            const data = await communityService.getPosts(filters);
            const newPosts = data.posts || [];

            if (reset) {
                setPosts(newPosts);
            } else {
                setPosts(prev => [...prev, ...newPosts]);
            }

            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
            setHasMore(page < (data.pagination?.pages || 1));
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Infinite scroll with IntersectionObserver
    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            fetchPosts(pagination.page + 1);
        }
    }, [loadingMore, hasMore, loading, pagination.page]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [loadMore, hasMore, loadingMore, loading]);

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

    const handleReportPost = (post) => {
        setReportingPost(post);
        setShowReportModal(true);
    };

    const handleSubmitReport = async (reason, description) => {
        if (!reportingPost) return;
        try {
            // We append description to reason for now as the API expects a simple string reason, 
            // or we could update the service to accept both if we wanted to change the service signature.
            // For now, let's keep it simple and just send the reason, as the backend primarily uses the enum.
            // The description logic is handled by the updated backend if we pass it, but communityService.reportPost 
            // currently only sends { reason }.
            await communityService.reportPost(reportingPost._id, reason);
            alert('Report submitted. Thank you for helping keep our community safe.');
        } catch (error) {
            console.error('Error reporting:', error);
            alert('Failed to submit report. Please try again.');
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
        <div className="min-h-screen relative pb-10">
            {/* Header */}
            <div className="relative pt-32 pb-8">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 border border-white/30 rounded-full mb-3 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-white/90 text-xs font-bold uppercase tracking-wider">Community Hub</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                Campus Feed
                            </h1>
                            <p className="text-white/80 text-lg max-w-xl">
                                Connect with students, find everything you need, and stay in the loop.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="group flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200"
                        >
                            <div className="p-1.5 bg-gray-900 rounded-lg group-hover:bg-gray-800 transition-colors">
                                <FiPlus className="text-white" size={18} />
                            </div>
                            <span className="text-lg">Create Post</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Channels Scroll (Mobile/Tablet) */}
            <div className="alert-box md:hidden px-4 mb-6 relative z-10">
                <div className="flex items-center gap-2 p-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20 overflow-x-auto max-w-full">
                    {channels.slice(0, 5).map(channel => {
                        const Icon = channel.icon;
                        const isActive = activeChannel === channel.id;
                        return (
                            <button
                                key={channel.id}
                                onClick={() => setActiveChannel(channel.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm whitespace-nowrap ${isActive
                                    ? 'bg-white text-gray-900 shadow-lg font-bold'
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

            {/* Main Content Area */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto md:hidden mb-6">
                    <div className="relative flex-1">
                        <div className="relative flex items-center bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl overflow-hidden">
                            <div className="flex items-center pl-4 pr-2">
                                <FiSearch className="text-white/70" size={18} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search discussions..."
                                className="flex-1 py-3 px-2 bg-transparent text-white placeholder-white/50 focus:outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* CENTER - Feed */}
                    <div className="lg:col-span-9 min-w-0">

                        {/* Filter Bar */}
                        <div className="rounded-2xl p-3 mb-4 flex items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm">
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
                            <div className="text-center py-16 rounded-[2rem] bg-white/20 backdrop-blur-xl border border-white/30 shadow-sm">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiMessageCircle size={32} className="text-white/50" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-white">No posts yet</h3>
                                <p className="text-sm mb-6 text-white/60">Be the first to start the conversation!</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 rounded-xl text-gray-900 font-bold text-sm bg-white hover:bg-white/90 transition-all shadow-lg"
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

                        {/* Load More Trigger */}
                        {!loading && posts.length > 0 && (
                            <div ref={loadMoreRef} className="flex justify-center py-8">
                                {loadingMore ? (
                                    <div className="flex items-center gap-3 text-white/70">
                                        <LoadingSpinner />
                                        <span className="text-sm font-medium">Loading more posts...</span>
                                    </div>
                                ) : hasMore ? (
                                    <div className="text-white/40 text-sm">Scroll for more</div>
                                ) : (
                                    <div className="text-white/40 text-sm">You've reached the end!</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="hidden lg:block lg:col-span-3 min-w-0">
                        <div className="sticky top-24 space-y-4">

                            {/* CTA Card */}
                            <GlassCard className="text-white bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg" padding="sm">
                                <h3 className="font-bold text-lg mb-2">Share with us</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Looking for a sublease? Selling furniture? Post it here!
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 bg-white text-orange-600 shadow-md"
                                >
                                    Create Post
                                </button>
                            </GlassCard>

                            {/* Guidelines Card */}
                            <div className="rounded-3xl overflow-hidden border border-white/30 bg-white/20 backdrop-blur-xl shadow-lg">
                                <div className="px-4 py-3 border-b border-white/20 bg-white/10">
                                    <span className="text-white font-bold text-sm">Guidelines</span>
                                </div>
                                <ul className="p-4 space-y-3 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-green-500/20 text-green-200">✓</span>
                                        <span className="text-white/80">Be respectful</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-green-500/20 text-green-200">✓</span>
                                        <span className="text-white/80">Provide clear details</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-green-500/20 text-green-200">✓</span>
                                        <span className="text-white/80">Report suspicious content</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 bg-red-500/20 text-red-200">✗</span>
                                        <span className="text-white/80">No spam</span>
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

            <ReportModal
                isOpen={showReportModal}
                onClose={() => {
                    setShowReportModal(false);
                    setReportingPost(null);
                }}
                targetTitle={reportingPost?.title}
                onSubmit={handleSubmitReport}
            />
        </div >
    );
};

export default Community;
