const User = require('../models/User');

class UserRepository {
  async create(userData) {
    const user = await User.create(userData);
    return user;
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findById(id) {
    return await User.findById(id);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async findAll(filter = {}) {
    return await User.find(filter).populate('team', 'name');
  }

  async findByTeam(teamId) {
    return await User.find({ team: teamId, isActive: true });
  }
}

module.exports = new UserRepository();
