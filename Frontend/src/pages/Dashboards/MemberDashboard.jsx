import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard.api';
import { useAuth } from '../../context/AuthContext';
import styles from '../Dashboard.module.css';

export default function MemberDashboard() {
  const { organization } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await dashboardApi.getMemberDashboard();
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

  const summary = dashboard?.taskSummary || { todo: 0, in_progress: 0, review: 0, done: 0 };

  return (
    <div className={styles.container}>
      <h1>My Tasks - {organization?.name}</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>To Do</h3>
          <p className={styles.statValue}>{summary.todo || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>In Progress</h3>
          <p className={styles.statValue}>{summary.in_progress || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Review</h3>
          <p className={styles.statValue}>{summary.review || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Done</h3>
          <p className={styles.statValue}>{summary.done || 0}</p>
        </div>
      </div>

      {dashboard?.assignedTasks?.length > 0 && (
        <div className={styles.section}>
          <h2>My Assigned Tasks</h2>
          <div className={styles.itemList}>
            {dashboard.assignedTasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className={styles.itemCard}
              >
                <p className={styles.itemTitle}>{task.title}</p>
                <p className={styles.itemMeta}>{task.project?.name}</p>
                <div className={styles.badgeContainer}>
                  <span className={`${styles.badge} ${styles[`status-${task.status}`]}`}>
                    {task.status}
                  </span>
                  <span className={`${styles.badge} ${styles[`priority-${task.priority}`]}`}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className={styles.badgeMeta}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!dashboard?.assignedTasks?.length && (
        <div className={styles.emptyState}>
          <p>No tasks assigned yet</p>
        </div>
      )}

      <div className={styles.actionsGrid}>
        <Link to="/tasks" className={styles.actionCard}>
          <h3>Browse All Tasks</h3>
          <p>See all tasks in the organization</p>
        </Link>
      </div>
    </div>
  );
}
