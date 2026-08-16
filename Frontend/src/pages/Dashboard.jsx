import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PlatformDashboard from './Platform/Dashboard';
import OrgAdminDashboard from './Dashboards/OrgAdminDashboard';
import MemberDashboard from './Dashboards/MemberDashboard';

const Dashboard = () => {
  const { dashboardType, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (dashboardType === 'platform') {
    return <PlatformDashboard />;
  }

  if (dashboardType === 'org_admin') {
    return <OrgAdminDashboard />;
  }

  if (dashboardType === 'member') {
    return <MemberDashboard />;
  }

  return <Navigate to="/login" replace />;
};

export default Dashboard;
