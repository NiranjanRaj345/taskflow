const authService = require('../services/AuthService');

class AuthController {
  async register(req, res, _next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await authService.register({ name, email, password, role });

      res.status(201).json({
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

  async login(req, res, _next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

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

  async getProfile(req, res, _next) {
    try {
      const user = await authService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: user,
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

  async updateProfile(req, res, _next) {
    try {
      const { name, email, avatar } = req.body;
      const user = await authService.updateProfile(req.user.userId, { name, email, avatar });

      res.status(200).json({
        success: true,
        data: user,
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

  async getAllUsers(req, res, _next) {
    try {
      const users = await authService.getAllUsers();

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
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

module.exports = new AuthController();
