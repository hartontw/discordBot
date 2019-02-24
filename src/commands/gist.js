const Command = require('./command');
const request = require('request');

const header = "https://gist.github.com/";

class Gist extends Command {
    static get description() {
        return "Prints a Gist.";
    }

    static get usage() {
        return `/gist <id>
                /gist <user> <fileName>
                /gist <id> --embed --ssh
                /gist <user> <filename> --all
                /gist <id> --share --code`;
    }

    static get argsInfo() {
        return [{
                name: 'embed',
                alias: 'e',
                description: 'Shows Embed path.',
            },
            {
                name: 'share',
                alias: 's',
                description: 'Shows Share url.'
            },
            {
                name: 'clone',
                alias: 'c',
                description: 'Shows Clone path.'
            },
            {
                name: 'ssh',
                alias: 'k',
                description: 'Shows Clone SSH path.'
            },
            {
                name: 'all',
                alias: 'a',
                description: 'Shows all paths.'
            },
            {
                name: 'file',
                alias: 'f',
                description: 'Shows file content.'
            }
        ].concat(Command.argsInfo);
    }

    static searchGist(user, filename) {
        return new Promise((resolve, reject) => {
            request(`${header}/${user}`, (err, res, body) => {
                if (!err) {
                    const id = body.match(new RegExp('<a href=\"\/' + user + '\/(.*?)\"><strong class=\"css-truncate-target\">' + filename + '<\/strong><\/a>'))[1];
                    resolve(id);
                } else reject(err);
            });
        });
    }

    static getInfo(id) {
        return new Promise((resolve, reject) => {
            request(`${header}/${id}`, (err, res, body) => {
                if (!err) {

                    const filename = body.match(/<strong[^>]*?class=\"gist-header-title css-truncate-target\"[^>]*?><a[^>]*?>(.*?)<\/a><\/strong>/)[1];
                    const extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length);
                    const description = body.match(/<meta[^>]*?property=\"og:title\"[^>]*?content=\"(.*?)\"[^>]*?\/>/)[1];
                    const avatar = body.match(/<a class=\"avatar gist-avatar\"[^>]*?><img[^>]*?src=\"(.*?)\"/)[1];
                    const username = body.match(/<a class=\"avatar gist-avatar\"[^>]*?><img[^>]*?alt=\"@(.*)\"/)[1];
                    const date = new Date(body.match(/<time-ago datetime=\"(.*?)\">/)[1]);
                    const raw = body.match(/<a[^>]*?class=\"btn btn-sm \"[^>]*?href=\"(.*?)\"[^>]*?>/)[1];

                    resolve({ id, filename, extension, description, avatar, username, date, raw });
                } else reject(err);
            });
        });
    }

    static getRaw(url) {
        return new Promise((resolve, reject) => {
            request(url, (err, res, body) => err ? reject(err) : resolve(body.trim()));
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

    async sendGist(info) {
        const url = `${header}${info.username}/${info.id}`;

        const fields = [];
        if (this.args.embed || this.args.all)
            fields.push({
                name: 'Embed',
                value: '`<script src="' + url + '.' + info.extension + '"></script>`'
            });
        if (this.args.share || this.args.all)
            fields.push({
                name: 'Share',
                value: '`' + url + '`'
            });
        if (this.args.clone || this.args.all)
            fields.push({
                name: 'Clone via HTTPS',
                value: '`' + url + '.git`'
            });
        if (this.args.ssh || this.args.all)
            fields.push({
                name: 'Clone via SSH',
                value: '`git@gist.github.com:' + info.id + '.git`'
            });

        const reply = {
            embed: {
                color: 3447003,
                title: info.filename,
                url,
                description: info.description,
                fields,
                timestamp: info.date,
                footer: {
                    icon_url: info.avatar,
                    text: info.username
                }
            }
        }

        return await this.send(reply, true);
    }

    async sendFile(info) {
        const content = await this.constructor.getRaw(`https://gist.githubusercontent.com${info.raw}`);

        const maxLength = 2000 - info.extension.length - 7; //6` + 1\n

        let block = 0;
        let i = 0;
        while (i < content.length - maxLength) {

            block = content.substring(i, i + maxLength);

            let l = block.lastIndexOf('\n');
            if (i >= 0) {
                block = content.substring(i, i + l);
                i += l;
            } else i += maxLength;

            const text = '```' + info.extension + '\n' + block + '```';
            await this.send(text);
        }

        block = content.substring(i, i + maxLength);
        const text = '```' + info.extension + '\n' + block + '```';
        return await this.send(text);
    }

    async run() {
        let id = this.args._[0];

        if (this.args._.length > 1)
            id = await this.constructor.searchGist(this.args._[0], this.args._[1]);

        const info = await this.constructor.getInfo(id);

        if (this.args.file)
            return await this.sendFile(info);
        else
            return await this.sendGist(info);
    }
}

module.exports = Gist;