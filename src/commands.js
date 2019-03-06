const parseArgs = require('minimist');

const Help = require('./commands/help');
const Latex = require('./commands/latex');
const Pastebin = require('./commands/pastebin');
const Hastebin = require('./commands/hastebin');
const Gist = require('./commands/gist');
const CodePen = require('./commands/codepen');
const Dice = require('./commands/dice');
const Cercanias = require('./commands/cercanias');
const Random = require('./commands/random');

const commands = {
    help: Help,
    latex: Latex,
    pastebin: Pastebin,
    hastebin: Hastebin,
    gist: Gist,
    codepen: CodePen,
    dice: Dice,
    cercanias: Cercanias,
    random: Random,
}

async function process(message) {
    let command;
    let args = [];

    try {
        if (message.author.bot ||
            !message.content.startsWith('/'))
            return false;

        const argsArray = message.content.match(/\S+/g);

        const commandText = argsArray[0].trim().substring(1);

        args = parseArgs(argsArray.slice(1));

        command = commands[commandText];

        if (!command) {
            args._[0] = commandText.toLowerCase();
            command = Help;
        }

        if (command === Help)
            command = new command(message, args, commands);
        else
            command = new command(message, args);

        return await command.execute();

    } catch (error) {
        return {
            command,
            args,
            message,
            errors: [error],
            hasErrors: () => true
        };
    }
}

module.exports = process;