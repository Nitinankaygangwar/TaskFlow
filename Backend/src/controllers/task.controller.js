const taskService = require('../services/task.service');
const { taskSchema, taskUpdateSchema, taskFilterSchema, assignmentSchema, bulkTaskStatusSchema } = require('../validators/task.validator');

async function createTask(req, res, next) {
  try {
    const payload = taskSchema.parse(req.body);
    const task = await taskService.createTask(req.user.organizationId, req.params.projectId, req.user.id, payload);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function listTasks(req, res, next) {
  try {
    const filters = taskFilterSchema.parse(req.query);
    const result = await taskService.listTasks(req.user.organizationId, req.params.projectId, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await taskService.getTask(req.user.organizationId, req.params.taskId);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const payload = taskUpdateSchema.parse(req.body);
    const task = await taskService.updateTask(req.user.organizationId, req.params.taskId, payload);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const result = await taskService.deleteTask(req.user.organizationId, req.params.taskId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function assignTask(req, res, next) {
  try {
    const payload = assignmentSchema.parse(req.body);
    const assignment = await taskService.assignTask(req.user.organizationId, req.params.taskId, req.user.id, payload.userId);
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
}

async function unassignTask(req, res, next) {
  try {
    const payload = assignmentSchema.parse(req.body || {});
    const result = await taskService.unassignTask(req.user.organizationId, req.params.taskId, payload.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getDashboard(req, res, next) {
  try {
    const result = await taskService.getProjectDashboard(req.user.organizationId, req.params.projectId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function bulkUpdateTaskStatus(req, res, next) {
  try {
    const payload = bulkTaskStatusSchema.parse(req.body);
    const result = await taskService.bulkUpdateTaskStatus(req.user.organizationId, payload.taskIds, payload.status);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask, assignTask, unassignTask, getDashboard, bulkUpdateTaskStatus };
