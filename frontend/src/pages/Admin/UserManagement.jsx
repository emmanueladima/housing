import { useState, useEffect } from 'react';
import { FiSearch, FiMoreVertical, FiUserCheck, FiUserX, FiLogIn } from 'react-icons/fi';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(page, 10, search);
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleBanToggle = async (user) => {
    if (!confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} ${user.firstName}?`)) return;

    try {
      setProcessingId(user._id);
      // Prompt for reason if banning
      const reason = !user.isBanned ? prompt('Enter reason for banning:') : null;
      if (!user.isBanned && !reason) return; // Cancel if no reason provided

      const response = await adminService.toggleBanUser(user._id, reason);
      
      // Update local state
      setUsers(users.map(u => u._id === user._id ? { ...u, isBanned: response.isBanned } : u));
      toast.success(response.message);
    } catch (error) {
      toast.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleImpersonate = async (user) => {
    if (!confirm(`Login as ${user.firstName}? You will be redirected to the main app.`)) return;

    try {
      setProcessingId(user._id);
      await adminService.impersonateUser(user._id);
      window.location.href = '/dashboard'; // Force reload to apply new token
    } catch (error) {
      toast.error('Impersonation failed: ' + error);
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No users found matching "{search}"
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                          {user.firstName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : user.userType === 'landlord'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.userType}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.isBanned ? (
                        <span className="text-red-400 flex items-center gap-1 text-sm">
                          <FiUserX /> Banned
                        </span>
                      ) : (
                        <span className="text-green-400 flex items-center gap-1 text-sm">
                          <FiUserCheck /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleImpersonate(user)}
                          disabled={processingId === user._id || user.role === 'admin'}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Login as User"
                        >
                          <FiLogIn />
                        </button>
                        <button
                          onClick={() => handleBanToggle(user)}
                          disabled={processingId === user._id || user.role === 'admin'}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            user.isBanned 
                              ? 'text-green-400 hover:bg-green-500/20' 
                              : 'text-red-400 hover:bg-red-500/20'
                          }`}
                          title={user.isBanned ? "Unban User" : "Ban User"}
                        >
                          {user.isBanned ? <FiUserCheck /> : <FiUserX />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
