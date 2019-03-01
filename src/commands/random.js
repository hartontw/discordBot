const request = require('request');
const cheerio = require('cheerio');
const convert = require('xml-js');
const { RichEmbed } = require('discord.js');

const Command = require('./command');
const Pastebin = require('./pastebin');
const Gist = require('./gist');

class Random extends Command {
    static get description() {
        return "Rolls a dice.";
    }

    static get usage() {
        return `/random integer 1 6 
                /random number 0 1
                /random sketchfab
                /random artstation
                /random art
                /random gist
                /random github
                /random pastebin`;
    }

    static get argsInfo() {
        return [{
            name: 'amount',
            alias: '-a',
            description: 'Sets the random replies amount.',
        }].concat(Command.argsInfo);
    }

    static getArtstationUser(url) {
        return new Promise((resolve, reject) => {
            request(url, (err, res, body) => {
                if (!err) {
                    resolve({
                        name: body.match(/<title>(.*?)<\/title>/)[1].replace('ArtStation - ', ''),
                        avatar: body.match(/,\\"medium_avatar_url\\\":\\\"(.*?)\"/)[1],
                    });
                } else reject(err);
            });
        });
    }

    static getArtstation() {
        return new Promise((resolve, reject) => {
            request(`https://www.artstation.com/artwork.rss`, (err, res, body) => {
                if (!err) {
                    const json = convert.xml2js(body, { compact: true, spaces: 4 });
                    const items = json.rss.channel.item;
                    const index = Math.floor(Math.random() * items.length);
                    const item = items[index];

                    const content = item['content:encoded']._cdata;

                    const userUrl = content.match(/\/><a href=\"(.*?)\">/)[1];

                    this.getArtstationUser(userUrl)
                        .then(user => {
                            resolve({
                                title: item.title._text,
                                description: item.description._cdata,
                                image: content.match(/<img src=\"(.*?)\"/)[1],
                                date: new Date(item.pubDate._text),
                                link: item.link._text,
                                author: user.name,
                                avatar: user.avatar
                            })
                        })
                } else reject(err);
            });
        });
    }

    static getSketchfab() {
        return new Promise((resolve, reject) => {
            request('https://sketchfab.com/models/popular', (err, res, body) => {
                if (!err) {
                    const $ = cheerio.load(body);
                    const links = $('.model-name__label');
                    const index = Math.floor(Math.random() * links.length);
                    resolve(links[index].attribs.href);

                } else reject(err);
            });
        });
    }

    static getPastebin() {
        return new Promise((resolve, reject) => {
            request('https://pastebin.com/archive', (err, res, body) => {
                if (!err) {
                    const $ = cheerio.load(body);
                    const codes = [];
                    let x;
                    const links = $('.maintable tr td a').each((i, a) => {
                        x = a;
                        //codes.push(a.attribs.href);
                    });
                    const index = Math.floor(Math.random() * codes.length);
                    //resolve(codes[index]);
                    resolve(x);
                } else reject(err);
            });
        });
    }

    static getGist() {
        return new Promise((resolve, reject) => {
            request('https://gist.github.com/discover', (err, res, body) => {
                if (!err) {
                    const $ = cheerio.load(body);
                    const codes = [];
                    let x;
                    const links = $('.maintable tr td a').each((i, a) => {
                        x = a;
                        //codes.push(a.attribs.href);
                    });
                    const index = Math.floor(Math.random() * codes.length);
                    //resolve(codes[index]);
                    resolve(x);
                } else reject(err);
            });
        });
    }

    async sendArtStation() {
        const artstation = await this.constructor.getArtstation();

        const embed = new RichEmbed();
        embed.setColor(0x00AE86);
        embed.setAuthor(artstation.author, artstation.avatar);
        embed.setTitle(artstation.title);
        embed.setDescription(artstation.description);
        embed.setURL(artstation.link);
        embed.setImage(artstation.image);
        embed.setTimestamp(artstation.date)
        embed.setFooter("ArtStation", "https://cdn6.aptoide.com/imgs/9/4/6/946791c327583efac136bc5c84f20950_icon.png?w=256")

        return await this.send({ embed });
    }

    async sendSketchfab() {
        const sketchfab = await this.constructor.getSketchfab();
        return await this.send(sketchfab);
    }

    async sendPastebin() {
        const code = await this.constructor.getPastebin();
        console.log(code);
        //const pastebinCommand = new Pastebin(this.message, { _: [code.substring(1)] });
        //return await pastebinCommand.execute();
    }

    async sendInteger(s = 0, e = 100) {
        if (s > e)
            s, e = e, s;

        return s + Math.floor(Math.random() * (e - s));
    }

    async sendNumber(s = 0, e = 1) {
        if (s > e)
            s, e = e, s;

        return s + Math.random() * (e - s);
    }

    async sendRandom(option) {
        switch (option) {
            case 'integer':
                return await this.sendInteger(this.args._[1], this.args._[2]);
            case 'number':
                return await this.sendInteger(this.args._[1], this.args._[2]);
            case 'arstation':
                return await this.sendArtStation();
            case 'sketchfab':
                return await this.sendSketchfab();
            case 'pastebin':
                return await this.sendPastebin();
            default:
                return await this.send(`${option} no es una opción válida.`);
        }
    }

    static get options() {
        return {
            art: ['arstation', 'sketchfab'],
            code: ['gist', 'github', 'pastebin']
        };
    }

    async run() {

        const randomItem = array => array[Math.floor(Math.random() * array.length)];

        let option = this.constructor.options[this.args._[0]];

        option = option ? randomItem(option) : this.args._[0];

        return await this.sendRandom(option)
    }
}

module.exports = Random;