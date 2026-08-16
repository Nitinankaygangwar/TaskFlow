const { Queue } = require('bullmq');
const { redis } = require('../config/redis');

const emailQueue = new Queue('email-notifications', { connection: redis });

module.exports = { emailQueue };
