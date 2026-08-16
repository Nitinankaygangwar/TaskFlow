import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api/project.api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { role } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProjects({ page: 1, limit: 20 });
      setProjects(response.data?.data || []);
      setError('');
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.error || 'Unable to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Project name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await projectApi.createProject({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setForm({ name: '', description: '' });
      setShowModal(false);
      setError('');
      await loadProjects();
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.error || 'Unable to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await projectApi.deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await loadProjects();
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.error || 'Unable to delete project.');
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <h2>Projects</h2>
        {role === 'org_admin' && (
          <button type="button" onClick={() => setShowModal(true)}>Create Project</button>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="page-state"><p>Loading projects...</p></div>
      ) : (
        <div className="page-card">
          {projects.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.description || '—'}</td>
                      <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <Link to={`/projects/${project.id}`}>View</Link>
                        {role === 'org_admin' && (
                          <button type="button" className="danger-button" onClick={() => setDeleteTarget(project)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No projects found.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Create Project</h3>
            <form onSubmit={handleSubmit} className="stack-form">
              <label>
                <span>Name</span>
                <input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label>
                <span>Description</span>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={submitting}>{submitting ? 'Creating project...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card narrow">
            <h3>Delete Project</h3>
            <p>Are you sure you want to delete “{deleteTarget.name}”? This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="danger-button" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
