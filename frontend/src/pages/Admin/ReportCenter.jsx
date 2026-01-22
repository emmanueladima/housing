import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiUser, FiHome, FiExternalLink, FiMessageCircle } from 'react-icons/fi';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ViewReportModal from './ViewReportModal';
import { toast } from 'react-hot-toast';

const ReportCenter = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, resolved, dismissed, all
    const [processingId, setProcessingId] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await adminService.getReports();
            setReports(data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusUpdate = async (reportId, status) => {
        try {
            setProcessingId(reportId);
            const response = await adminService.updateReportStatus(reportId, status);
            setReports(reports.map(r => r._id === reportId ? { ...r, status: response.report.status } : r));
            toast.success(`Report marked as ${status}`);
            if (selectedReport?._id === reportId) setSelectedReport(null);
        } catch (error) {
            toast.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleAction = async (action, targetId) => {
        if (!selectedReport) return;

        const confirmMsg =
            action === 'ban_user' ? 'Are you sure you want to BAN this user?' :
                action === 'delete_listing' ? 'Are you sure you want to DELETE this listing?' :
                    action === 'delete_post' ? 'Are you sure you want to DELETE this post?' :
                        null;

        if (confirmMsg && !confirm(confirmMsg)) return;

        setProcessingId(selectedReport._id);

        try {
            if (action === 'ban_user') {
                await adminService.toggleBanUser(targetId, `Banned due to report: ${selectedReport.reason}`);
                toast.success('User banned successfully');
                await handleStatusUpdate(selectedReport._id, 'resolved');
            } else if (action === 'delete_listing') {
                await adminService.deleteListing(targetId);
                toast.success('Listing deleted successfully');
                await handleStatusUpdate(selectedReport._id, 'resolved');
            } else if (action === 'delete_post') {
                await adminService.deletePost(targetId);
                toast.success('Post deleted successfully');
                await handleStatusUpdate(selectedReport._id, 'resolved');
            } else if (action === 'resolve') {
                await handleStatusUpdate(selectedReport._id, 'resolved');
            } else if (action === 'dismiss') {
                await handleStatusUpdate(selectedReport._id, 'dismissed');
            }
        } catch (error) {
            toast.error(error.message || 'Action failed');
            setProcessingId(null);
        }
    };

    const filteredReports = reports.filter(report => {
        if (filter === 'all') return true;
        return report.status === filter;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Report Center
                </h1>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
                >
                    <option value="pending" className="bg-gray-900">Pending</option>
                    <option value="resolved" className="bg-gray-900">Resolved</option>
                    <option value="dismissed" className="bg-gray-900">Dismissed</option>
                    <option value="all" className="bg-gray-900">All Reports</option>
                </select>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Target</th>
                                <th className="p-4 font-medium">Reporter</th>
                                <th className="p-4 font-medium">Reason</th>
                                <th className="p-4 font-medium">Status</th>
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
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                        No reports found.
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white/10 text-white">
                                                    {report.targetType === 'User' && <FiUser />}
                                                    {report.targetType === 'Listing' && <FiHome />}
                                                    {report.targetType === 'CommunityPost' && <FiMessageCircle />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white line-clamp-1 max-w-[200px]" title={
                                                        report.targetType === 'User' ? `${report.targetUser?.firstName} ${report.targetUser?.lastName}` :
                                                            report.targetType === 'Listing' ? report.targetListing?.title :
                                                                report.targetPost?.title
                                                    }>
                                                        {report.targetType === 'User'
                                                            ? `${report.targetUser?.firstName} ${report.targetUser?.lastName}`
                                                            : report.targetType === 'Listing'
                                                                ? report.targetListing?.title || 'Unknown Listing'
                                                                : report.targetPost?.title || 'Unknown Post'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{report.targetType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {report.reporter?.firstName} {report.reporter?.lastName}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs border border-red-500/20">
                                                {report.reason}
                                            </span>
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-1" title={report.description}>
                                                {report.description}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                                                report.status === 'resolved' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                                                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                }`}>
                                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    View & Act
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ViewReportModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onAction={handleAction}
                processingId={processingId}
            />
        </div >
    );
};

export default ReportCenter;
