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
