const Team = require('../models/Team');

class TeamRepository {
  async create(teamData) {
    const team = await Team.create(teamData);
    return await Team.findById(team._id).populate('createdBy', 'name email');
  }

  async findById(id) {
    return await Team.findById(id).populate('members.user', 'name email role');
  }

  async findAll(filter = {}) {
    return await Team.find(filter).populate('createdBy', 'name email');
  }

  async update(id, updateData) {
    return await Team.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');
  }

  async delete(id) {
    return await Team.findByIdAndDelete(id);
  }

  async addMember(teamId, userId, role = 'member') {
    return await Team.findByIdAndUpdate(
      teamId,
      { $push: { members: { user: userId, role } } },
      { new: true }
    ).populate('members.user', 'name email role');
  }

  async removeMember(teamId, userId) {
    return await Team.findByIdAndUpdate(
      teamId,
      { $pull: { members: { user: userId } } },
      { new: true }
    ).populate('members.user', 'name email role');
  }
}

module.exports = new TeamRepository();
