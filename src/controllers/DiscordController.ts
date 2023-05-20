import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { SismoController } from ".";
import { SismoConnectResponse } from "@sismo-core/sismo-connect-server";
import fs from "fs-extra";
import { ServerSettings } from "../utils/types";

console.log("Checking if db folder exists")
if (!fs.existsSync('./db')) fs.mkdirSync('db');
if (!fs.existsSync('./db/groups.json')) fs.writeFileSync('./db/groups.json',"{}");
if (!fs.existsSync('./db/servers.json')) fs.writeFileSync('./db/servers.json',"{}");

class DiscordController {
    private _client: Client | undefined;
    private _membersMap: Map<string, Map<string, GuildMember>> = new Map();
    private _sismoController = SismoController;

    constructor() {
        this.clientSetup();
    }

    public get client(): Client {
        if (!this._client) {
            throw new Error("Client not initialized");
        }
        return this._client;
    }

    private clientSetup() {
        this._client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

        this._client.once(Events.ClientReady, () => {
            console.log(`Logged in as ${this._client?.user?.tag}!`);
        });

        this._client.once(Events.GuildMemberAdd, async (member) => {
            const server = this._membersMap.get(member.guild.id);

            if (server) {
                server.set(member.user.tag, member);
                console.log(`New member: ${member.user.tag}`);
            } else {
                console.log("New server with id: ", member.guild.id)
                this._membersMap.set(member.guild.id, new Map([[member.user.tag, member]]));
                console.log(`New member: ${member.user.username}`);
            }

            // membersMap.set(member.user.tag, member);
            const channel = await member.createDM();
            channel.send('Welcome to the server! Click the following link to verify your membership: http://localhost:3000?serverId=' + member.guild.id + '&discordId=' + member.user.tag);
        });
    }

    async doSomething(sismoConnectResponse: SismoConnectResponse) {
        const result = await this._sismoController.verifyResponse(sismoConnectResponse);
        console.log(result);

        return result;
    }

    async setServer(owner: string, serversData: ServerSettings) {
        try {
            const tmp = await fs.readJson('./db/servers.json') 
            tmp[owner] = [serversData];
            
            await fs.writeJson(
                './db/servers.json',
                tmp
            )

            return {
                result: true
            };
        } catch (error) {
            console.error(error)
            throw error;
        }
    }

    async getServersByOwner(ownerId: string) {
        try {
            const result = await fs.readJson('./db/servers.json')
            return result[ownerId]
        } catch (error) {
            return error;
        }
    }
}

export = new DiscordController();