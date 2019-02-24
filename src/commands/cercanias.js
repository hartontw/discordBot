const Command = require('./command');
const request = require('request');
const cheerio = require('cheerio');
const { RichEmbed } = require('discord.js');

const ZONES = [{
        id: '20',
        name: 'Asturias',
        url: 'http://www.renfe.com/viajeros/cercanias/asturias/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/asturias.png'
    },
    {
        id: '50',
        name: 'Barcelona',
        url: 'http://www.renfe.com/viajeros/cercanias/barcelona/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/barcelona.png'
    },
    {
        id: '60',
        name: 'Bilbao',
        url: 'http://www.renfe.com/viajeros/cercanias/bilbao/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/bilbao.png'
    },
    {
        id: '31',
        name: 'Cádiz',
        url: 'http://www.renfe.com/viajeros/cercanias/cadiz/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/cadiz.png'
    },
    {
        id: '10',
        name: 'Madrid',
        url: 'http://www.renfe.com/viajeros/cercanias/madrid/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/madrid.png'
    },
    {
        id: '32',
        name: 'Málaga',
        url: 'http://www.renfe.com/viajeros/cercanias/malaga/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/malaga.png'
    },
    {
        id: '41',
        name: 'Múrcia/Alicante',
        url: 'http://www.renfe.com/viajeros/cercanias/murciaalicante/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/murciaalicante.png'
    },
    {
        id: '62',
        name: 'Santander',
        url: 'http://www.renfe.com/viajeros/cercanias/santander/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/santander.png'
    },
    {
        id: '61',
        name: 'San Sebastián',
        url: 'http://www.renfe.com/viajeros/cercanias/sansebastian/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/sansebastian.png'
    },
    {
        id: '30',
        name: 'Sevilla',
        url: 'http://www.renfe.com/viajeros/cercanias/sevilla/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/sevilla.png'
    },
    {
        id: '40',
        name: 'Valencia',
        url: 'http://www.renfe.com/viajeros/cercanias/valencia/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/valencia.png'
    },
    {
        id: '70',
        name: 'Zaragoza',
        url: 'http://www.renfe.com/viajeros/cercanias/zaragoza/index.html',
        map: 'http://www.renfe.com/img/mobi/planos/zaragoza.png'
    }
];

class Cercanias extends Command {
    static get description() {
        return "Lector de horarios para Cercanias RENFE.";
    }

    static get usage() {
        return `/cercanias
                /cercanias <zona>
                /cercanias <zona> <origen> <destino>
                /cercanias <zona> <origen> <destino> --fecha
                /cercanias <zona> <origen> <destino> --inicio
                /cercanias <zona> <origen> <destino> --inicio --fin`;
    }

    static get argsInfo() {
        return [{
                name: 'fecha',
                alias: 'd',
                description: 'Configura la fecha del viaje [--fecha 20190225] [--fecha mañana] [--fecha viernes].'
            },
            {
                name: 'inicio',
                alias: 's',
                description: 'Configura la hora de inicio [--inicio 6].'
            },
            {
                name: 'fin',
                alias: 'e',
                description: 'Configura la hora de fin [--fin 18].'
            }
        ].concat(Command.argsInfo);;
    }

    static getZone(raw) {
        raw = raw.toLowerCase();
        if (raw === 'alicante' || raw === 'múrcia') {
            raw = 'múrcia/alicante';
        }

        return ZONES.find(z => z.name.toLowerCase() === raw);
    }

    get wrongFormat() {
        return this.args.length === 3;
    }

    async sendZones() {
        let description = '';
        for (let i = 0; i < ZONES.length; i++)
            description += `- [${ZONES[i].name}](${ZONES[i].url})\n`;

        const reply = {
            embed: {
                color: 3447003,
                author: {
                    name: 'Renfe Cercanias',
                    icon_url: 'https://is5-ssl.mzstatic.com/image/thumb/Purple124/v4/be/8b/b3/be8bb3ba-9d52-48e2-7616-bbc304d4df5c/source/256x256bb.jpg'
                },
                title: "**__Zonas:__**",
                url: 'http://www.renfe.com/viajeros/cercanias/index.html',
                description
            }
        }

        return await this.send(reply);
    }

    static getStations(zone) {
        return new Promise((resolve, reject) => {
            const requestOptions = { encoding: "latin1", method: "GET", uri: `http://horarios.renfe.com/cer/hjcer300.jsp?CP=NO&I=s&NUCLEO=${zone}` };
            request(requestOptions, (err, res, body) => {
                if (!err) {
                    const $ = cheerio.load(body);
                    const options = $('select[name=o]').find('option');
                    const stations = [];
                    options.each(function() {
                        const opt = $(this);
                        const val = opt.attr('value');
                        if (val !== '?') {
                            stations.push({
                                'id': val,
                                'name': opt.text().trim()
                            });
                        }
                    });
                    resolve(stations);
                } else reject(err);
            });
        });
    }

    async sendStations() {
        const zone = this.constructor.getZone(this.args._[0]);
        if (!zone)
            return await this.send(`${this.args._[0]} no es una zona válida.`);

        const stations = await this.constructor.getStations(zone.id);

        let description = '';
        for (let i = 0; i < stations.length; i++)
            description += stations[i].name + '\n';

        const embed = new RichEmbed();
        embed.setColor(0x00AE86);
        embed.setAuthor("Renfe Cercanias", "https://is5-ssl.mzstatic.com/image/thumb/Purple124/v4/be/8b/b3/be8bb3ba-9d52-48e2-7616-bbc304d4df5c/source/256x256bb.jpg");
        embed.setTitle(`**__${zone.name}:__**`);
        embed.setURL(zone.url);
        embed.setDescription(description);
        embed.setThumbnail(zone.map);

        return await this.send({ embed });
    }

    static getSchedules(url) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                encoding: "latin1",
                method: "GET",
                uri: url
            };
            request(requestOptions, (err, res, body) => {
                if (!err) {
                    const toHour = renfeHour => renfeHour.replace(/^0/g, '').replace('.', ':');

                    const toTime = renfeTime => {
                        const groups = /(.*)\.(.*)/.exec(renfeTime),
                            hours = Number(groups[1]),
                            minutes = Number(groups[2]);

                        let time = '';
                        if (hours) {
                            time = hours + 'h ';
                        }
                        if (minutes) {
                            time += minutes + 'm';
                        }
                        return time;
                    };

                    const $ = cheerio.load(body);
                    const rows = $('table tr');
                    const schedules = [];
                    rows.each(function() {
                        const cols = $(this).find('td:not(.cabe)'),
                            line = $(cols[0]).text().trim(),
                            start = $(cols[2]).text().trim(),
                            arrive = $(cols[cols.length - 2]).text().trim(),
                            time = $(cols[cols.length - 1]).text().trim();

                        if (!isNaN(Number(start[0]))) {
                            schedules.push({
                                line,
                                start: toHour(start),
                                arrive: toHour(arrive),
                                time: toTime(time)
                            });
                        }
                    });
                    resolve(schedules);
                } else reject(err);
            });
        });
    }

    async run() {
        switch (this.args._.length) {
            case 0:
                return await this.sendZones();
            case 1:
                return await this.sendStations();
        }

        const zone = this.constructor.getZone(this.args._[0]);
        if (!zone)
            return await this.send(`${this.args._[0]} no es una zona válida.`);

        const stations = await this.constructor.getStations(zone.id);

        const origin = stations.find(s => s.name.toLowerCase() === this.args._[1].toLowerCase());
        if (!origin)
            return await this.send(`${this.args._[1]} no es un origen válido.`);

        const destination = stations.find(s => s.name.toLowerCase() === this.args._[2].toLowerCase());
        if (!destination)
            return await this.send(`${this.args._[2]} no es un destino válido.`);

        const addZero = nmb => {
            if (nmb < 9)
                return `0${nmb}`;

            return nmb.toString();
        }

        let start = this.args.inicio || 0;

        const addDays = (date, days) => new Date(date.getTime() + days * 60 * 60 * 24 * 1000);

        let now = new Date();
        let date = this.args.fecha;
        if (!date) {
            date = `${now.getFullYear()}${addZero(now.getMonth())}${addZero(now.getDate())}`;

            const hour = now.getHours();
            if (start < hour)
                start = hour;

        } else if (isNaN(date)) {

            if (date === 'mañana') {
                now = addDays(now, 1);

            } else {
                const weekDays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

                const index = weekDays.indexOf(date.toLowerCase().replace('é', 'e').replace('á', 'a'));
                if (index < 0)
                    return await this.send(`${date} no es un día de la semana válido.`);

                const today = now.getDay();
                if (today > index)
                    now = addDays(now, 7 + index - today);
                else
                    now = addDays(now, index - today);
            }

            date = `${now.getFullYear()}${addZero(now.getMonth())}${addZero(now.getDate())}`;
        }

        let end = this.args.fin && this.args.fin > start ? this.args.fin : 26;

        const url = `http://horarios.renfe.com/cer/hjcer310.jsp?nucleo=${zone.id}&i=s&cp=NO&o=${origin.id}&d=${destination.id}&df=${date}&ho=${start}&hd=${end}&TXTInfo=''`;

        const schedules = await this.constructor.getSchedules(url);

        const format = (text, tab) => {
            tab -= text.length;

            const pre = Math.floor(tab / 2);
            for (let i = 0; i < pre; i++)
                text = " " + text;

            const post = Math.ceil(tab / 2);
            for (let i = 0; i < post; i++)
                text += " ";

            return text;
        }

        let overflow = false;
        let description = '-----------------------------------------------------------------\n';
        description += '```fix\n' + ` Línea | Salida | Llegada | Duración ` + '```\n';
        for (let i = 0; i < schedules.length; i++) {
            const line = format(schedules[i].line, 7);
            const start = format(schedules[i].start, 8);
            const arrive = format(schedules[i].arrive, 9);
            const time = format(schedules[i].time, 10);
            const color = i % 2 === 0 ? '```\n' : '```yaml\n';
            const add = `${color}${line}|${start}|${arrive}|${time}` + '```\n';

            if (description.length + add.length > 2048) {
                const embed = new RichEmbed();
                embed.setColor(0x00AE86);
                embed.setDescription(description);

                if (!overflow) {
                    embed.setAuthor("Renfe Cercanias", "https://is5-ssl.mzstatic.com/image/thumb/Purple124/v4/be/8b/b3/be8bb3ba-9d52-48e2-7616-bbc304d4df5c/source/256x256bb.jpg");
                    embed.setTitle(`**${origin.name} --> ${destination.name}** (${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()})`);
                    embed.setURL(url);
                    overflow = true;
                }

                await this.send({ embed });

                description = add;
            } else description += add;
        }

        const embed = new RichEmbed();
        embed.setColor(0x00AE86);
        embed.setDescription(description);

        if (!overflow) {
            embed.setAuthor("Renfe Cercanias", "https://is5-ssl.mzstatic.com/image/thumb/Purple124/v4/be/8b/b3/be8bb3ba-9d52-48e2-7616-bbc304d4df5c/source/256x256bb.jpg");
            embed.setTitle(`**${origin.name} --> ${destination.name}** (${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()})`);
            embed.setURL(url);
        }

        return await this.send({ embed });
    }
}

module.exports = Cercanias;