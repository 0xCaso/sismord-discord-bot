// Load environment variables from .env file
require('dotenv').config();

// Import Discord.js library
const { Client, Events, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Listen for the "ready" event, which is triggered when the bot is connected
client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for the "guildMemberAdd" event, which is triggered when a new user joins the server
client.once(Events.GuildMemberAdd, async (member) => {
  // Create a private channel with the new user
  const channel = await member.createDM();
  
  // Send a welcome message to the new user
  channel.send('Welcome to the server! Click the following link to verify your membership: http://localhost:3000');
});

// Log in to the Discord API with the bot token
client.login(process.env.DISCORD_BOT_TOKEN);
