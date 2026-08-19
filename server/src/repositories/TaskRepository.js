const mongoose = require('mongoose');
const Task = require('../models/Task');

class TaskRepository {
  async create(taskData) {
    const task = await Task.create(taskData);
    return await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
  }

  async findById(id) {
    return await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
  }

  async findAll(filter = {}) {
    return await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async update(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
  }

  async delete(id) {
    return await Task.findByIdAndDelete(id);
  }

  async findByTeam(teamId) {
    return await Task.find({ team: teamId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByTeams(teamIds, userId) {
    return await Task.find({ team: { $in: teamIds }, assignedTo: userId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByUser(userId) {
    return await Task.find({ assignedTo: userId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async countByStatus(teamId) {
    return await Task.aggregate([
      { $match: { team: mongoose.Types.ObjectId(teamId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

module.exports = new TaskRepository();
