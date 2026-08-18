const TeamRepository = require('../repositories/TeamRepository');
const UserRepository = require('../repositories/UserRepository');
const { invalidateCache } = require('../config/redis');

class TeamService {
  async createTeam(teamData, userId) {
    const owner = await UserRepository.findById(userId);
    if (!owner) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const team = await TeamRepository.create({
      ...teamData,
      createdBy: userId,
      members: [{ user: userId, role: 'owner' }],
    });

    await UserRepository.update(userId, { team: team._id });

    await invalidateCache('cache:/api/teams*');

    return team;
  }

  async getTeamById(id) {
    const team = await TeamRepository.findById(id);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
    return team;
  }

  async getAllTeams(filters = {}) {
    return await TeamRepository.findAll(filters);
  }

  async updateTeam(id, updateData) {
    const team = await TeamRepository.update(id, updateData);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    await invalidateCache('cache:/api/teams*');

    return team;
  }

  async deleteTeam(id, userId) {
    const team = await TeamRepository.findById(id);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = team.createdBy.toString() === userId.toString();
    const member = team.members.find((m) => m.user.toString() === userId.toString());
    const isAdminOrOwner = member && ['owner', 'admin'].includes(member.role);

    if (!isOwner && !isAdminOrOwner) {
      const error = new Error('You do not have permission to delete this team');
      error.statusCode = 403;
      throw error;
    }

    await TeamRepository.delete(id);

    await invalidateCache('cache:/api/teams*');
  }

  async addMember(teamId, userId, role = 'member') {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedTeam = await TeamRepository.addMember(teamId, userId, role);

    await UserRepository.update(userId, { team: teamId });
    await invalidateCache('cache:/api/teams*');

    return updatedTeam;
  }

  async removeMember(teamId, userId) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedTeam = await TeamRepository.removeMember(teamId, userId);

    await UserRepository.update(userId, { team: null });
    await invalidateCache('cache:/api/teams*');

    return updatedTeam;
  }
}

module.exports = new TeamService();
