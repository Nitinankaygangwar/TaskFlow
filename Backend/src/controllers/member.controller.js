const memberService = require('../services/member.service');

async function listMembers(req, res, next) {
  try {
    const result = await memberService.listMembers(req.user.organizationId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function addMember(req, res, next) {
  try {
    const member = await memberService.addMember(req.user.organizationId, req.body.email);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
}

async function updateMemberRole(req, res, next) {
  try {
    const member = await memberService.updateMemberRole(req.user.organizationId, req.params.memberId, req.body.role);
    res.json(member);
  } catch (error) {
    next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    const result = await memberService.removeMember(req.user.organizationId, req.params.memberId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { listMembers, addMember, updateMemberRole, removeMember };
