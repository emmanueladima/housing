import React from 'react';
import { FiHome, FiTrendingUp, FiEye, FiUsers, FiDollarSign } from 'react-icons/fi';

const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white/20 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/30 shadow-lg flex items-center gap-3 sm:gap-4 hover:bg-white/30 transition-colors">
        <div className={`p-3 sm:p-4 rounded-xl ${color} text-white shadow-inner`}>
            <Icon size={24} className="sm:w-8 sm:h-8" />
        </div>
        <div>
            <p className="text-white/70 text-xs sm:text-sm font-medium">{label}</p>
            <h3 className="text-xl sm:text-3xl font-black text-white">{value}</h3>
        </div>
    </div>
);

const DashboardOverview = ({ listings = [] }) => {
    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.isActive).length;
    const totalViews = listings.reduce((acc, l) => acc + (l.totalViews || 0), 0);
    // Simple estimation: Sum of rent for active listings
    const potentialRevenue = listings
        .filter(l => l.isActive)
        .reduce((acc, l) => acc + (l.rent || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                    icon={FiHome}
                    label="Total Properties"
                    value={totalListings}
                    color="bg-blue-500"
                />
                <MetricCard
                    icon={FiEye}
                    label="Total Views"
                    value={totalViews}
                    color="bg-purple-500"
                />
                <MetricCard
                    icon={FiUsers}
                    label="Active Listings"
                    value={activeListings}
                    color="bg-green-500"
                />
                <MetricCard
                    icon={FiDollarSign}
                    label="Potential Revenue"
                    value={`$${potentialRevenue.toLocaleString()}`}
                    color="bg-orange-500"
                />
            </div>

            {/* Hint at more analytics in the future */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
                <FiTrendingUp className="mx-auto text-white/50 mb-3" size={32} />
                <h3 className="text-white font-bold text-lg mb-1">Analytics Overview</h3>
                <p className="text-white/60">Detailed performance charts coming soon.</p>
            </div>
        </div>
    );
};

export default DashboardOverview;
