import { useState, useEffect } from 'react';
import { FiActivity, FiClock, FiUser, FiInfo } from 'react-icons/fi';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { toast } from 'react-hot-toast';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await adminService.getLogs(page, 20);
            setLogs(data.logs);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Audit Logs
                </h1>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Timestamp</th>
                                <th className="p-4 font-medium">Admin</th>
                                <th className="p-4 font-medium">Action</th>
                                <th className="p-4 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400">
                                        No logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FiClock size={14} />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-white">
                                                <FiUser size={14} className="text-gray-500" />
                                                {log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : 'System'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-md bg-white/10 text-white font-mono text-xs border border-white/10">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            <div className="max-w-lg truncate">
                                                {log.details ? JSON.stringify(log.details) : `${log.targetType} ID: ${log.targetId}`}
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
                            className="px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
