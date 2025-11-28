const Safety = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Safety Tips</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Meeting Potential Roommates</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Always meet in public places first</li>
              <li>Tell a friend or family member where you're going</li>
              <li>Trust your instincts</li>
              <li>Video chat before meeting in person</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Viewing Properties</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Schedule tours during daylight hours</li>
              <li>Bring a friend or family member</li>
              <li>Verify the landlord's identity</li>
              <li>Check for proper licensing</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Avoiding Scams</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Never send money before viewing the property</li>
              <li>Be wary of prices that seem too good to be true</li>
              <li>Use secure payment methods</li>
              <li>Get everything in writing</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Report Suspicious Activity</h2>
            <p className="text-gray-700">
              If you encounter any suspicious listings, users, or behavior, please report it immediately through our platform or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;

