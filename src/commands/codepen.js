const request = require('request');
const path = require('path');
const fs = require('fs');

const Command = require('./command');
const { codeMessage } = require('../utils');

const { RichEmbed } = require('discord.js');

class CodePen extends Command {
    static get description() {
        return "Prints a CodePen snippet.";
    }

    static get usage() {
        return `/codepen YBEQvq
                /codepen eVbNKm.html
                /codepen pYJMva.css
                /codepen zbqwvb.js
                /codepen eVbNKm --editors 1010
                /codepen pYJMva --layout left
                /codepen zbqwvb --details
                /codepen YBEQvq -d --height 500
                /codepen eVbNKm --full`;
    }

    static get argsInfo() {
        return [{
                name: 'editors',
                alias: 'e',
                description: 'Sets wich windows are open using binary format.'
            },
            {
                name: 'layout',
                alias: 'l',
                description: 'Sets the editor layout at left, right or top.'
            },
            {
                name: 'details',
                alias: 'd',
                description: 'Set link to the pen in details mode.',
            },
            {
                name: 'height',
                description: 'Details will open at a certain height.',
            },
            {
                name: 'full',
                alias: 'f',
                description: 'Set link to the pen in full mode.'
            },
        ].concat(Command.argsInfo);
    }

    static getInfo(code) {
        return new Promise((resolve, reject) => {
            request(`http://codepen.io/api/oembed?format=json&url=https://codepen.io/pen/${code}`, (err, res, body) => err ? reject(err) : resolve(body));
        });
    }

    static getCode(author_url, code) {
        return new Promise((resolve, reject) => {
            request(author_url + 'pen/' + code, (err, res, body) => err ? reject(err) : resolve(body.trim()));
        });
    }

    static getUserAvatar(author_url) {
        return new Promise((resolve, reject) => {
            request(author_url, (err, res, body) => {
                if (!err) {
                    try {
                        const avatar = body.match(/<img class=\"profile-avatar\" src=\"(.*?)\"/);
                        if (avatar && avatar[1]) {
                            resolve(avatar[1]);
                        } else
                            reject(new Error('Regex error.'));
                    } catch (err) {
                        reject(err);
                    }
                } else reject(err);
            });
        });
    }

    async run() {
        try {
            const code = this.args._[0];

            const info = JSON.parse(await this.constructor.getInfo(code));

            const ext = path.extname(code);
            if (ext && ext.length > 0) {
                const content = await this.constructor.getCode(info.author_url, code);
                const language = ext.substring(1);

                const messages = [];

                const blocks = codeMessage(content, language, this.message.author.username);
                for (const block of blocks) {
                    messages.push(await this.send(block, messages.length === 0));
                }

                return messages;
            } else {
                let url = info.author_url;
                if (this.args.details) {
                    url += 'details/' + code;
                    if (this.args.height)
                        url += `?preview_height=${this.args.height}`

                } else if (this.args.full) {
                    url += 'full/' + code;

                } else {
                    url += 'pen/' + code;

                    if (this.args.layout)
                        url += '/' + this.args.layout;

                    if (this.args.editors)
                        url += `?editors=${this.args.editors}`;
                }

                const embed = new RichEmbed()
                    .setColor(0x344700)
                    .setTitle('**__' + info.title + '__**')
                    .setURL(url)
                    .addField('Export .zip', `${info.author_url}share/zip/${code}`)
                    .addField('Embed HTML', '```html\n' + info.html + '```')
                    .setFooter(info.author_name, await this.constructor.getUserAvatar(info.author_url))
                    .setThumbnail(info.thumbnail_url);

                return await this.send(embed);
            }
        } catch (error) {
            return this.error(error);
        }
    }
}

module.exports = CodePen;