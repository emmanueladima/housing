import { Link } from 'react-router-dom';
import Button from '../components/shared/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

