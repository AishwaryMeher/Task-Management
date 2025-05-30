import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="max-w-md">
        <h1 className="text-9xl font-bold text-indigo-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Page not found</h2>
        <p className="text-gray-600 mt-2 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been removed, renamed,
          or didn't exist in the first place.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" icon={<Home size={16} />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;