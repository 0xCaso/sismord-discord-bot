import express from 'express';
import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { ZkConnect, ZkConnectServerConfig, AuthType } from '@sismo-core/zk-connect-server';
import cors from "cors";
import { Role } from 'discord.js';

require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

const zkConnectConfig: ZkConnectServerConfig = {
  appId: process.env.SISMO_APP_ID || "",
  devMode: {
    enabled: process.env.DEV_MODE === "LOCAL",
  }
}

const zkConnect = ZkConnect(zkConnectConfig);

const claimRequest = {
  groupId: process.env.SISMO_GROUP_ID || "",
};
const authRequest = {
  authType: AuthType.ANON,
};

app.listen(3333, () => {
  console.log('Server started on port 3333');
});

const client: Client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// username => boolean (if verified or not)
const membersMap: Map<string, Map<string, GuildMember>> = new Map();

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.once(Events.GuildMemberAdd, async (member) => {
  const server = membersMap.get(member.guild.id);

  if(server){
    server.set(member.user.tag, member);
    console.log(`New member: ${member.user.username}`);
  } else {
    console.log("New server with id: ", member.guild.id)
    membersMap.set(member.guild.id, new Map([[member.user.tag, member]]));
    console.log(`New member: ${member.user.username}`);
  }
  
  // membersMap.set(member.user.tag, member);
  const channel = await member.createDM();
  channel.send('Welcome to the server! Click the following link to verify your membership: http://localhost:1234/');
});

app.post('/:id/verify', async (req, res) => {
  const { discordId, zkConnectResponse } = req.body;
  const serverId = req.params.id;

  console.log(discordId, serverId)

  try {
    await zkConnect.verify(zkConnectResponse, {
      authRequest,
      claimRequest,  // not needed for anon auth
    });
    // const member = membersMap.get(server)?.get(discordId);
    const server = membersMap.get(serverId);
    if(server){
      const member = server.get(discordId);
      if (member) {
        // retrieve the role from the member's guild
        const role = member.guild.roles.cache.find(role => role.name === "chad") as Role;
        await member.roles.add(role);
      } else {
        throw new Error("Member not found");
      }
      
      res.status(200).send('Verification successful');
    } else 
      throw new Error("Server not found");

  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);