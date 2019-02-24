const Command = require('./command');
const request = require('request');

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
        return "/pastebin gYmq6mH7";
    }

    static getLanguage(code) {
        return new Promise((resolve, reject) => {
            request(`https://pastebin.com/${code}`, (err, res, body) => {
                if (!err) {
                    let language = body.match(/<span class=\"h_640\"><a[^>]*?class=\"buttonsm\"[^>]*?>(.*?)<\/a><\/span>/)[1];

                    const split = language.split(' ');
                    if (split)
                        language = split[0];

                    const alias = aliases[language];
                    resolve(alias ? alias : language.toLowerCase());
                } else reject(err);
            });
        });
    }

    static getContent(code) {
        return new Promise((resolve, reject) => {
            request(`https://pastebin.com/raw/${code}`, (err, res, body) => err ? reject(err) : resolve(body.trim()));
        });
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
        const language = await this.constructor.getLanguage(code);
        const content = await this.constructor.getContent(code);

        const userLength = this.message.author.username.length + 3; //@username,\n
        let maxLength = 2000 - userLength - language.length - 7; //6` + 1\n

        let first = true;
        let block = 0;
        let i = 0;
        while (i < content.length - maxLength) {

            block = content.substring(i, i + maxLength);

            let l = block.lastIndexOf('\n');
            if (i >= 0) {
                block = content.substring(i, i + l);
                i += l;
            } else i += maxLength;

            const text = '```' + language + '\n' + block + '```';
            await this.send(text, first);

            if (first) {
                maxLength = 2000 - language.length - 7;
                first = false;
            }
        }

        block = content.substring(i, i + maxLength);
        const text = '```' + language + '\n' + block + '```';
        return await this.send(text, first);
    }
}

module.exports = Pastebin;