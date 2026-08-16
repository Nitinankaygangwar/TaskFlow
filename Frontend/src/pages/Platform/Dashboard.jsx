import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { platformApi } from '../../api/platform.api';
import styles from '../Dashboard.module.css';

export default function PlatformDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await platformApi.getDashboard();
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
      <h1>Platform Admin Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p className={styles.statValue}>{dashboard?.totalUsers || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Organizations</h3>
          <p className={styles.statValue}>{dashboard?.totalOrganizations || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Projects</h3>
          <p className={styles.statValue}>{dashboard?.totalProjects || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Tasks</h3>
          <p className={styles.statValue}>{dashboard?.totalTasks || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Platform Admins</h3>
          <p className={styles.statValue}>{dashboard?.platformAdmins || 0}</p>
        </div>
      </div>

      <div className={styles.actionsGrid}>
        <Link to="/platform/organizations" className={styles.actionCard}>
          <h3>Manage Organizations</h3>
          <p>View, create, and manage all organizations</p>
        </Link>
        <Link to="/platform/users" className={styles.actionCard}>
          <h3>Manage Users</h3>
          <p>View all users and manage platform roles</p>
        </Link>
      </div>
    </div>
  );
}
