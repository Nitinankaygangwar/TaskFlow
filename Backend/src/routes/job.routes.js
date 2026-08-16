const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { getJobStatus } = require('../controllers/job.controller');

const router = express.Router();

router.use(authMiddleware);
router.get('/:id', getJobStatus);

module.exports = router;
