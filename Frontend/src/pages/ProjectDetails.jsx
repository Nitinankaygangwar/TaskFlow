import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectApi } from '../api/project.api';
import { taskApi } from '../api/task.api';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { role } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ todo: 0, in_progress: 0, review: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projectRes, dashboardRes, taskRes] = await Promise.all([
          projectApi.getProject(projectId),
          taskApi.getProjectDashboard(projectId),
          taskApi.listTasks(projectId, { page: 1, limit: 50 }),
        ]);
        setProject(projectRes.data);
        setSummary(dashboardRes.data?.data || { todo: 0, in_progress: 0, review: 0, done: 0 });
        setTasks(taskRes.data?.data || []);
      } catch (err) {
        setError(err?.userMessage || err?.response?.data?.error || 'Unable to load project details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  if (loading) {
    return <div className="page-state"><p>Loading project details...</p></div>;
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <div>
          <h2>{project?.name}</h2>
          <p>{project?.description || 'No description provided.'}</p>
        </div>
        <div className="inline-actions">
          {role === 'org_admin' && <Link to="/tasks" className="button-like">Create Task</Link>}
        </div>
      </div>

      <div className="stats-grid compact">
        <div className="stat-card"><span>Todo</span><strong>{summary.todo}</strong></div>
        <div className="stat-card"><span>In Progress</span><strong>{summary.in_progress}</strong></div>
        <div className="stat-card"><span>Review</span><strong>{summary.review}</strong></div>
        <div className="stat-card"><span>Done</span><strong>{summary.done}</strong></div>
      </div>

      <div className="page-card">
        <div className="section-header-row">
          <h3>Tasks</h3>
          <Link to="/tasks" className="text-link">View all tasks</Link>
        </div>
        {tasks.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td><span className={`status-badge ${task.status}`}>{task.status}</span></td>
                    <td><span className={`priority-badge ${task.priority}`}>{task.priority}</span></td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No tasks for this project.</div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
