import axios from './axios';

const platformApi = {
  getDashboard: () =>
    axios.get('/platform/dashboard'),

  listOrganizations: (params = {}) =>
    axios.get('/platform/organizations', { params }),

  getOrganization: (organizationId) =>
    axios.get(`/platform/organizations/${organizationId}`),

  createOrganization: (data) =>
    axios.post('/platform/organizations', data),

  updateOrganization: (organizationId, data) =>
    axios.patch(`/platform/organizations/${organizationId}`, data),

  deleteOrganization: (organizationId) =>
    axios.delete(`/platform/organizations/${organizationId}`),

  listUsers: (params = {}) =>
    axios.get('/platform/users', { params }),

  getUser: (userId) =>
    axios.get(`/platform/users/${userId}`),

  updateUserRole: (userId, platformRole) =>
    axios.patch(`/platform/users/${userId}/role`, { platformRole }),

  deleteUser: (userId) =>
    axios.delete(`/platform/users/${userId}`),

  assignUserToOrganization: (organizationId, userId, role = 'member') =>
    axios.post(`/platform/organizations/${organizationId}/members`, {
      userId,
      role,
    }),

  promoteToOrgAdmin: (organizationId, userId) =>
    axios.patch(`/platform/organizations/${organizationId}/members/${userId}/promote`),
};

export { platformApi };
