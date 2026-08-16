require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`TaskFlow server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
