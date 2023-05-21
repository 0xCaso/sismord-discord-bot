import express from 'express';
import { Client } from "discord.js";
import cors from "cors";
import { MasterRouter } from './routers';
import DiscordController from './controllers/DiscordController';

require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", MasterRouter);

app.listen(3333, () => {
  console.log('Server started on port 3333');
});

// Setup Discord bot
const client: Client = DiscordController.client;
client.login(process.env.DISCORD_BOT_TOKEN);

// const client: Client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// // username => boolean (if verified or not)
// const membersMap: Map<string, Map<string, GuildMember>> = new Map();

// client.once(Events.ClientReady, () => {
//   console.log(`Logged in as ${client.user?.tag}!`);
// });

// client.once(Events.GuildMemberAdd, async (member) => {
//   const server = membersMap.get(member.guild.id);

//   if(server){
//     server.set(member.user.tag, member);
//     console.log(`New member: ${member.user.tag}`);
//   } else {
//     console.log("New server with id: ", member.guild.id)
//     membersMap.set(member.guild.id, new Map([[member.user.tag, member]]));
//     console.log(`New member: ${member.user.username}`);
//   }
  
//   // membersMap.set(member.user.tag, member);
//   const channel = await member.createDM();
//   channel.send('Welcome to the server! Click the following link to verify your membership: http://localhost:3000?serverId='+member.guild.id+'&discordId='+member.user.tag);
// });

// app.post('/:id/verify', async (req, res) => {
//   console.log("Executing :id/verify")
//   const { discordId, zkConnectResponse } = req.body;
//   const serverId = req.params.id;

  
//   console.log(discordId, serverId)

//   try {
//     await zkConnect.verify(zkConnectResponse, {
//       authRequest,
//       claimRequest,  // not needed for anon auth
//     });
//     // const member = membersMap.get(server)?.get(discordId);
//     const server = membersMap.get(serverId);
//     if(server){
//       const member = server.get(discordId);
//       if (member) {
//         // retrieve the role from the member's guild
//         const role = member.guild.roles.cache.find(role => role.name === process.env.DISCORD_ROLE) as Role;
//         await member.roles.add(role);
//       } else {
//         throw new Error("Member not found");
//       }
      
//       res.status(200).send('Verification successful');
//     } else 
//       throw new Error("Server not found");

//   } catch (e) {
//     console.error(e);
//     res.status(400).send(e.message);
//   }
// });

// client.login(process.env.DISCORD_BOT_TOKEN);