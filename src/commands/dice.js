const Command = require('./command');
const fs = require('fs');
const package = require('../../package.json');
const { RichEmbed } = require('discord.js');

const githubUser = package.repository.url.match(/git\+https:\/\/github.com\/(.*?)\//)[1];
const githubName = package.name;

const url = `https://raw.githubusercontent.com/${githubUser}/${githubName}/master/src/assets/dice/d`;

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

        const response = [];

        for (let i = 0; i < dices.length; i++) {
            const amount = dices[i].amount;
            const type = dices[i].type;

            for (let j = 0; j < amount; j++) {
                const value = Math.floor(Math.random() * type) + 1;
                const imageUrl = url + type + '/' + value + '.png';

                const embed = new RichEmbed()
                    .setColor(0x00AE86)
                    .setThumbnail(imageUrl);

                response.push(await this.send(embed));
            }
        }

        return response;
    }
}

module.exports = Dice;