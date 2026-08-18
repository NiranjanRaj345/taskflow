const { createLogger, format, transports } = require('winston');

const consoleTransport = new transports.Console({
  format: format.combine(format.colorize(), format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)),
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    consoleTransport,
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.remove(consoleTransport);
}

module.exports = logger;
