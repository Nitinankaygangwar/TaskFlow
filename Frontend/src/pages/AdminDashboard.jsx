import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { platformApi } from '../api/platform.api';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await platformApi.getDashboard();
        setDashboard(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load platform dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="page-state"><p>Loading platform dashboard...</p></div>;
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <h2>Platform Admin Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{dashboard?.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Organizations</h3>
          <p>{dashboard?.totalOrganizations || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p>{dashboard?.totalProjects || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{dashboard?.totalTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Platform Admins</h3>
          <p>{dashboard?.platformAdmins || 0}</p>
        </div>
      </div>

      <div className="actions-grid">
        <Link to="/admin/organizations" className="action-card">
          <h3>Manage Organizations</h3>
          <p>View and manage all organizations.</p>
        </Link>
        <Link to="/admin/users" className="action-card">
          <h3>Manage Users</h3>
          <p>Control platform roles and organization access.</p>
        </Link>
        <Link to="/admin/projects" className="action-card">
          <h3>Manage Projects</h3>
          <p>Review cross-organization project health.</p>
        </Link>
        <Link to="/admin/tasks" className="action-card">
          <h3>Manage Tasks</h3>
          <p>Track global task execution and workloads.</p>
        </Link>
      </div>
    </div>
  );
}
