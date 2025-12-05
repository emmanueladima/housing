import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ModernBackground from '../components/shared/ModernBackground';
import { FiCheckCircle, FiXCircle, FiHome, FiRefreshCw } from 'react-icons/fi';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await authService.verifyEmail(token);
        setSuccess(true);
        setLoading(false);

        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired verification link');
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('No verification token provided');
      setLoading(false);
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Orange Gradient & Orbs */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <ModernBackground />

        <div className="relative z-10 w-full">
          <div className="max-w-md mx-auto px-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
              {loading && (
                <>
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="animate-spin">
                      <FiRefreshCw className="text-orange-600" size={32} />
                    </div>
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 mb-2">
                    Verifying Email
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we verify your email address...
                  </p>
                </>
              )}

              {!loading && success && (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle className="text-green-600" size={36} />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 mb-2">
                    Email Verified!
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Your email has been successfully verified. You can now log in to your account.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <FiHome size={18} />
                    Go to Home
                  </button>
                </>
              )}

              {!loading && error && (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiXCircle className="text-red-600" size={36} />
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 mb-2">
                    Verification Failed
                  </h1>
                  <p className="text-gray-600 mb-8">
                    {error}
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/')}
                      className="w-full px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <FiHome size={18} />
                      Go to Home
                    </button>
                    <Link
                      to="/"
                      className="block text-orange-600 hover:text-orange-700 font-bold py-2"
                    >
                      Try signing up again
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
