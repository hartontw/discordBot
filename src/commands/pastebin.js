const request = require('request');
const highlight = require('highlight.js');

const Command = require('./command');
const { codeMessage } = require('../utils');

const aliases = {
    'text': '',
    'C#': 'cs',
    'C++': 'cpp',
}

class Pastebin extends Command {
    static get description() {
        return "Prints a Pastebin code.";
    }

    static get usage() {
        return `/pastebin gYmq6mH7
               /pastebin ymg6EDpY --language JavaScript
               /pastebin ymg6EDpY -l js
               /pastebin gYmq6mH7 --auto`;
    }

    static get argsInfo() {
        return [{
                name: 'language',
                alias: 'l',
                description: 'Set de language of the paste.',
            },
            {
                name: 'auto',
                alias: 'a',
                description: 'Auto-Detect the language of the paste.'
            }
        ].concat(Command.argsInfo);
    }

    static getLanguage(code) {
        return new Promise((resolve, reject) => {
            request(`https://pastebin.com/${code}`, (err, res, body) => {
                if (!err) {
                    try {
                        const match = body.match(/<span class=\"h_640\"><a[^>]*?class=\"buttonsm\"[^>]*?>(.*?)<\/a><\/span>/);
                        if (match) {
                            let language = match[1];

                            const split = language.split(' ');
                            if (split)
                                language = split[0];

                            const alias = aliases[language];
                            resolve(alias ? alias : language.toLowerCase());
                        } else reject(new Error('Invalid code.'));
                    } catch (err) {
                        reject(err);
                    }
                } else reject(err);
            });
        });
    }

    static getContent(code) {
        return new Promise((resolve, reject) => {
            request(`https://pastebin.com/raw/${code}`, (err, res, body) => err ? reject(err) : resolve(body.trim()));
        });
    }

    async run() {
        try {
            const code = this.args._[0];

            const content = await this.constructor.getContent(code);
            const language = this.args.language ? this.args.language : (this.args.auto ? highlight.highlightAuto(content).language : await this.constructor.getLanguage(code));

            const messages = [];

            const blocks = codeMessage(content, language, this.message.author.username);
            for (const block of blocks) {
                messages.push(await this.send(block, messages.length === 0));
            }

            return messages;

        } catch (error) {
            return this.error(error);
        }
    }
}

module.exports = Pastebin;