# Sismord Bot

<div align="center">
  <img src="src/discordchads.svg" alt="Logo" width="150" height="150" style="borderRadius: 20px">

  <h3 align="center">
    Sismord
  </h3>

  <p align="center">
    Made by <a href="https://github.com/0xCaso" target="_blank">0xCaso</a> & <a href="https://github.com/mmatteo23" target="_blank">mmatteo23</a></a>
  </p>
  
  <p align="center">
    <a href="https://discord.gg/jm2TWpTY" target="_blank">
        <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white"/>
    </a>
  </p>
  <a href="https://www.sismo.io/" target="_blank"></a>
</div>

## Local setup

To execute the whole application locally, there are two paths:

### Ways to run the whole application
1. Create your own Discord bot and server, and fill the `.env` file with your values. To do so, follow the instructions in the [Discord Developer Portal](https://discord.com/developers/docs/intro) and create an [application](https://discord.com/developers/applications) with a bot (the bot should be able to manage roles and send messages). You should also add a specific role in the server, which should match the role added by the Sismord bot (you have to set its name inside the `.env` file).
2. Contact us and we will provide you with a bot token and a server ID. You can then fill the `.env` file with the provided values.

### Steps to run the bot locally
The steps to run the bot are the following:
1. Clone the [Sismord frontend repository](https://github.com/mmatteo23/sismord-frontend) (follow the readme instructions to set up the bot).
2. Clone this repository and install the dependencies:
    ```bash
    git clone https://github.com/0xCaso/sismord-discord-bot
    cd sismord-discord-bot
    yarn
    ```
3. Create the `.env` file and fill it with the correct values:
    ```bash
    cp .env.example .env
    ```
4. Run the Sismord frontend (follow its readme instructions)
5. Run the Sismord bot:
    ```bash
    yarn start
    ```
### Manual testing
Now you're ready to test the application. You can follow these steps:
1. Join the Discord server using the invite link (if you are following the 2nd path, our test discord channel is [here](https://discord.gg/jm2TWpTY), otherwise you have to join the server you created).
2. The bot will send you a message asking which is the role you want to get.
3. Reply with the role (example: chad) and the bot will send you a link to the frontend: click it.
4. Follow the sismoConnect flow to verify your identity.
5. Go back to the Discord channel and you should see a new role assigned to you (in case you followed the 2nd path, you should see the `chad` role, and a channel accessible only if you have that role).