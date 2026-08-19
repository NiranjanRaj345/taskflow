const TeamInvitation = require('../models/TeamInvitation');

class TeamInvitationRepository {
  async create(invitationData) {
    const invitation = await TeamInvitation.create(invitationData);
    return invitation;
  }

  async findByToken(token) {
    return await TeamInvitation.findOne({ token, status: 'pending' });
  }

  async findByTeamAndUser(teamId, userId) {
    return await TeamInvitation.findOne({ team: teamId, user: userId, status: 'pending' });
  }

  async findByTeam(teamId) {
    return await TeamInvitation.find({ team: teamId, status: 'pending' })
      .populate('user', 'name email')
      .populate('invitedBy', 'name email');
  }

  async findByUser(userId) {
    return await TeamInvitation.find({ user: userId, status: 'pending' })
      .populate('team', 'name description')
      .populate('invitedBy', 'name email');
  }

  async updateStatus(token, status) {
    return await TeamInvitation.findOneAndUpdate({ token, status: 'pending' }, { status }, { new: true });
  }

  async deleteByToken(token) {
    return await TeamInvitation.findOneAndDelete({ token });
  }
}

module.exports = new TeamInvitationRepository();
