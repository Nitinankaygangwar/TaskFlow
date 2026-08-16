import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jobApi } from '../api/job.api';

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const response = await jobApi.getJob(jobId);
        setJob(response.data?.data || null);
      } catch (err) {
        setError(err?.userMessage || err?.response?.data?.error || 'Unable to load job status.');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  if (loading) {
    return <div className="page-state"><p>Loading job status...</p></div>;
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
    <div className="page-card">
      <h2>Job Details</h2>
      <div className="profile-grid">
        <div className="stat-box"><span>Job ID</span><strong>{job?.id || '—'}</strong></div>
        <div className="stat-box"><span>Status</span><strong>{job?.status || '—'}</strong></div>
      </div>
    </div>
  );
};

export default JobDetails;
