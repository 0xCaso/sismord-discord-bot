require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

// Start the express server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// username => boolean (if verified or not)
const membersMap = [];

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.once(Events.GuildMemberAdd, async (member) => {
    membersMap[member.user.username] = false;
    const channel = await member.createDM();
    channel.send('Welcome to the server! Click the following link to verify your membership: http://localhost:3000');
});

app.post('/verify', (req, res) => {
    const { username } = req.body;
    membersMap[username] = true;
    client.users.cache.find((user) => user.username === username).send('You have been verified!');
    res.send('OK');
});

client.login(process.env.DISCORD_BOT_TOKEN);
