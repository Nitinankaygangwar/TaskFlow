import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard.api';
import { useAuth } from '../../context/AuthContext';
import styles from '../Dashboard.module.css';

export default function OrgAdminDashboard() {
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
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1>Organization Dashboard - {organization?.name}</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Projects</h3>
          <p className={styles.statValue}>{dashboard?.projectCount || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Tasks</h3>
          <p className={styles.statValue}>{dashboard?.taskCount || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Team Members</h3>
          <p className={styles.statValue}>{dashboard?.memberCount || 0}</p>
        </div>
      </div>

      {dashboard?.recentProjects?.length > 0 && (
        <div className={styles.section}>
          <h2>Recent Projects</h2>
          <div className={styles.itemList}>
            {dashboard.recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className={styles.itemCard}
              >
                <p className={styles.itemTitle}>{project.name}</p>
                <p className={styles.itemMeta}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {dashboard?.recentTasks?.length > 0 && (
        <div className={styles.section}>
          <h2>Recent Tasks</h2>
          <div className={styles.itemList}>
            {dashboard.recentTasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className={styles.itemCard}
              >
                <p className={styles.itemTitle}>{task.title}</p>
                <div className={styles.badgeContainer}>
                  <span className={`${styles.badge} ${styles[`status-${task.status}`]}`}>
                    {task.status}
                  </span>
                  <span className={`${styles.badge} ${styles[`priority-${task.priority}`]}`}>
                    {task.priority}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className={styles.actionsGrid}>
        <Link to="/projects" className={styles.actionCard}>
          <h3>Manage Projects</h3>
          <p>Create, edit, and manage all projects</p>
        </Link>
        <Link to="/tasks" className={styles.actionCard}>
          <h3>Manage Tasks</h3>
          <p>View and assign all tasks</p>
        </Link>
        <Link to="/members" className={styles.actionCard}>
          <h3>Manage Team</h3>
          <p>Add members and manage roles</p>
        </Link>
      </div>
    </div>
  );
}
