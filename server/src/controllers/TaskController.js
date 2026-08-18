const taskService = require('../services/TaskService');

class TaskController {
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.body, req.user.userId);

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Server Error';
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }

  async getTasks(req, res, next) {
    try {
      const { status, priority, assignedTo, team } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (assignedTo) filters.assignedTo = assignedTo;
      if (team) filters.team = team;

      const tasks = await taskService.getTasks(filters);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Server Error';
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Server Error';
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Server Error';
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id);

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Server Error';
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }

  async getTeamTasks(req, res, next) {
    try {
      const tasks = await taskService.getTeamTasks(req.params.teamId);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Server Error';
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }

  async getUserTasks(req, res, next) {
    try {
      const tasks = await taskService.getUserTasks(req.user.userId);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Server Error';
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }

  async getTaskStats(req, res, next) {
    try {
      const stats = await taskService.getTaskStats(req.params.teamId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Server Error';
      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }
}

module.exports = new TaskController();
