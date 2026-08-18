const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const { invalidateCache } = require('../config/redis');
const { demoUsers, generateId } = require('../config/demo-store');

const isMongoConnected = () => {
  try {
    return require('mongoose').connection.readyState === 1;
  } catch {
    return false;
  }
};

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }

  async register(userData) {
    if (!isMongoConnected()) {
      const existingUser = demoUsers.find((u) => u.email === userData.email);
      if (existingUser) {
        const error = new Error('User already exists with this email');
        error.statusCode = 409;
        throw error;
      }

      const password = await require('bcryptjs').hash(userData.password, 12);
      const user = {
        _id: generateId(),
        id: generateId(),
        name: userData.name,
        email: userData.email.toLowerCase(),
        role: userData.role || 'user',
        avatar: '',
        isActive: true,
        password,
      };
      demoUsers.push(user);
      const token = this.generateToken(user._id);
      return { user: { ...user, password: undefined }, token };
    }

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
    if (!isMongoConnected()) {
      const user = demoUsers.find((u) => u.email === email.toLowerCase());
      if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      const isMatch = await require('bcryptjs').compare(password, user.password);
      if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      const token = this.generateToken(user._id);
      return { user: { ...user, password: undefined }, token };
    }

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
    if (!isMongoConnected()) {
      const user = demoUsers.find((u) => u._id === userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      return { ...user, password: undefined };
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    if (!isMongoConnected()) {
      const userIndex = demoUsers.findIndex((u) => u._id === userId);
      if (userIndex === -1) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      if (updateData.email) demoUsers[userIndex].email = updateData.email.toLowerCase().trim();
      if (updateData.name) demoUsers[userIndex].name = updateData.name.trim();
      if (updateData.avatar !== undefined) demoUsers[userIndex].avatar = updateData.avatar;

      return { ...demoUsers[userIndex], password: undefined };
    }

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
}

module.exports = new AuthService();
