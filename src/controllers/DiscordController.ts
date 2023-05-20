import { Client, Events, GatewayIntentBits, GuildMember, Role } from "discord.js";
import { SismoController } from ".";
import { SismoConnectResponse } from "@sismo-core/sismo-connect-server";
import fs from "fs-extra";
import { ClaimsPerRole, ServerClaim, ServerSettings } from "../utils/types";

console.log("Checking if db folder exists")
if (!fs.existsSync('./db')) fs.mkdirSync('db');
if (!fs.existsSync('./db/groups.json')) fs.writeFileSync('./db/groups.json',"{}");
if (!fs.existsSync('./db/servers.json')) fs.writeFileSync('./db/servers.json',"{}");

class DiscordController {
    private _client: Client | undefined;
    // serverId (SERVER) -> discordId (MEMBER) -> GuildMember
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

    async changeServerStatus(serverId: string, discordId: string, sismoConnectResponse: SismoConnectResponse) {
        
        try {
            // the following call will throw an error if the response is not valid
            const result = await this._sismoController.verifyResponse(sismoConnectResponse);
            console.log(result);

            // discord needs to instantiate the server first
            const server = this._membersMap.get(serverId);
            if(server){
                // retrieve the member from the server using his discordId
                const member = server.get(discordId);
                if (member) {
                    // retrieve the role from the member's guild
                    const role = member.guild.roles.cache.find(role => role.name === process.env.DISCORD_ROLE) as Role;
                    await member.roles.add(role);
                } else {
                    throw new Error("Member not found");
                }
            } else {
                throw new Error("Server not found");
            }

            return true;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async setServer(owner: string, serversData: ServerSettings) {
        try {
            const tmp = await fs.readJson('./db/servers.json') 
            tmp[owner] = serversData;
            
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
            throw error;
        }
    }

    async getDiscordRoles(serverId: string) {

        const serverObject = await this._client?.guilds.fetch(serverId);
        
        const roles = serverObject?.roles.cache

        const rolesArray = roles?.map(role => {
            return role.name
        })

        return rolesArray
    }

    async getServerOwner(serverId: string) {
        const serverObject = await this._client?.guilds.fetch(serverId);
        const owner = await serverObject?.fetchOwner()
        console.log(owner?.user.username)
        return {
            nickname: owner?.user.username as string,
            id: owner?.user.id as string
        }
    }

    async getServerGroupIds(serverId: string, role: string) {

        const owner = await this.getServerOwner(serverId)
        const servers = await fs.readJson('./db/servers.json')
        
        if(servers[owner.nickname]){
            const server = servers[owner.nickname].find((server: ServerSettings) => server.id == serverId)
            console.log(server)
            if(server){
                const claimsPerRole = server.claims.find((claim: ClaimsPerRole) => claim[role])
                console.log(claimsPerRole)
                return claimsPerRole?.[role]
            } else {
                throw new Error("Server not found")
            }
        } else {
            throw new Error("Owner not found")
        }

    }
}

export = new DiscordController();