const { createLogger, format, transports, loggers } = require('winston');
require('winston-mongodb');

const basicFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => {
        if (!info.stack) {
            return `[${info.timestamp}] ${info.level}: ${info.message}`;
        } else return `[${info.timestamp}] ${info.level}: ${info.message}\n${info.stack}`;
    })
);

var options = {
    console: {
        handleExceptions: true,
        level: 'debug',
        format: format.combine(
            format.colorize(),
            basicFormat
        )
    },
    file: {
        filename: process.env.LOGGER_PATH + process.env.LOGGER_FILE,
        level: 'debug',
        format: basicFormat,
        maxsize: 5120000,
        maxFiles: 1
    },
    mongo: {
        level: 'debug',
        db: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`,
        options: { useNewUrlParser: true }
    }
}

const logger = createLogger({
    transports: [
        new transports.Console(options.console),
        new transports.File(options.file),
        new transports.MongoDB(options.mongo)
    ]
});

module.exports = logger;