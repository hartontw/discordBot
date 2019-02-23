const { Attachment } = require('discord.js');
const mjAPI = require("mathjax-node-svg2png");
const Command = require('./command');

mjAPI.config({
    MathJax: { TeX: { extensions: ["color.js"] } }
});

mjAPI.start();

class Latex extends Command {
    get description() {
        return "Format a LaTeX formula into an image.";
    }

    get usage() {
        return "/latex e=mc^2 --color white --scale 2";
    }

    get argsInfo() {
        return [{
                name: 'color',
                alias: 'c',
                description: 'Set de color of the image.',
            },
            {
                name: 'scale',
                alias: 's',
                description: 'Sets the size of the image.'
            },
            {
                name: 'dm',
                description: "Sends the image through a DM message"
            }
        ].concat(super.argsInfo);
    }

    async getBuffer(formula, color = 'white', scale = 2) {
        const data = await mjAPI.typeset({
            math: `{\\color{${color}}{${formula}}}`,
            format: "TeX",
            png: true,
            scale
        });

        return Buffer.from(data.png.replace('data:image/png;base64,', ''), 'base64');
    }

    async run() {
        const buffer = await this.getBuffer(this.args._, this.args.color, this.args.scale);
        const attachment = new Attachment(buffer);
        return this.args.dm ? await this.message.author.send(attachment) : await this.message.reply(attachment);
    }
}

module.exports = Latex;