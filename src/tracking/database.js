const mongoose = require('mongoose');
const logger = require('./logger');

const Message = require('./models/message');
const Command = require('./models/command');

//mongoose.Promise = Promise;

const connection_string = `mongodb://${process.env.MONGO_IP}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

const connection_options = {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
    useNewUrlParser: true
};

mongoose.connection.on('connecting', function() {
    logger.info('Mongoose connecting');
});

mongoose.connection.on('connected', function() {
    logger.info('Mongoose connected');
});

mongoose.connection.on('disconnecting', function() {
    logger.info('Mongoose disconnecting');
});

mongoose.connection.on('disconnected', function() {
    logger.info('Mongoose disconnected');
});

mongoose.connection.on('reconnected', function() {
    logger.info('Mongoose reconnected');
});

mongoose.connection.on('error', function(error) {
    logger.error('Mongoose error', error);
});

let database;

class Database {

    constructor() {}
    static get instance() {
        if (database === undefined)
            database = new Database();

        return database;
    }

    get isDisconnected() { return mongoose.connection.readyState === 0; }
    get isConnected() { return mongoose.connection.readyState === 1; }
    get isConnecting() { return mongoose.connection.readyState === 2; }
    get isDisconnecting() { return mongoose.connection.readyState === 3; }
    get state() {
        const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
        return states[mongoose.connection.readyState];
    }

    connect() {
        mongoose.set('useCreateIndex', true)
        return mongoose.connect(connection_string, connection_options);
    }

    disconnect() { return mongoose.connection.close(); }

    async processMessage(message) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const dbMessage = new Message({
                id: message.id,
                author: message.author.id,
                channel: message.channel.id,
                createdAt: message.createdAt,
                guild: message.guild.id,
                member: message.member.id,
            });

            return await dbMessage.save();

        } catch (error) {
            logger.error(`Mongoose: ${error.message}`, error);
        }
    }

    async processCommand(reply) {
        try {
            if (!this.isConnected)
                throw new Error(`Database is ${this.state}`);

            const dbMessage = await this.processMessage(reply.message);

            const dbCommand = new Command({
                dbMessage: dbMessage,
                message: reply.message.id,
                name: reply.command,
                args: JSON.stringify(reply.args),
                replies: reply.replies.map(r => r.id),
                issues: reply.errors
            });

            return await dbCommand.save();

        } catch (error) {
            logger.error(`Mongoose: ${error.message}`, error);
        }
    }
}

module.exports = Database.instance;