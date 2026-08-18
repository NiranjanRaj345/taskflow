const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const { invalidateCache } = require('../config/redis');

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }

  async register(userData) {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('User already exists with this email');
      error.statusCode = 409;
      throw error;
    }

    const user = await UserRepository.create(userData);
    const token = this.generateToken(user._id);
    await invalidateCache('cache:/api/auth/*');
    return { user, token };
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user._id);
    await invalidateCache('cache:/api/auth/*');
    return { user, token };
  }

  async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    const user = await UserRepository.update(userId, updateData);
    await invalidateCache(`cache:/api/auth/profile/${userId}`);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async getAllUsers() {
    return await UserRepository.findAll({ isActive: true });
  }
}

module.exports = new AuthService();
