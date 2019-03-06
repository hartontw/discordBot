require('./environment');

const logger = require('./tracking/logger');
const db = require('./tracking/database');
const commands = require('./commands');

const { Client } = require('discord.js')
const client = new Client();

//Tiempo activo
//process.hrtime()

//Para conectar con la web
//node-ipc

client.on('ready', () => {
    logger.info(`Bot is ready ${client.user.tag}`);
    db.connect(true);
});

client.on('message', async message => {
    const reply = await commands(message);
    if (reply) {
        if (reply.hasErrors()) {
            logger.info(`Command ${reply.command} from message ${reply.message.id} with errors:`);
            for (const error in reply.errors)
                logger.error(error.message, error);
        } else logger.info(`Command ${reply.command} from message ${reply.message.id}`);
        db.processCommand(reply);
    } else {
        logger.info(`Message ${message.id}`);
        db.processMessage(message);
    }
});

client.login(process.env.DISCORD_TOKEN);