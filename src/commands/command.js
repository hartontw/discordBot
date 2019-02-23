const { RichEmbed } = require('discord.js');

class Command {
    get description() {
        return "Discord custom command";
    }

    get usage() {
        return `/command --help\n
                /command <content> --remain\n
                /command <content> <arguments>`;
    }

    get argsInfo() {
        return [{
                name: 'help',
                alias: 'h',
                description: 'Command documentation.'
            },
            {
                name: 'remain',
                alias: 'r',
                description: 'The command invoke text remains in chat.'
            }
        ];
    }

    get help() {
        let commands = '';

        for (let i = 0; i < this.argsInfo.length; i++) {
            const name = this.argsInfo[i].name;
            const alias = this.argsInfo[i].alias ? ` [${this.argsInfo[i].alias}]` : '';
            const description = this.argsInfo[i].description;

            commands += `${name}${alias}: ${description}\n`;
        }

        return {
            embed: {
                color: 3447003,
                title: this.args._[0],
                description: this.description,
                fields: [{
                        name: 'Usage',
                        value: this.usage
                    },
                    {
                        name: 'Commands',
                        value: commands
                    }
                ]
            }
        };
    }

    constructor(message, args) {
        this.message = message;

        const keys = Object.keys(args);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (key === '_')
                continue;

            if (Array.isArray(args[key]))
                args[key] = args[key][args[key].length - 1];

            const found = this.argsInfo.find(a => a.alias === key);
            if (found && !args[found.name])
                args[found.name] = args[key];
        }

        this.args = args;
    }

    async run() { return false; }

    async execute() {

        if (this.args.help) {
            const help = await this.message.author.send(this.help);

            if (!this.args.remain)
                await this.message.delete();

            return help;
        }

        const run = await this.run();

        if (!this.args.remain)
            await this.message.delete();

        return run;
    }
}

module.exports = Command;