import { Client, Events, GatewayIntentBits, GuildMember } from "discord.js";
import { SismoController } from ".";
import { SismoConnectResponse } from "@sismo-core/sismo-connect-server";
import fs from "fs-extra";

if (!fs.pathExists('./db')) fs.mkdirSync('db')
if (!fs.existsSync('./db/groups.json')) fs.writeFileSync('./db/groups.json',"{}")
if (!fs.existsSync('./db/owners.json')) fs.writeFileSync('./db/owners.json',"{}")

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

    async setGroupIds(serverId: string, groupIds: string[]) {
        try {
            const tmp = await fs.readJson('./db/groups.json')
            tmp[serverId] = groupIds;
            
            await fs.writeJson(
                './db/groups.json',
                tmp
            )

            console.log('success!')
            return {
                result: true
            };
        } catch (error) {
            console.error(error)
            throw error;
        }
    }

    async getGroupsIds(serverId: string) {
        try {
            const result = await fs.readJson('./db/groups.json')
            return {
                groups: result[serverId]
            };
        } catch (error) {
            return error;
        }
    }

    async setServerIds(ownerId: string, serverIds: string[]) {
        try {
            const tmp = await fs.readJson('./db/servers.json')
            tmp[ownerId] = serverIds;
            
            await fs.writeJson(
                './db/servers.json',
                tmp
            )

            console.log('success!')
            return {
                result: true
            };
        } catch (error) {
            console.error(error)
            throw error;
        }
    }

    async getServerIds(ownerId: string) {
        try {
            const result = await fs.readJson('./db/servers.json')
            return {
                servers: result[ownerId]
            };
        } catch (error) {
            return error;
        }
    }
}

export = new DiscordController();