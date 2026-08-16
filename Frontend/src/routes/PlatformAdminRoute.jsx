import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PlatformAdminRoute({ children }) {
  const { isAuthenticated, platformRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || platformRole !== 'platform_admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
