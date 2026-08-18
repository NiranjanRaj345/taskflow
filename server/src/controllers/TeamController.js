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
}

module.exports = new TeamController();
