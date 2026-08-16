const projectService = require('../services/project.service');
const { projectSchema, projectUpdateSchema } = require('../validators/project.validator');

async function createProject(req, res, next) {
  try {
    const payload = projectSchema.parse(req.body);
    const project = await projectService.createProject(req.user.organizationId, req.user.id, payload);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

async function listProjects(req, res, next) {
  try {
    const result = await projectService.listProjects(req.user.organizationId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await projectService.getProject(req.user.organizationId, req.params.projectId);
    res.json(project);
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const payload = projectUpdateSchema.parse(req.body);
    const project = await projectService.updateProject(req.user.organizationId, req.params.projectId, payload);
    res.json(project);
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const result = await projectService.deleteProject(req.user.organizationId, req.params.projectId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };
