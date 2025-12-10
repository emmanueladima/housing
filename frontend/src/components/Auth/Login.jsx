import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../shared/Input';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import api from '../../services/api';

const Login = ({ onSuccess, onSwitchToSignUp }) => {
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
      // Check if it's a verification error
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
      // First login to get a temporary token, then resend
      const loginRes = await api.post('/auth/login', formData);
      // This will fail with 403, but we can use the email to resend
    } catch (err) {
      // Expected to fail, but we still try to resend
    }

    try {
      // Try resending without auth (we'll need a public endpoint)
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
    <div>
      {error && (
        <div className={`mb-4 p-3 rounded-lg border ${needsVerification ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <p>{error}</p>
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
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Verification email sent! Please check your inbox.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@university.edu"
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Log In'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

