const TaskRepository = require('../repositories/TaskRepository');
const TeamRepository = require('../repositories/TeamRepository');
const UserRepository = require('../repositories/UserRepository');
const { invalidateCache } = require('../config/redis');
const { demoTasks, generateId } = require('../config/demo-store');

const isMongoConnected = () => {
  try {
    return require('mongoose').connection.readyState === 1;
  } catch {
    return false;
  }
};

class TaskService {
  async createTask(taskData, userId) {
    if (!isMongoConnected()) {
      const task = {
        _id: generateId(),
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        assignedTo: taskData.assignedTo,
        createdBy: userId,
        team: taskData.team,
        tags: taskData.tags || [],
        dueDate: taskData.dueDate,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoTasks.push(task);
      return task;
    }

    if (!taskData.team) {
      const error = new Error('Team is required');
      error.statusCode = 400;
      throw error;
    }

    const team = await TeamRepository.findById(taskData.team);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    if (taskData.assignedTo) {
      const assignedUser = await UserRepository.findById(taskData.assignedTo);
      if (!assignedUser) {
        const error = new Error('Assigned user not found');
        error.statusCode = 404;
        throw error;
      }
    }

    const task = await TaskRepository.create({
      ...taskData,
      createdBy: userId,
    });

    await invalidateCache('cache:/api/tasks*');

    return task;
  }

  async getTasks(filters = {}) {
    if (!isMongoConnected()) {
      let tasks = [...demoTasks];
      if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
      if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
      if (filters.team) tasks = tasks.filter((t) => t.team === filters.team);
      return tasks;
    }
    return await TaskRepository.findAll(filters);
  }

  async getTaskById(id) {
    if (!isMongoConnected()) {
      const task = demoTasks.find((t) => t._id === id || t.id === id);
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      return task;
    }

    const task = await TaskRepository.findById(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  async updateTask(id, updateData) {
    if (!isMongoConnected()) {
      const taskIndex = demoTasks.findIndex((t) => t._id === id || t.id === id);
      if (taskIndex === -1) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      demoTasks[taskIndex] = { ...demoTasks[taskIndex], ...updateData, updatedAt: new Date().toISOString() };
      return demoTasks[taskIndex];
    }

    const task = await TaskRepository.update(id, updateData);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    await invalidateCache('cache:/api/tasks*');

    return task;
  }

  async deleteTask(id) {
    if (!isMongoConnected()) {
      const taskIndex = demoTasks.findIndex((t) => t._id === id || t.id === id);
      if (taskIndex === -1) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      demoTasks.splice(taskIndex, 1);
      return;
    }

    const task = await TaskRepository.delete(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    await invalidateCache('cache:/api/tasks*');
  }

  async getTeamTasks(teamId) {
    if (!isMongoConnected()) {
      return demoTasks.filter((t) => t.team === teamId);
    }

    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    return await TaskRepository.findByTeam(teamId);
  }

  async getUserTasks(userId) {
    if (!isMongoConnected()) {
      return demoTasks.filter((t) => t.assignedTo === userId || t.createdBy === userId);
    }
    return await TaskRepository.findByUser(userId);
  }

  async getTaskStats(teamId) {
    if (!isMongoConnected()) {
      const tasks = demoTasks.filter((t) => t.team === teamId);
      const statuses = ['todo', 'in-progress', 'review', 'done'];
      return statuses.map((status) => ({
        status,
        count: tasks.filter((t) => t.status === status).length,
      }));
    }

    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const stats = await TaskRepository.countByStatus(teamId);
    const statuses = ['todo', 'in-progress', 'review', 'done'];
    return statuses.map((status) => {
      const found = stats.find((s) => s._id === status);
      return { status, count: found ? found.count : 0 };
    });
  }
}

module.exports = new TaskService();
