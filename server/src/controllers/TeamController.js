const teamService = require('../services/TeamService');

class TeamController {
  async createTeam(req, res, _next) {
    try {
      const team = await teamService.createTeam(req.body, req.user.userId);

      res.status(201).json({
        success: true,
        data: team,
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

  async getTeamById(req, res, _next) {
    try {
      const team = await teamService.getTeamById(req.params.id);

      res.status(200).json({
        success: true,
        data: team,
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

  async getUserTeams(req, res, _next) {
    try {
      const teams = await teamService.getUserTeams(req.user.userId);

      res.status(200).json({
        success: true,
        count: teams.length,
        data: teams,
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

  async getPublicTeams(req, res, _next) {
    try {
      const teams = await teamService.getPublicTeams();

      res.status(200).json({
        success: true,
        count: teams.length,
        data: teams,
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

  async getAllTeams(req, res, _next) {
    try {
      const teams = await teamService.getAllTeams();

      res.status(200).json({
        success: true,
        count: teams.length,
        data: teams,
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

  async joinTeam(req, res, _next) {
    try {
      const result = await teamService.joinTeam(req.params.id, req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
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

  async leaveTeam(req, res, _next) {
    try {
      const team = await teamService.leaveTeam(req.params.id, req.user.userId);

      res.status(200).json({
        success: true,
        data: team,
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

  async approveJoinRequest(req, res, _next) {
    try {
      const { userId } = req.body;
      const team = await teamService.approveJoinRequest(req.params.id, userId, req.user.userId);

      res.status(200).json({
        success: true,
        data: team,
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

  async rejectJoinRequest(req, res, _next) {
    try {
      const { userId } = req.body;
      const team = await teamService.rejectJoinRequest(req.params.id, userId, req.user.userId);

      res.status(200).json({
        success: true,
        data: team,
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

  async getJoinRequests(req, res, _next) {
    try {
      const requests = await teamService.getJoinRequests(req.params.id, req.user.userId);

      res.status(200).json({
        success: true,
        count: requests.length,
        data: requests,
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

  async generateInvitationLink(req, res, _next) {
    try {
      const { role } = req.body;
      const invitation = await teamService.generateInvitationLink(req.params.id, req.user.userId, role);

      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const inviteLink = `${baseUrl}/invite/${invitation.token}`;

      res.status(200).json({
        success: true,
        data: {
          token: invitation.token,
          link: inviteLink,
          expiresAt: invitation.expiresAt,
          role: invitation.role,
        },
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

  async acceptInvitation(req, res, _next) {
    try {
      const { token } = req.params;
      const team = await teamService.acceptInvitation(token, req.user.userId);

      res.status(200).json({
        success: true,
        data: team,
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

  async updateTeam(req, res, _next) {
    try {
      const team = await teamService.updateTeam(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: team,
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

  async deleteTeam(req, res, _next) {
    try {
      await teamService.deleteTeam(req.params.id, req.user.userId);

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

  async addMember(req, res, _next) {
    try {
      const { userId, role } = req.body;
      const team = await teamService.addMember(req.params.id, userId, role);

      res.status(200).json({
        success: true,
        data: team,
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

  async removeMember(req, res, _next) {
    try {
      const { userId } = req.body;
      const team = await teamService.removeMember(req.params.id, userId);

      res.status(200).json({
        success: true,
        data: team,
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

  async updateMemberRole(req, res, _next) {
    try {
      const { userId, role } = req.body;
      const team = await teamService.updateMemberRole(req.params.id, userId, role, req.user.userId);

      res.status(200).json({
        success: true,
        data: team,
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

module.exports = new TeamController();
