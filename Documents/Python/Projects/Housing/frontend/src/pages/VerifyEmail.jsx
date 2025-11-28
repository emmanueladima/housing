import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Button from '../components/shared/Button';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

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
        
        // Redirect to login after 3 seconds
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {loading && (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}

        {!loading && success && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FiCheckCircle className="text-green-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
        )}

        {!loading && error && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FiXCircle className="text-red-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Go to Home
              </Button>
              <Link
                to="/"
                className="block text-orange-600 hover:text-orange-700 font-medium"
              >
                Try signing up again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;



