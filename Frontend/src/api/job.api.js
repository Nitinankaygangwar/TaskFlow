import api from './axios';

export const jobApi = {
  getJob: (jobId) => api.get(`/jobs/${jobId}`),
};

export default jobApi;
