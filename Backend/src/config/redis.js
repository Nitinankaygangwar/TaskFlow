const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 5,
  enableReadyCheck: true,
});

module.exports = { redis };
