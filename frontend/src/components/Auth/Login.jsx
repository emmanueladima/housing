import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../shared/Input';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';

const Login = ({ onSuccess, onSwitchToSignUp }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
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

