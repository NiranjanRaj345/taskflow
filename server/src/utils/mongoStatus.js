const isMongoConnected = () => {
  try {
    return require('mongoose').connection.readyState === 1;
  } catch {
    return false;
  }
};

module.exports = { isMongoConnected };
