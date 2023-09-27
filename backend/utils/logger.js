const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'solar-offset-backend' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/warn.log', level: 'warn' }),
        new winston.transports.File({ filename: './logs/combined.log' })
    ]
});

module.exports = logger;


