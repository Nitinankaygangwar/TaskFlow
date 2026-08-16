const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { listMembers, addMember, updateMemberRole, removeMember } = require('../controllers/member.controller');

const router = express.Router();
router.use(authMiddleware);

router.get('/', listMembers);
router.post('/', requireRole('org_admin'), addMember);
router.patch('/:memberId', requireRole('org_admin'), updateMemberRole);
router.delete('/:memberId', requireRole('org_admin'), removeMember);

module.exports = router;
