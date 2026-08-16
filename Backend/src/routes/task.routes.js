const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { createTask, listTasks, getTask, updateTask, deleteTask, assignTask, unassignTask, getDashboard, bulkUpdateTaskStatus } = require('../controllers/task.controller');

const router = express.Router();

router.use(authMiddleware);
router.get('/projects/:projectId', listTasks);
router.post('/projects/:projectId', requireRole('org_admin', 'member'), createTask);
router.get('/projects/:projectId/dashboard', getDashboard);
router.patch('/bulk-status', requireRole('org_admin', 'member'), bulkUpdateTaskStatus);
router.get('/:taskId', getTask);
router.patch('/:taskId', requireRole('org_admin', 'member'), updateTask);
router.delete('/:taskId', requireRole('org_admin'), deleteTask);
router.post('/:taskId/assign', requireRole('org_admin', 'member'), assignTask);
router.post('/:taskId/unassign', requireRole('org_admin', 'member'), unassignTask);

module.exports = router;
