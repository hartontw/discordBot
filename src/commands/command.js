class Command {
    static get description() {
        return "Discord custom command";
    }

    static get usage() {
        return `/command --help
                /command <content> --remains
                /command <content> <arguments>`;
    }

    static get argsInfo() {
        return [{
                name: 'help',
                alias: 'h',
                description: 'Command documentation.'
            },
            {
                name: 'remains',
                alias: 'r',
                description: 'The command text remains in chat.'
            },
            {
                name: 'dm',
                description: "Sends the response through a DM message"
            }
        ];
    }

    async help() {
        const argsInfo = this.constructor.argsInfo;

        let args = '';

        for (let i = 0; i < argsInfo.length; i++) {
            const name = argsInfo[i].name;
            const alias = argsInfo[i].alias ? ` [${argsInfo[i].alias}]` : '';
            const description = argsInfo[i].description;

            args += `${name}${alias}: ${description}\n`;
        }

        const reply = {
            embed: {
                color: 3447003,
                title: this.constructor.name,
                description: this.constructor.description,
                fields: [{
                        name: 'Usage',
                        value: this.constructor.usage
                    },
                    {
                        name: 'Arguments',
                        value: args
                    }
                ]
            }
        };

        const help = await this.message.author.send(reply);

        if (!this.args.remains)
            await this.message.delete();

        return help;
    }

    get wrongFormat() {
        return this.args._.length < 1;
    }

    constructor(message, args) {
        this.message = message;

        const keys = Object.keys(args);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (key !== '_') {

                if (Array.isArray(args[key]))
                    args[key] = args[key][args[key].length - 1];

                const found = this.constructor.argsInfo.find(a => a.alias === key);
                if (found && !args[found.name])
                    args[found.name] = args[key];

            }
        }

        const sp = [];

        for (let i = 0; i < args._.length; i++) {

            let text = args._[i];
            const first = args._[i][0];
            if (first === '"' || first === "'") {
                for (let j = i; j < args._.length; j++) {

                    const last = args._[j][args._[j].length - 1];
                    if (last === first) {
                        if (i === j)
                            text = args._[j].substring(0, args._[j].length - 1);
                        else
                            text += " " + args._[j].substring(0, args._[j].length - 1);

                        i = j;
                        break;

                    } else if (i !== j) text += " " + args._[j];
                }
                sp.push(text.substring(1));
            } else sp.push(text);
        }

        args._ = sp;

        args.remains = args.remains || message.channel.constructor.name === 'DMChannel'

        this.args = args;
    }

    async send(content) {
        if (this.args.dm)
            return await this.message.author.send(content);
        else if (this.args.remains)
            return await this.message.channel.send(content);
        else
            return await this.message.reply(content);
    }

    async run() { return false; }

    async execute() {

        if (this.args.help || this.badFormat)
            return await this.help();

        const run = await this.run();

        if (!this.args.remains)
            await this.message.delete();

        return run;
    }
}

module.exports = Command;