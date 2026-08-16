import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard.api';

export default function MemberDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await dashboardApi.getMemberDashboard();
        setDashboard(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load member dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="page-state"><p>Loading member dashboard...</p></div>;
  if (error) return <div className="alert error">{error}</div>;

  const summary = dashboard?.taskSummary || { todo: 0, in_progress: 0, review: 0, done: 0 };

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <h2>My Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>To Do</h3>
          <p>{summary.todo || 0}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p>{summary.in_progress || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Review</h3>
          <p>{summary.review || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Done</h3>
          <p>{summary.done || 0}</p>
        </div>
      </div>

      <div className="actions-grid">
        <Link to="/member/my-tasks" className="action-card">
          <h3>My Tasks</h3>
          <p>Review and update your assigned work.</p>
        </Link>
        <Link to="/member/projects" className="action-card">
          <h3>Projects</h3>
          <p>View the projects you can access.</p>
        </Link>
        <Link to="/member/team" className="action-card">
          <h3>Team</h3>
          <p>Check your team and collaboration context.</p>
        </Link>
      </div>
    </div>
  );
}
