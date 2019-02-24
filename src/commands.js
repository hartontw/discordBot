const parseArgs = require('minimist');

const Latex = require('./commands/latex');
const Pastebin = require('./commands/pastebin');
const Gist = require('./commands/gist');
const Dice = require('./commands/dice');
const Cercanias = require('./commands/cercanias');

const CMD_REGEX = /^([/])\w+\s*/;

async function help(message) {
    const fields = [];

    const keys = Object.keys(commands);
    for (let i = 0; i < keys.length; i++) {
        fields.push({
            name: '/' + keys[i],
            value: commands[keys[i]].description
        });
    }

    return await message.author.send({
        embed: {
            color: 3447003,
            title: "**__List of commands:__**",
            fields
        }
    });
}

const commands = {
    latex: Latex,
    pastebin: Pastebin,
    gist: Gist,
    dice: Dice,
    cercanias: Cercanias,
}

async function procces(message) {
    try {
        if (message.author.bot)
            return false;

        if (!message.content.startsWith('/'))
            return false;

        if (!message.content.match(CMD_REGEX))
            return false;

        const argsArray = message.content.match(/\S+/g);

        let command = argsArray[0].trim().substring(1);

        if (command === 'help')
            return await help(message);

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