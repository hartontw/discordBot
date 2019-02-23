const parseArgs = require('minimist');

const Command = require('./commands/command');
const Latex = require('./commands/latex');

const CMD_REGEX = /^([/])\w+\s*/;

const commands = {
    command: Command,
    latex: Latex,
}

async function procces(message) {
    try {
        if (message.author.bot)
            return false;

        if (!message.content.startsWith('/'))
            return false;

        if (!message.content.match(CMD_REGEX))
            return false;

        const argsArray = message.content.match(/\S+/g) || [];

        let command = argsArray[0].trim().substring(1);

        command = commands[command];

        if (!command)
            return false;

        const args = parseArgs(argsArray.slice(1));

        command = new command(message, args);

        return await command.execute();
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

module.exports = procces;