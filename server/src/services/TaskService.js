const TaskRepository = require('../repositories/TaskRepository');
const TeamRepository = require('../repositories/TeamRepository');
const UserRepository = require('../repositories/UserRepository');
const { invalidateCache } = require('../config/redis');

const getMemberUserId = (member) => {
  const id = member.user && (member.user._id || member.user);
  return id.toString();
};

class TaskService {
  async createTask(taskData, userId) {
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

    const member = team.members.find((m) => getMemberUserId(m) === userId.toString());
    if (!member || !['owner', 'admin'].includes(member.role)) {
      const error = new Error('Only team owner or admin can create tasks');
      error.statusCode = 403;
      throw error;
    }

    if (taskData.assignedTo) {
      const assignedUser = await UserRepository.findById(taskData.assignedTo);
      if (!assignedUser) {
        const error = new Error('Assigned user not found');
        error.statusCode = 404;
        throw error;
      }

      const isAssignedMember = team.members.some((m) => getMemberUserId(m) === taskData.assignedTo.toString());
      if (!isAssignedMember) {
        const error = new Error('Assigned user must be a member of the team');
        error.statusCode = 400;
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

  async getTasks(filters = {}, userId) {
    const user = await UserRepository.findById(userId);
    if (!user || !user.team) {
      return [];
    }

    const teamFilter = { ...filters, team: user.team.toString() };
    if (teamFilter.assignedTo === user._id.toString()) {
      delete teamFilter.assignedTo;
    }
    return await TaskRepository.findAll(teamFilter);
  }

  async getTaskById(id, userId) {
    const task = await TaskRepository.findById(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    const user = await UserRepository.findById(userId);
    if (!user || !user.team || task.team.toString() !== user.team.toString()) {
      const error = new Error('You do not have permission to view this task');
      error.statusCode = 403;
      throw error;
    }

    return task;
  }

  async updateTask(id, updateData, userId) {
    const task = await TaskRepository.findById(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    const team = await TeamRepository.findById(task.team);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const member = team.members.find((m) => getMemberUserId(m) === userId.toString());
    const isOwnerOrAdmin = member && ['owner', 'admin'].includes(member.role);
    const isAssigned = task.assignedTo && task.assignedTo.toString() === userId.toString();

    if (!isOwnerOrAdmin && !isAssigned) {
      const error = new Error('You do not have permission to update this task');
      error.statusCode = 403;
      throw error;
    }

    if (!isOwnerOrAdmin && isAssigned) {
      const allowedFields = ['status'];
      const updateKeys = Object.keys(updateData);
      const hasDisallowedField = updateKeys.some((key) => !allowedFields.includes(key));

      if (hasDisallowedField) {
        const error = new Error('Assigned users can only update task status');
        error.statusCode = 403;
        throw error;
      }
    }

    const updatedTask = await TaskRepository.update(id, updateData);
    await invalidateCache('cache:/api/tasks*');

    return updatedTask;
  }

  async deleteTask(id) {
    const task = await TaskRepository.delete(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    await invalidateCache('cache:/api/tasks*');
  }

  async getTeamTasks(teamId) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    return await TaskRepository.findByTeam(teamId);
  }

  async getUserTasks(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      return [];
    }

    const userTeams = await TeamRepository.findByMember(userId);
    const teamIds = userTeams.map((team) => team._id);
    if (teamIds.length === 0) {
      return [];
    }

    return await TaskRepository.findByTeams(teamIds, userId);
  }

  async getTaskStats(teamId, userId) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const isMember = team.members.some((m) => getMemberUserId(m) === userId.toString());
    if (!isMember) {
      const error = new Error('You do not have permission to view this team\'s stats');
      error.statusCode = 403;
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
