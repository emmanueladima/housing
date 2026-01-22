import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { FiUsers, FiHome, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/10">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-300 transition-colors">{title}</p>
        <h3 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-lg w-fit">
        <FiTrendingUp />
        <span>+{trend} this month</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30D');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter User Growth Data based on Time Range
  const getFilteredData = () => {
    if (!stats?.dailyUserGrowth) return [];

    const now = new Date();
    const daysToSubtract = {
      '7D': 7,
      '30D': 30,
      '3M': 90,
      '1Y': 365
    }[timeRange];

    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));

    return stats.dailyUserGrowth
      .filter(item => new Date(item._id) >= cutoffDate)
      .map(item => ({
        name: new Date(item._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: new Date(item._id).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        users: item.count
      }));
  };

  const userGrowthData = getFilteredData();

  // Format Application Status Data
  const applicationStatusData = stats?.applicationStats?.map(item => ({
    name: item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count
  })) || [];

  // Format Price Distribution Data
  const priceData = stats?.listingPriceStats?.map(item => {
    let label = item._id;
    if (typeof item._id === 'number') {
      label = `$${item._id} - $${item._id === 10000 ? '+' : (stats?.listingPriceStats.find(i => i._id > item._id)?._id || 'Up')}`;
      // Fix bucket labels manually for better readability often
      const boundaries = [0, 500, 1000, 1500, 2000, 3000, 5000, 10000];
      const idx = boundaries.indexOf(item._id);
      if (idx !== -1 && idx < boundaries.length - 1) {
        label = `$${boundaries[idx]} - $${boundaries[idx + 1]}`;
      } else if (item._id === 10000) {
        label = '$10k+';
      }
    }
    return {
      name: label,
      count: item.count
    };
  }) || [];

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-400 text-lg">
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={FiUsers}
          color="bg-orange-500"
          trend={stats?.newUsersLast30Days}
        />
        <StatCard
          title="Active Listings"
          value={stats?.totalListings}
          icon={FiHome}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Reports"
          value={stats?.pendingReports}
          icon={FiAlertTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="Growth Rate"
          value={`${stats?.newUsersLast30Days > 0 ? '+' : ''}${Math.round((stats?.newUsersLast30Days / stats?.totalUsers) * 100)}%`}
          icon={FiTrendingUp}
          color="bg-green-500"
        />
      </div>



      {/* Charts Grid */}
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-1 h-8 bg-orange-500 rounded-full"></span>
              User Growth
            </h2>
            <div className="flex bg-white/5 rounded-lg p-1">
              {['7D', '30D', '3M', '1Y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ color: '#fb923c' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                  cursor={{ stroke: '#fb923c', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#f97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
            Application Status
            <span className="text-sm font-normal text-gray-500 ml-auto bg-white/5 px-3 py-1 rounded-full border border-white/5">Overview</span>
          </h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            {applicationStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <div className="p-4 rounded-full bg-white/5 mb-3">
                  <FiAlertTriangle className="text-2xl opacity-50" />
                </div>
                No applications yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Distribution Chart (Full Width) */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/5 to-transparent -z-10" />
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="w-1 h-8 bg-green-500 rounded-full"></span>
          Listing Price Distribution
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1rem', color: '#fff' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              <Bar
                dataKey="count"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
