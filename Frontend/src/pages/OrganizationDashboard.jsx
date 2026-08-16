import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard.api';
import { useAuth } from '../context/AuthContext';

export default function OrganizationDashboard() {
  const { organization } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await dashboardApi.getOrgDashboard();
        setDashboard(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load organization dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="page-state"><p>Loading organization dashboard...</p></div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <h2>{organization?.name || 'Organization'} Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Projects</h3>
          <p>{dashboard?.projectCount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Tasks</h3>
          <p>{dashboard?.taskCount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Members</h3>
          <p>{dashboard?.memberCount || 0}</p>
        </div>
      </div>

      <div className="actions-grid">
        <Link to="/organization/projects" className="action-card">
          <h3>Projects</h3>
          <p>Manage your organization projects and lifecycles.</p>
        </Link>
        <Link to="/organization/tasks" className="action-card">
          <h3>Tasks</h3>
          <p>Track and assign tasks across the organization.</p>
        </Link>
        <Link to="/organization/members" className="action-card">
          <h3>Members</h3>
          <p>Invite, review, and manage team access.</p>
        </Link>
      </div>
    </div>
  );
}
