import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import LoadingSpinner from '../shared/LoadingSpinner';
import Button from '../shared/Button';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may be expired.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="lg" className="mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <FiCheckCircle className="text-green-500" size={64} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button onClick={() => navigate('/')} variant="primary" className="w-full">
              Go to Home
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <FiXCircle className="text-red-500" size={64} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button onClick={() => navigate('/')} variant="primary" className="w-full">
              Go to Home
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;

