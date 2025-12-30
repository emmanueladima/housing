import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EmailInput from '../ui/EmailInput';
import PasswordInput from '../ui/PasswordInput';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import api from '../../services/api';

const Login = ({ onSuccess, onSwitchToSignUp, onForgotPassword }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setNeedsVerification(false);
    setResendSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);

    try {
      await login(formData);
      onSuccess();
    } catch (err) {
      if (err.message?.includes('verify your email')) {
        setNeedsVerification(true);
      }
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/login', formData);
    } catch (err) {
      // Expected to fail
    }

    try {
      await api.post('/auth/resend-verification-public', { email: formData.email });
      setResendSuccess(true);
      setError('');
    } catch (err) {
      setError('Could not resend verification email. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-900">Login to your account</h3>
        <p className="text-sm text-gray-500">
          Enter your email below to login to your account
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className={`p-3 rounded-lg border ${needsVerification ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <p className="text-sm">{error}</p>
          {needsVerification && !resendSuccess && (
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-900 underline"
            >
              {resendLoading ? 'Sending...' : 'Resend verification email'}
            </button>
          )}
        </div>
      )}

      {resendSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <p className="text-sm">Verification email sent! Please check your inbox.</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <EmailInput
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="m@example.com"
            required
          />

          <div className="space-y-2">
            <div className="flex items-center justify-end mb-1">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-gray-500 hover:text-orange-600 underline-offset-4 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-4 pt-2">
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Login'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
