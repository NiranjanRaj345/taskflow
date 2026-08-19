const TeamRepository = require('../repositories/TeamRepository');
const TeamInvitationRepository = require('../repositories/TeamInvitationRepository');
const UserRepository = require('../repositories/UserRepository');
const { invalidateCache } = require('../config/redis');

const getCreatorId = (team) => (team.createdBy._id || team.createdBy).toString();

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

  async getAllTeams() {
    return await TeamRepository.findAll({});
  }

  async getUserTeams(userId) {
    return await TeamRepository.findByMember(userId);
  }

  async joinTeam(teamId, userId) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = getCreatorId(team) === userId.toString();
    if (isOwner) {
      const error = new Error('You are the owner of this team');
      error.statusCode = 400;
      throw error;
    }

    const isAlreadyMember = team.members.some((m) => m.user.toString() === userId.toString());
    if (isAlreadyMember) {
      const error = new Error('You are already a member of this team');
      error.statusCode = 400;
      throw error;
    }

    const existingRequest = await TeamInvitationRepository.findByTeamAndUser(teamId, userId);
    if (existingRequest) {
      const error = new Error('You already have a pending request to join this team');
      error.statusCode = 400;
      throw error;
    }

    const invitation = await TeamInvitationRepository.create({
      team: teamId,
      user: userId,
      invitedBy: team.createdBy,
      role: 'member',
      status: 'pending',
    });

    await invalidateCache('cache:/api/teams*');

    return { team, invitation };
  }

  async approveJoinRequest(teamId, userId, approverId) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const isCreator = getCreatorId(team) === approverId.toString();
    const approver = team.members.find((m) => m.user.toString() === approverId.toString());
    const isAdminOrOwner = approver && ['owner', 'admin'].includes(approver.role);

    if (!isCreator && !isAdminOrOwner) {
      const error = new Error('Only owner or admin can approve requests');
      error.statusCode = 403;
      throw error;
    }

    const invitation = await TeamInvitationRepository.findByTeamAndUser(teamId, userId);
    if (!invitation) {
      const error = new Error('No pending request found');
      error.statusCode = 404;
      throw error;
    }

    invitation.status = 'accepted';
    await invitation.save();

    const updatedTeam = await TeamRepository.addMember(teamId, userId, invitation.role);
    await UserRepository.update(userId, { team: teamId });

    await invalidateCache('cache:/api/teams*');

    return updatedTeam;
  }

  async rejectJoinRequest(teamId, userId, approverId) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const isCreator = getCreatorId(team) === approverId.toString();
    const approver = team.members.find((m) => m.user.toString() === approverId.toString());
    const isAdminOrOwner = approver && ['owner', 'admin'].includes(approver.role);

    if (!isCreator && !isAdminOrOwner) {
      const error = new Error('Only owner or admin can reject requests');
      error.statusCode = 403;
      throw error;
    }

    const invitation = await TeamInvitationRepository.findByTeamAndUser(teamId, userId);
    if (!invitation) {
      const error = new Error('No pending request found');
      error.statusCode = 404;
      throw error;
    }

    invitation.status = 'rejected';
    await invitation.save();

    await invalidateCache('cache:/api/teams*');

    return team;
  }

  async generateInvitationLink(teamId, userId, role = 'member') {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const requester = team.members.find((m) => m.user.toString() === userId.toString());
    if (!requester || !['owner', 'admin'].includes(requester.role)) {
      const error = new Error('Only owner or admin can generate invitation links');
      error.statusCode = 403;
      throw error;
    }

    const invitation = await TeamInvitationRepository.create({
      team: teamId,
      user: userId,
      invitedBy: userId,
      role,
      status: 'pending',
    });

    await invalidateCache('cache:/api/teams*');

    return invitation;
  }

  async acceptInvitation(token, userId) {
    const invitation = await TeamInvitationRepository.findByToken(token);
    if (!invitation) {
      const error = new Error('Invalid or expired invitation');
      error.statusCode = 404;
      throw error;
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      const error = new Error('Invitation has expired');
      error.statusCode = 400;
      throw error;
    }

    if (invitation.user.toString() !== userId.toString()) {
      const error = new Error('This invitation is not for you');
      error.statusCode = 403;
      throw error;
    }

    const team = await TeamRepository.findById(invitation.team);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const isAlreadyMember = team.members.some((m) => m.user.toString() === userId.toString());
    if (isAlreadyMember) {
      const error = new Error('You are already a member of this team');
      error.statusCode = 400;
      throw error;
    }

    invitation.status = 'accepted';
    await invitation.save();

    const updatedTeam = await TeamRepository.addMember(invitation.team, userId, invitation.role);
    await UserRepository.update(userId, { team: invitation.team });

    await invalidateCache('cache:/api/teams*');

    return updatedTeam;
  }

  async getJoinRequests(teamId, userId) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const isCreator = getCreatorId(team) === userId.toString();
    const requester = team.members.find((m) => m.user.toString() === userId.toString());
    const isAdminOrOwner = requester && ['owner', 'admin'].includes(requester.role);

    if (!isCreator && !isAdminOrOwner) {
      const error = new Error('Only owner or admin can view requests');
      error.statusCode = 403;
      throw error;
    }

    const requests = await TeamInvitationRepository.findByTeam(teamId);
    return requests.filter((r) => r.status === 'pending');
  }

  async leaveTeam(teamId, userId) {
    const team = await TeamRepository.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const member = team.members.find((m) => m.user.toString() === userId.toString());
    if (!member) {
      const error = new Error('You are not a member of this team');
      error.statusCode = 400;
      throw error;
    }

    if (member.role === 'owner') {
      const error = new Error('Owner cannot leave the team. Transfer ownership or delete the team.');
      error.statusCode = 400;
      throw error;
    }

    const updatedTeam = await TeamRepository.removeMember(teamId, userId);

    await UserRepository.update(userId, { team: null });
    await invalidateCache('cache:/api/teams*');

    return updatedTeam;
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

    const isOwner = getCreatorId(team) === userId.toString();
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

    const isOwner = getCreatorId(team) === userId.toString();
    if (isOwner) {
      const error = new Error('Owner is already a member of this team');
      error.statusCode = 400;
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
