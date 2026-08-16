import api from './axios';

export const projectApi = {
  getProjects: (params = {}) => api.get('/projects', { params }),
  getProject: (projectId) => api.get(`/projects/${projectId}`),
  createProject: (payload) => api.post('/projects', payload),
  updateProject: (projectId, payload) => api.patch(`/projects/${projectId}`, payload),
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),
};

export default projectApi;
