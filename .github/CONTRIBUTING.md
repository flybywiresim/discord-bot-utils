# Contributing Guide

Please reference the information below when contributing to this repository.

## Welcome

Welcome to the FlyByWire Simulations Discord bot repository. Thank you for your interest in contributing to the project. Full details and guidelines on how to ensure this project is managed are included below.

## Helping others

Please help other contributors to the project wherever you can, as people all start somewhere. If you require assistance or wish to provide assistance you can ask/answer questions in the #discord-bot or #dev-support channel on [discord](https://discord.gg/flybywire).

## Prerequisites

- [node](https://nodejs.org/) version >= 18.x

## Ground Rules

To ensure that commands are written professionally and clearly, please follow the guide below:

- Use the proper name for third party services. For example: simBrief and not SimBrief.
- If you are using images within the command, please ensure that they are clear and easy to understand.
- Refrain from using exclamation points unless it is a warning.
- Ensure that the contents of the command are correct. If you are unsure if something is correct please speak to any bot developer, and they will be able to verify anything.
- Ensure that grammar and spelling is correct.

## Pull Request Process

Reminder: When submitting a pull request, please ensure you target the `staging` branch.

1. Fork the repository.
2. Clone to your local system using your IDE of choice.
3. Make a new branch from staging and name appropriately (e.g. feat: added ADIRS command, fix: typos fixed in ADIRS).
4. Create/edit the command you are working on.
5. Test your build locally.
6. Create a PR to merge your changes into staging.

Note: It may be beneficial to create a draft PR while working on your command. This will allow us to see who is working on what, and will enable the community to give active feedback on your work.

## Pull Request Template

You can find the pull request template [here](PULL_REQUEST_TEMPLATE.md).

## Using different configurations

The `config` folder contains the configuration details for running the bot in the staging or production environment.

The config contains different variables and settings which are used by the bot to reference channels, check permissions, use colors, etc. All these values are defined based on the Discord server the bot will connect to and are unique to that server.

You can create your own config json file by copying one of the existing ones and updating the different constants/settings with your own values. This allows you to run the bot in your own environment without having to recompile it from the source.

### How to use a config

The config system uses the great [node-config](https://github.com/node-config/node-config) library.

This library will load a file from the `config` folder, based on an environment variable. It can read several types of files, including json, yaml, properties, toml, xml and more. For this bot, the standard is JSON, but nothing stops you from using your own format during development.

### Setting up the config

1. Create a file named `dev.json` at [../config/](../config/).
2. Copy the contents of [../config/staging.json](../config/staging.json).
3. Change the `guildId` field to your server's ID.
4. Change the channel and role IDs to your own IDs (optional).
5. In your `.env` file set `NODE_CONFIG_ENV` to `dev`.

> [!IMPORTANT]
> THIS NOTE SHOULD CONTAIN INSTRUCTIONS ON HOW TO INCORPORATE NEW CODE INTO THE OFFICIAL CONFIGS

## Setting up the Bot

1. Log into the Discord website and navigate to the [applications page](https://discord.com/developers/applications).
2. Click `New Application`.
3. Give your application a name.
4. Navigate to the `Bot` tab and click `Add Bot`. You will have to confirm by clicking `Yes, do it!`.
5. Click the `Copy` button underneath token. (Do not share this).
6. Copy the `.env.example` file and rename it to `.env`.
7. Inside the .env file, type `BOT_SECRET=TOKEN` replacing TOKEN with what you copied in `step 6.`

## Setting Up Privileged Gateway Intents

Privileged Gateway Intents must now be enabled within the Discord Developer Portal in order for your bot to function. The steps below will explain how to enable them.

1. Log into the Discord website and navigate to the [applications page](https://discord.com/developers/applications) and select your application. Then select `Bot` under `Settings`
2. Scroll down to the Privileged Gateway Intents section and enable all the intents.

### Inviting the Bot to Your Server

1. Create a Discord server where you can test your bot.
2. On the [applications page](https://discord.com/developers/applications), select your application and navigate to the `OAuth2` tab. Then select `bot` under the `scopes` section.
3. Tick `Administrator` box under the `Bot Permissions` section.
4. Click the `Copy` button and paste it into your search bar in the browser of choice, and invite it to your test server.

## Running the Bot

We recommend running your bot with the development node environment. Set `NODE_ENV=development` in your `.env` file.

1. Run `npm install` to install the dependencies.
2. Run `npm run dev` to start the development build.

### Running the Bot for the first time and deploying commands

When running the bot for the first time, it is important to set `DEPLOY=true` in your `.env`. This will ensure that commands are registered with Discord. Once the bot has been run once, you can set `DEPLOY=false` to prevent the bot from re-deploying commands every time it starts.

If you need to re-deploy commands after making changes, you can run the `/deploy-command` command in Discord.

Please note: If you are running the bot in a development environment, your commands will be deployed to the guild you have set in your [config file](https://github.com/fbw-devops/fbw-moderation-bot/blob/master/.github/CONTRIBUTING.md#using-different-configurations) (likely your test server). If running in a production environment, your commands will be deployed globally.

When deploying guild commands, they are registered and available immidiately. However, global commands can take up to an hour to be registered and available.

## Database Setup

### MongoDB

Some commands require access to a MongoDB server to store persistence data. The steps below outline MongoDB's setup procedure, and the necessary steps to
connect your application to your MongoDB instance.

1. Install MongoDB from [their website](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/) or set up an [Atlas cluster](https://www.mongodb.com/cloud/atlas/lp/try2).
2. If running MongoDB locally, run it [as a service](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/#run-mongodb-community-edition-as-a-windows-service) or [from the terminal](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/#run-mongodb-community-edition-from-the-command-interpreter).
3. Create a new database named fbw in your MongoDB instance.
4. Inside the .env file, on a new line type `MONGODB_URL=URL` replacing URL with your MongoDB access URL.

If you have installed MongoDB locally, your access url will be `mongodb://localhost:27017/fbw`. If you are using Atlas, the connection URL can be found under
`Connect->Connect your application` in Database, located under Deployments.

### MongoDB with Docker

This is a guide on how to set up a MongoDB instance with Docker.

1. Install Docker from [their website](https://www.docker.com/get-started/) and read the guide on how to get started if unsure how to use.
2. In the .env file, on a new line type `MONGODB_URL=URL` replacing URL with your MongoDB access URL.
3. In the .env file, on a new line type `MONGODB_DATABASE=DATABASE_NAME` replacing DATABASE with your MongoDB database name.
4. In the .env file, on a new line type `MONGODB_USERNAME=USER_NAME` replacing USER with your MongoDB username.
5. In the .env file, on a new line type `MONGODB_PASSWORD=PASSWORD` replacing PASSWORD with your MongoDB password.
6. To run the docker-compose file, run `docker-compose up -d` this will start the MongoDB instance along with mongo-express to view the DB.
7. To stop the container run `docker-compose down`.
8. The volumes will be created in the `/data` directory.

The`MONGODB_URL` will be `mongodb://USERNAME:PASSWORD@localhost:27017/DATABASE_NAME?authSource=admin`.

You can access mongo-express by visiting [localhost:8081](http://localhost:8081/).

## Environment Variables

If your command requires environment variables please add them to the `.env.example` file for documentation.

1. Copy the `.env.example` file to `.env`.
2. You can do this manually or using the command line by typing `cp .env.example .env`.
3. Fill out the `.env` file with your environment variables.

### Ban Appeal Form

A ban appeal form is sent to a user when they are banned. The URL for the form is stored as an environment variable, `BAN_APPEAL_URL`. For testing, you could set to a URL like `https://flybywiresim.com/`.

## Tokens

Some commands may require additional tokens. If you would like to test them out on your bot, you must include the tokens inside your .env file. These commands include the metar, station and Wolfram Alpha commands. The steps below will explain how to set this up.

### AVWX (Metar, TAF and Station)

1. Make a free account [here](https://avwx.rest/). Then, follow the steps [here](https://account.avwx.rest/getting-started) to get your token.
2. Inside the .env file, on a new line type `METAR_TOKEN=TOKEN` replacing TOKEN with what you copied in `step 1`.
3. Then, on another new line within the .env file, type `STATION_TOKEN=TOKEN` replacing TOKEN with what you copied in `step 1`.
4. Then, on another new line within the .env file, type `TAF_TOKEN=TOKEN` replacing the TOKEN with what you copied in `step 1`.

### Wolfram Alpha

1. Select get API access [here](https://products.wolframalpha.com/api/) to create an account.
2. Once you have an account you will need to get an AppID from [here](https://developer.wolframalpha.com/portal/myapps/).
3. Inside the .env file, on a new line type `WOLFRAMALPHA_TOKEN=TOKEN` replacing TOKEN with your wolfram alpha AppID.

## Adding a New Command

>Please note, this will only show the basics of adding a command.

1. Create a new file in the relevant folder within `src/commands/` and name it appropriately. `yourcommand.ts`.
2. Create your command.
3. Add it to `src/commands/index.ts`. You need to add the line `import name from './commandfolder/filename';`, replacing `name` with the file name from your command, `commandfolder` with the relevant folder your command has been placed within, and `filename` with the file name you created in `step 1` (Add this below the last command). Please note: context commands have their own `index.ts` file withing the `src/commands/context/` folder.
4. Add changes to `.github/CHANGELOG.md` and add command to `.github/command-docs.md`.

If you need help creating a command, you may find it useful to copy an existing command as a template, changing what you need.

> ### Considerations
>
> - Choose user-friendly command names.
> - Test your build locally before submitting as ready for review.

## Modifying a Command

1. All you need to do is open the command you wish to edit in `src/commands/` and edit what you need.
2. Add changes to `.github/CHANGELOG.md` (and `.github/command-docs.md` if necessary).
3. Commit and Push.

## Example Slash Commands

The basic structure of such a command looks similar to this example:

```ts
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
    name: 'ping',
    description: 'Ping the bot for a response.',
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER, //Optional command permission - always use MANAGE_SERVER and add a comment to specify overrides needed (roles, channels etc.)
    dm_permission: false, // Optional, this sets if commands can be run in DMs (global commands only)
    options: [{ // Optional, this is where you can add options to your command
        name: 'message',
        description: 'Provide some text to send back.',
        type: ApplicationCommandOptionType.String,
        max_length: 100,
        required: false,
    }],
});

export default slashCommand(data, async ({ interaction }) => {
    const msg = interaction.options.getString('message') ?? 'Pong 🏓';

    const pongEmbed = makeEmbed({ description: msg });

    return interaction.reply({ embeds: [pongEmbed] });
});
```

## Command Permissions

By default, all commands can be used by anyone, everywhere.

If you want to restrict a command to a specific role or channel, you can add the `default_member_permissions` property to the command structure, and set it to `constantsConfig.commandPermission.MANAGE_SERVER` (this is the permission we use as only Admins hold this permission). This will prevent the command from being used by anyone, unless they have the `MANAGE_SERVER` permission.

Once your command is deployed, you can then go to your server settings, integrations and select your bot. Select the command you wish to change the role and channel permissions for and set permissions accordingly.

We ask that if you are submitting a pull request that you add a comment to the `default_member_permissions` property to specify what permissions are needed to use the command. This will allow us to easily change and keep track of the permissions required when deploying the command.

Using this permission system enables us to easily change the permissions required to use a command, without having to change any code.
