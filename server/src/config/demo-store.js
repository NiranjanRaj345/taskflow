const logger = require('../utils/logger');

const demoUsers = [];
const demoTasks = [];
const demoTeams = [];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const initDemoStore = () => {
  logger.info('Demo store initialized (in-memory)');
};

const clearDemoStore = () => {
  demoUsers.length = 0;
  demoTasks.length = 0;
  demoTeams.length = 0;
};

module.exports = {
  demoUsers,
  demoTasks,
  demoTeams,
  generateId,
  initDemoStore,
  clearDemoStore,
};
