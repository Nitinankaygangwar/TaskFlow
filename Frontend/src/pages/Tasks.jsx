import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api/project.api';
import { taskApi } from '../api/task.api';
import { memberApi } from '../api/member.api';

const defaultFilters = {
  status: 'all',
  priority: 'all',
  assignee: 'all',
  dueDateFrom: '',
  dueDateTo: '',
  page: 1,
  limit: 10,
};

const Tasks = () => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' });
  const [assignmentTask, setAssignmentTask] = useState(null);
  const [assignmentMemberId, setAssignmentMemberId] = useState('');
  const [taskError, setTaskError] = useState('');

  useEffect(() => {
    const loadProjectsAndMembers = async () => {
      try {
        const [projectRes, memberRes] = await Promise.all([
          projectApi.getProjects({ page: 1, limit: 50 }),
          memberApi.getMembers().catch(() => ({ data: { data: [] } })),
        ]);
        const items = projectRes.data?.data || [];
        setProjects(items);
        setMembers(memberRes.data?.data || []);
        if (items[0]) setSelectedProjectId(items[0].id);
      } catch {
        setTaskError('Unable to load project/task options.');
      }
    };

    loadProjectsAndMembers();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    const loadTasks = async () => {
      try {
        setLoading(true);
        const params = {
          page: filters.page,
          limit: filters.limit,
          ...(filters.status !== 'all' ? { status: filters.status } : {}),
          ...(filters.priority !== 'all' ? { priority: filters.priority } : {}),
          ...(filters.assignee !== 'all' ? { assignee: filters.assignee } : {}),
          ...(filters.dueDateFrom ? { dueDateFrom: filters.dueDateFrom } : {}),
          ...(filters.dueDateTo ? { dueDateTo: filters.dueDateTo } : {}),
        };
        const response = await taskApi.listTasks(selectedProjectId, params);
        setTasks(response.data?.data || []);
        setMeta({ total: response.data?.total || 0, page: response.data?.page || 1, limit: response.data?.limit || 10 });
      } catch (err) {
        setTaskError(err?.userMessage || err?.response?.data?.error || 'Unable to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [selectedProjectId, filters]);

  const handleCreateOrUpdate = async (event) => {
    event.preventDefault();
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask.id, {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate || null,
        });
      } else {
        await taskApi.createTask(selectedProjectId, {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate || null,
        });
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' });
      setFilters((current) => ({ ...current, page: 1 }));
    } catch (err) {
      setTaskError(err?.userMessage || err?.response?.data?.error || 'Unable to save task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.deleteTask(taskId);
      setFilters((current) => ({ ...current, page: 1 }));
    } catch (err) {
      setTaskError(err?.userMessage || err?.response?.data?.error || 'Unable to delete task.');
    }
  };

  const handleAssign = async () => {
    if (!assignmentTask || !assignmentMemberId) return;
    try {
      const response = await taskApi.assignTask(assignmentTask.id, { userId: assignmentMemberId });
      setAssignmentTask(null);
      setAssignmentMemberId('');
      if (response.data && response.data.id) {
        alert('Task assigned successfully.');
      }
      setFilters((current) => ({ ...current, page: 1 }));
    } catch (err) {
      setTaskError(err?.userMessage || err?.response?.data?.error || 'Unable to assign task.');
    }
  };

  const handleUnassign = async (taskId, assigneeId) => {
    try {
      await taskApi.unassignTask(taskId, { userId: assigneeId });
      setFilters((current) => ({ ...current, page: 1 }));
    } catch (err) {
      setTaskError(err?.userMessage || err?.response?.data?.error || 'Unable to unassign task.');
    }
  };

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10)));

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <h2>Tasks</h2>
        <button type="button" onClick={() => { setEditingTask(null); setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' }); setShowTaskModal(true); }}>
          Create Task
        </button>
      </div>

      {taskError && <div className="alert error">{taskError}</div>}

      <div className="page-card">
        <div className="filters-grid">
          <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}>
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
            <option value="all">All</option>
            <option value="todo">todo</option>
            <option value="in_progress">in_progress</option>
            <option value="review">review</option>
            <option value="done">done</option>
          </select>

          <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value, page: 1 }))}>
            <option value="all">All priority</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>

          <select value={filters.assignee} onChange={(event) => setFilters((current) => ({ ...current, assignee: event.target.value, page: 1 }))}>
            <option value="all">All assignees</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.user?.name || member.email || 'Unknown'}</option>
            ))}
          </select>

          <input type="date" value={filters.dueDateFrom} onChange={(event) => setFilters((current) => ({ ...current, dueDateFrom: event.target.value, page: 1 }))} />
          <input type="date" value={filters.dueDateTo} onChange={(event) => setFilters((current) => ({ ...current, dueDateTo: event.target.value, page: 1 }))} />
        </div>
      </div>

      {loading ? (
        <div className="page-state"><p>Loading tasks...</p></div>
      ) : (
        <div className="page-card">
          {tasks.length ? (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{projects.find((project) => project.id === selectedProjectId)?.name || 'Project'}</td>
                        <td><span className={`status-badge ${task.status}`}>{task.status}</span></td>
                        <td><span className={`priority-badge ${task.priority}`}>{task.priority}</span></td>
                        <td>{task.assignments?.[0]?.user?.name || task.assignments?.[0]?.user?.email || 'Unassigned'}</td>
                        <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                        <td className="actions-cell">
                          <button type="button" onClick={() => { setEditingTask(task); setForm({ title: task.title, description: task.description || '', status: task.status, priority: task.priority, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0,10) : '' }); setShowTaskModal(true); }}>Edit</button>
                          <button type="button" className="danger-button" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                          <button type="button" onClick={() => { setAssignmentTask(task); setAssignmentMemberId(''); }}>Assign</button>
                          {task.assignments?.length ? <button type="button" className="secondary-button" onClick={() => handleUnassign(task.id, task.assignments[0].userId)}>Unassign</button> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination-row">
                <button type="button" disabled={filters.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
                <span>Page {meta.page} of {totalPages}</span>
                <button type="button" disabled={filters.page >= totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
              </div>
            </>
          ) : (
            <div className="empty-state">No tasks found.</div>
          )}
        </div>
      )}

      {showTaskModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{editingTask ? 'Edit Task' : 'Create Task'}</h3>
            <form onSubmit={handleCreateOrUpdate} className="stack-form">
              <label>
                <span>Title</span>
                <input type="text" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
              </label>
              <label>
                <span>Description</span>
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} />
              </label>
              <div className="grid-two">
                <label>
                  <span>Status</span>
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    <option value="todo">todo</option>
                    <option value="in_progress">in_progress</option>
                    <option value="review">review</option>
                    <option value="done">done</option>
                  </select>
                </label>
                <label>
                  <span>Priority</span>
                  <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="urgent">urgent</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Due Date</span>
                <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>Cancel</button>
                <button type="submit">{editingTask ? 'Save Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignmentTask && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Assign Task</h3>
            <p>{assignmentTask.title}</p>
            <select value={assignmentMemberId} onChange={(event) => setAssignmentMemberId(event.target.value)}>
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.user?.name || member.email || 'Unknown'}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setAssignmentTask(null)}>Cancel</button>
              <button type="button" onClick={handleAssign}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
