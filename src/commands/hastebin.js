const request = require('request');
const highlight = require('highlight.js');
const path = require('path');

const Command = require('./command');
const { codeMessage } = require('../utils');

const languageSubset = [
    'ruby',
    'python',
    'perl',
    'php',
    'scala',
    'go',
    'xml',
    'css',
    'javascript',
    'vbscript',
    'lua',
    'delphi',
    'java',
    'c',
    'cpp',
    'cs',
    'objectivec',
    'vala',
    'sql',
    'smalltalk',
    'lisp',
    'ini',
    'diff',
    'bash',
    'tex',
    'erlang',
    'haskell',
    'markdown',
    'coffee',
    'swift',
];

class Hastebin extends Command {
    static get description() {
        return "Prints a Hastebin code.";
    }

    static get usage() {
        return `/hastebin ipevuhukuw
                /hastebin ipevuhukuw.js`;
    }

    static getContent(code) {
        return new Promise((resolve, reject) => {
            request(`https://hastebin.com/raw/${code}`, (err, res, body) => err ? reject(err) : resolve(body.trim()));
        });
    }

    static getLanguage(code, content) {
        const ext = path.extname(code);
        if (ext)
            return ext.substring(1);

        return highlight.highlightAuto(content, languageSubset).language;
    }

    async send(content, first) {
        if (this.args.dm)
            return await this.message.author.send(content);
        else if (this.args.remains || !first)
            return await this.message.channel.send(content);
        else
            return await this.message.reply(content);
    }

    async run() {
        const code = this.args._[0];

        const content = await this.constructor.getContent(code);
        const language = this.constructor.getLanguage(code, content);

        const messages = [];

        const blocks = codeMessage(content, language, this.message.author.username);
        for (const block of blocks) {
            messages.push(await this.send(block, messages.length === 0));
        }

        return messages;
    }
}

module.exports = Hastebin;