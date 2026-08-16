import api from './axios';

export const memberApi = {
  getMembers: () => api.get('/members'),
  addMember: (payload) => api.post('/members', payload),
  changeRole: (memberId, payload) => api.patch(`/members/${memberId}`, payload),
  removeMember: (memberId) => api.delete(`/members/${memberId}`),
};

export default memberApi;
