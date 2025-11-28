import Button from '../components/shared/Button';

const LandlordDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
          <Button variant="primary">Create Listing</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-600 mb-2">Total Listings</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-600 mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-gray-600 mb-2">Applications</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600">Create your first listing to get started!</p>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;

