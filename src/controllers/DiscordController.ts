import { Client, Events, GatewayIntentBits, GuildMember, MessageCollector, Role, Partials } from "discord.js";
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
        this._client = new Client({ 
            intents: [
                GatewayIntentBits.Guilds,   
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.DirectMessages
            ],
            partials: [
                Partials.Message,
                Partials.Channel
            ]
        });

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

            const channel = await member.createDM();
            channel.send('Welcome to the server! Chose the role you want to apply for:');
            let availableRoles = await this.getDiscordRoles(member.guild.id);
            channel.send(
                availableRoles?.join('\n') || 
                'No roles available, please contact the server owner.'
            )
            const collectorFilter = (m: any) => {
                return m.author.id === member.user.id;
            };
            channel.awaitMessages({ filter: collectorFilter, max: 1, time: 10000, errors: ['time'] })
                .then(message => {
                    let role = message.first()?.content
                    let toSend = 
                        'Click the following link to verify your membership: http://localhost:3000/user?serverId='
                        + member.guild.id
                        + '&userId='
                        + member.user.tag.replace('#', '%23')
                        + '&role='
                        + role;
                    channel.send(toSend);
                })
                .catch(_ => {
                    channel.send('No role selected, please contact the server owner.');
                });
        });
    }

    async changeServerStatus(serverId: string, userId: string, role: string, claims: any, sismoConnectResponse: SismoConnectResponse) {
        try {
            // the following call will throw an error if the response is not valid
            const result = await this._sismoController.verifyResponse(sismoConnectResponse, claims);
            console.log(result);

            // discord needs to instantiate the server first
            const server = this._membersMap.get(serverId);

            if(server){
                // retrieve the member from the server using his userId
                const member = server.get(userId);
                if (member) {
                    // retrieve the role from the member's guild
                    const roleObject = member.guild.roles.cache.find(cacheRole => cacheRole.name === role) as Role;
                    await member.roles.add(roleObject);
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