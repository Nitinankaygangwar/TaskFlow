const { PrismaClient } = require('@prisma/client');

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

global.prisma = prisma;

module.exports = prisma;
