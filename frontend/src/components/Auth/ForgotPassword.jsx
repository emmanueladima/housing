import { useState } from 'react';
import EmailInput from '../ui/EmailInput';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import api from '../../services/api';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

const ForgotPassword = ({ onBack, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-6">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                        Didn't receive it? Check your spam folder or try again.
                    </p>
                </div>
                <Button onClick={onSwitchToLogin} variant="primary" className="w-full">
                    Back to Login
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    <h3 className="text-xl font-bold text-gray-900">Reset your password</h3>
                </div>
                <p className="text-sm text-gray-500 ml-7">
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <EmailInput
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                />

                <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                        {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;
