const Command = require('./command');

class Dice extends Command {
    static get description() {
        return "Rolls a dice.";
    }

    static get usage() {
        return `/dice 6
                /dice 20 12 20`;
    }

    // static get argsInfo() {
    //     return [{
    //             name: 'image',
    //             alias: 'i',
    //             description: 'Shows image of the dice.',
    //         }
    //     ].concat(Command.argsInfo);
    // }

    async run() {
        const dices = this.args._;

        const fields = [];
        for (let i = 0; i < dices.length; i++) {
            const rnd = Math.floor(Math.random() * Number(dices[i])) + 1;
            fields.push({
                name: `d${dices[i]}`,
                value: `Result: ${rnd}`
            });
        }

        const response = {
            embed: {
                color: 3447003,
                fields
            }
        }

        return await this.send(response);
    }
}

module.exports = Dice;