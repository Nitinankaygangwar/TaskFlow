const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { createProject, listProjects, getProject, updateProject, deleteProject } = require('../controllers/project.controller');

const router = express.Router();

router.use(authMiddleware);
router.get('/', listProjects);
router.post('/', requireRole('org_admin'), createProject);
router.get('/:projectId', getProject);
router.patch('/:projectId', requireRole('org_admin'), updateProject);
router.delete('/:projectId', requireRole('org_admin'), deleteProject);

module.exports = router;
