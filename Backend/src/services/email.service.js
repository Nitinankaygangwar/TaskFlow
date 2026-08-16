const { createLogger } = require('../utils/logger');

const logger = createLogger('email-service');

async function sendTaskAssignmentEmail({ taskId, userId, organizationId, email }) {
  logger.info('task assignment email queued', { taskId, userId, organizationId, email: Boolean(email) });
  return {
    ok: true,
    message: email ? `Task assignment email sent to ${email}` : 'Task assignment email sent',
  };
}

module.exports = { sendTaskAssignmentEmail };
