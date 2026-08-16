const { Worker, Queue } = require('bullmq');
const { redis } = require('../config/redis');
const { sendTaskAssignmentEmail } = require('../services/email.service');
const { createLogger } = require('../utils/logger');

const logger = createLogger('email-worker');
const deadLetterQueue = new Queue('email-dead-letter', { connection: redis });

const worker = new Worker(
  'email-notifications',
  async (job) => {
    if (job.name !== 'TASK_ASSIGNED') {
      return;
    }

    await sendTaskAssignmentEmail({
      taskId: job.data.taskId,
      userId: job.data.userId,
      organizationId: job.data.organizationId,
    });
  },
  {
    connection: redis,
    limiter: { max: 50, duration: 60000 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  }
);

worker.on('completed', (job) => {
  logger.info('job completed', { jobId: job.id, type: job.name, status: 'completed' });
});

worker.on('failed', async (job, err) => {
  logger.error('job failed', { jobId: job?.id, type: job?.name, failedReason: err.message, attempts: job?.attemptsMade });
  if (job) {
    await deadLetterQueue.add('email-dead-letter', {
      jobId: job.id,
      type: job.name,
      taskId: job.data.taskId,
      userId: job.data.userId,
      organizationId: job.data.organizationId,
      failedReason: err.message,
      failedAt: new Date().toISOString(),
      attempts: job.attemptsMade,
    });
  }
});

module.exports = worker;
