require('./keys');

const commands = require('./commands');
const { Client } = require('discord.js')
const client = new Client();

client.on('ready', () => {
    console.log(`Bot is ready ${client.user.tag}`);
});

client.on('message', async message => {
    const validCommand = await commands(message);
    if (validCommand)
        console.log("COMANDO!");
});

client.login(process.env.DISCORD_TOKEN);