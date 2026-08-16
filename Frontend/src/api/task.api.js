import api from './axios';

export const taskApi = {
  getProjectDashboard: (projectId) => api.get(`/tasks/projects/${projectId}/dashboard`),
  listTasks: (projectId, params = {}) => api.get(`/tasks/projects/${projectId}`, { params }),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  createTask: (projectId, payload) => api.post(`/tasks/projects/${projectId}`, payload),
  updateTask: (taskId, payload) => api.patch(`/tasks/${taskId}`, payload),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  assignTask: (taskId, payload) => api.post(`/tasks/${taskId}/assign`, payload),
  unassignTask: (taskId, payload) => api.post(`/tasks/${taskId}/unassign`, payload),
};

export default taskApi;
