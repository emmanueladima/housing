import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../shared/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check access based on allowedRoles
  // allowedRoles can include: 'admin', 'landlord', 'student'
  if (allowedRoles) {
    const userRole = user?.role; // 'admin' or undefined
    const userType = user?.userType; // 'landlord', 'student', or 'both'

    console.log('🛡️ ProtectedRoute Check:', {
      userRole,
      userType,
      allowedRoles,
      user_id: user?._id
    });

    // Admin users can access everything
    if (userRole === 'admin') {
      return children;
    }

    // Check if userType matches allowed roles (userType can be 'both')
    const hasAccess = allowedRoles.some(role => {
      if (role === 'admin') return userRole === 'admin';
      if (role === 'landlord') return userType === 'landlord' || userType === 'both';
      if (role === 'student') return userType === 'student' || userType === 'both';
      return false;
    });

    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

