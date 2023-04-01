import express from 'express';
import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { ZkConnect, ZkConnectServerConfig, AuthType } from '@sismo-core/zk-connect-server';

require('dotenv').config();
const app = express();

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
const membersMap: Map<string, GuildMember> = new Map();

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.once(Events.GuildMemberAdd, async (member) => {
    membersMap.set(member.user.username, member);
    const channel = await member.createDM();
    channel.send('Welcome to the server! Click the following link to verify your membership: http://localhost:1234/');
});

app.post('/verify', async (req, res) => {
    const { discordId, zkConnectResponse } = req.body;
    try {
        await zkConnect.verify(zkConnectResponse, {
          authRequest,
          claimRequest,  // not needed for anon auth
        });
        const member = membersMap.get(discordId);
        if (member) {
            member.roles.add("chad");
            res.status(200).send('Verification successful');
        } else {
            throw new Error("Member not found");
        }
    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
        return;
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);