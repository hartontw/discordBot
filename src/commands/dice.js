const Command = require('./command');
const fs = require('fs');

const images = {
    d4: [],
    d6: [],
    d8: [],
    d10: [],
    d12: [],
    d20: []
}

class Dice extends Command {
    static get description() {
        return "Rolls a dice.";
    }

    static get usage() {
        return `/dice 6
                /dice 6 12 4
                /dice 2d20 3d12 1d6`;
    }

    async run() {
        const dices = this.args._;

        for (let i = 0; i < dices.length; i++) {
            const dice = dices[i];
            if (isNaN(dice)) {
                const spl = dice.split('d');
                dices[i] = { amount: spl[0], type: Number(spl[1]) };
            } else dices[i] = { amount: 1, type: Number(dice) };
        }

        const fields = [];
        for (let i = 0; i < dices.length; i++) {
            const name = `${dices[i].amount} d${dices[i].type}`;
            let value = '';
            for (let j = 0; j < dices[i].amount; j++) {
                const rnd = Math.floor(Math.random() * dices[i].type) + 1;
                const url = images[`d${dices[i].type}`][rnd];
                value += `![](url)`;
            }

            fields.push({ name, value });
        }

        const response = {
            embed: {
                color: 3447003,
                fields,
            }
        }

        return await this.send(response);
    }
}

module.exports = Dice;