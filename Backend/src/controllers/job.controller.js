const { emailQueue } = require('../queue/email.queue');

async function getJobStatus(req, res, next) {
  try {
    const job = await emailQueue.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found', code: 'JOB_NOT_FOUND', details: {} });
    }

    const status = await job.getState();
    if (job.data && job.data.organizationId && job.data.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN', details: {} });
    }

    res.json({ data: { id: job.id, status } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getJobStatus };
