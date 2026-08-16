function createLogger(scope) {
  return {
    info: (message, meta = {}) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(JSON.stringify({ level: 'info', scope, message, ...meta }));
      }
    },
    warn: (message, meta = {}) => {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(JSON.stringify({ level: 'warn', scope, message, ...meta }));
      }
    },
    error: (message, meta = {}) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error(JSON.stringify({ level: 'error', scope, message, ...meta }));
      }
    },
  };
}

module.exports = { createLogger };
