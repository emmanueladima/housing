import { useEffect, useState } from 'react';
import applicationService from '../services/applicationService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Badge from '../components/shared/Badge';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{app.listingId?.title}</h3>
                    <p className="text-gray-600">{app.listingId?.city}, {app.listingId?.state}</p>
                  </div>
                  <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">You haven't submitted any applications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;

