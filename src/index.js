require('./keys');

const commands = require('./commands');
const { Client } = require('discord.js')
const client = new Client();

client.on('ready', () => {
    console.log(`Bot is ready ${client.user.tag}`);
});

client.on('message', async message => {
    const reply = await commands(message);
    if (reply && reply.hasErrors()) {
        console.log("ERRORES:");
        for (const error of reply.errors)
            console.log(error.message);
    }
});

client.login(process.env.DISCORD_TOKEN);