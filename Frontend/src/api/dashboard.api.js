import axios from './axios';

const dashboardApi = {
  getOrgDashboard: () =>
    axios.get('/dashboard/org'),

  getMemberDashboard: () =>
    axios.get('/dashboard/member'),

  getPlatformDashboard: () =>
    axios.get('/platform/dashboard'),
};

export { dashboardApi };
