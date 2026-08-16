import { Link } from 'react-router-dom';

const NotFound = ({ isForbidden = false }) => (
  <div className="page-card not-found">
    <h2>{isForbidden ? 'Forbidden' : 'Page not found'}</h2>
    <p>
      {isForbidden
        ? "You don't have permission to access this resource."
        : 'The page you are looking for does not exist.'}
    </p>
    <Link to="/dashboard" className="button-like">Go to dashboard</Link>
  </div>
);

export default NotFound;
