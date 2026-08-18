const TeamRepository = require('../repositories/TeamRepository');
const UserRepository = require('../repositories/UserRepository');
const { invalidateCache } = require('../config/redis');
const { demoTeams, generateId } = require('../config/demo-store');

const isMongoConnected = () => {
  try {
    return require('mongoose').connection.readyState === 1;
  } catch {
    return false;
  }
};

class TeamService {
  async createTeam(teamData, userId) {
    if (!isMongoConnected()) {
      const team = {
        _id: generateId(),
        id: generateId(),
        name: teamData.name,
        description: teamData.description || '',
        members: [{ user: userId, role: 'owner', joinedAt: new Date().toISOString() }],
        createdBy: userId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoTeams.push(team);
      return team;
    }

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
    if (!isMongoConnected()) {
      const team = demoTeams.find((t) => t._id === id || t.id === id);
      if (!team) {
        const error = new Error('Team not found');
        error.statusCode = 404;
        throw error;
      }
      return team;
    }

    const team = await TeamRepository.findById(id);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
    return team;
  }

  async getAllTeams(filters = {}) {
    if (!isMongoConnected()) {
      return [...demoTeams];
    }
    return await TeamRepository.findAll(filters);
  }

  async updateTeam(id, updateData) {
    if (!isMongoConnected()) {
      const teamIndex = demoTeams.findIndex((t) => t._id === id || t.id === id);
      if (teamIndex === -1) {
        const error = new Error('Team not found');
        error.statusCode = 404;
        throw error;
      }
      demoTeams[teamIndex] = { ...demoTeams[teamIndex], ...updateData, updatedAt: new Date().toISOString() };
      return demoTeams[teamIndex];
    }

    const team = await TeamRepository.update(id, updateData);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    await invalidateCache('cache:/api/teams*');

    return team;
  }

  async deleteTeam(id) {
    if (!isMongoConnected()) {
      const teamIndex = demoTeams.findIndex((t) => t._id === id || t.id === id);
      if (teamIndex === -1) {
        const error = new Error('Team not found');
        error.statusCode = 404;
        throw error;
      }
      demoTeams.splice(teamIndex, 1);
      return;
    }

    const team = await TeamRepository.delete(id);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    await invalidateCache('cache:/api/teams*');
  }

  async addMember(teamId, userId, role = 'member') {
    if (!isMongoConnected()) {
      const team = demoTeams.find((t) => t._id === teamId || t.id === teamId);
      if (!team) {
        const error = new Error('Team not found');
        error.statusCode = 404;
        throw error;
      }
      team.members = team.members || [];
      const existing = team.members.find((m) => m.user === userId);
      if (!existing) {
        team.members.push({ user: userId, role, joinedAt: new Date().toISOString() });
      }
      return team;
    }

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
    if (!isMongoConnected()) {
      const team = demoTeams.find((t) => t._id === teamId || t.id === teamId);
      if (!team) {
        const error = new Error('Team not found');
        error.statusCode = 404;
        throw error;
      }
      team.members = (team.members || []).filter((m) => m.user !== userId);
      return team;
    }

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
