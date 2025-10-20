# Modular Discord.js Bot Template

<p>
  <img src="https://img.shields.io/badge/Node.js-grey?logo=node.js">
  <img src="https://img.shields.io/badge/Discord.js-grey?logo=discorddotjs">
  <img src="https://img.shields.io/badge/MongoDB-grey?logo=mongodb">
  <img src="https://img.shields.io/badge/🔬-Template_App-grey?labelColor=lightgrey">
</p>

A modular Discord bot template written in Node.js, powered by Discord.js and MongoDB.<br>
A dynamic and scalable bot featuring server-locked commands, role-based permissions, unified support for slash and plain message commands, and a modular structure designed for scalability and easy customization.

<details>
  <summary><h3>Content</h3></summary>
  
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Installation](#installation)
  - [1. Create a Discord Bot](#1-create-a-discord-bot)
    - [Minimal Required Permissions](#minimal-required-permissions)
  - [2. Set Up MongoDB](#2-set-up-mongodb)
  - [3. Environment Variables](#3-environment-variables)
  - [4. Configure Access File](#4-configure-access-file)
  - [5. Install Dependencies](#5-install-dependencies)
  - [6. Start the Bot](#6-start-the-bot)
  - [App Flags](#app-flags)
- [App Features](#app-features)
  - [Roles and Permissions](#roles-and-permissions)
  - [Server Locked Commands](#server-locked-commands)
  - [Slash and Plain Message Commands Support](#slash-and-plain-message-commands-support)
  - [Fully Modular](#fully-modular)
- [More in Depth](#more-in-depth)
  - [Configs and Database](#configs-and-database)
  - [Bot Loading Process \& Context](#bot-loading-process--context)
  - [Interaction Handling](#interaction-handling)
  - [Command Context Class](#command-context-class)
  - [Built-in Commands and Components](#built-in-commands-and-components)
  - [Built-in Utilities](#built-in-utilities)
  - [Adding New Files and Features](#adding-new-files-and-features)
  - [Logging and Error Handling](#logging-and-error-handling)
- [Acknowledgments](#acknowledgments)

</details>
<hr>

# Project Structure

A quick overview of the `src` folders:

- **commandContext/** - A command abstraction class. (see [Command Context](command_context.md) for details)
- **commands/** - Slash and context command declarations.
- **components/** - Declarations and logic for buttons and select menus.
- **config/** - Global configurations. (see [Configs and Database](configs_and_database.md))
- **events/** - Event listeners:
  - **client/** - Discord.js events.
  - **database/** - Mongoose events.
  - **process/** - Process events.
- **functions/** - Core functionality of the app:
  - **commands/** - The logic of the commands declared in `src/commands`.
  - **loaders/** - Handlers for the bot's loading process. (see [Bot Loading Process & Context](loading_process_and_context.md))
  - **runtime/** - Functions used during runtime:
    - **core/** - Core functions essential to the bot's functionality.
    - **services/** - Service functions.
  - **utils/** - General-purpose utility functions. (see [Built-in Utilities](built_in_utilities.md))
- **schemas/** - MongoDB schemas. (see [Configs and Database](configs_and_database.md))
- **app.js** - The app's bootstrapper. (see [Bot Loading Process & Context](loading_process_and_context.md))
- **index.js** - The app's entry point. (see [Bot Loading Process & Context](loading_process_and_context.md))

Outside the `src` folder:

- **templates/** - File templates for commands, components, schemas, and utilities.

# Dependencies

1. Node.js 22.14.0
2. npm 10.1.0

The app may work with other versions, but these are the versions that were used during development.

# Installation

## 1. Create a Discord Bot

Create a new application in the [Discord Developers Portal](https://discord.com/developers/applications) if you don't already have one.

### Minimal Required Permissions

**Privileged Gateway Intents**

_(In the Developer Portal -> `Bot` tab -> scroll down)_

- **Server Members Intent:** Required for member-based commands and role checks.
- **Message Content Intent:** Required for plain message commands.<br>
  _(Alternatively, you can disable plain message commands using the [`--no-messages`](#app-flags) flag.)_

**Invite Link Setup**

_(In the Developer Portal -> `OAuth2` tab -> scroll down)_

- **Scopes:**
  - `bot`
  - `applications.commands`
- **Bot Permissions:**
  - **Manage Roles** - allows the bot to give or remove roles.
  - **View Channels** - base permission.
  - **Send Messages** - enables the bot to reply to interactions.
  - **Embed Links** - required for embed messages.
  - **Attach Files** - allows the bot to send images or files.
  - **Read Message History** - required for replies and references.
  - **Add Reactions** - allows adding emoji reactions.
  - **Use Slash Commands** - base permission for slash commands.

Copy the generated URL and invite your bot to your testing server. For example:

```bash
https://discord.com/oauth2/authorize?client_id=<CLIENT_ID>&permissions=2416036928&integration_type=0&scope=bot+applications.commands
```

> [!NOTE]
> You can skip granular permission selection in personal bots and use the "Administrator" permission instead:
>
> ```bash
> https://discord.com/oauth2/authorize?client_id=<CLIENT_ID>&permissions=8&integration_type=0&scope=bot+applications.commands
> ```

## 2. Set Up MongoDB

Open a MongoDB project if you don't already have one.

> [!TIP]
> The [official MongoDB Atlas guide](https://www.mongodb.com/docs/atlas/getting-started/) walks you through creating a project, setting up a cluster, and connecting to your database.

## 3. Environment Variables

Create a `.env` file in the root directory of the project and paste your bot token and MongoDB connection string inside. It should look like this:

```bash
TOKEN=<Discord bot token>
DBURL=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DATABASE>?retryWrites=true&w=majority
```

## 4. Configure Access File

Create a document in your MongoDB database according to the schema in [`access.js`](configs_and_database.md#access-schema-accessjs).

> [!IMPORTANT]
> The `access.js` schema is critical for defining the bot's permissions and roles. Ensure that your **Discord account** and the bot's **testing server** IDs are included.

## 5. Install Dependencies

```
npm i
```

## 6. Start the Bot

Start `index.js`.

```
node .
```

## App Flags

The bot supports several optional app flags to customize its behavior during launch.<br>
Below is a list of the available flags:

**`--private`**

- Bot will only register commands in servers with **bot's owners**.
- For bot owners that want their bot to only operate in servers they're in.

**`--delete`**

- Unregister all commands from **all servers** (except global commands).
- Useful for removing all commands from the bot, such as deleting the test bot's commands to avoid clutter in the slash commands menu while it's offline.<br>
  (Intentionally keeps global commands since they take a while to refresh.)

**`--delete-global`**

- Unregister **global commands**.
- If for any reason you wish to delete those.

**`--silent`**

- Use **ephemeral** messages where possible.
- Useful for testing in servers where you worry about spam - note that responses to plain message commands **cannot** be ephemeral.

**`--guild-only`**

- Disable global commands in **DMs**.
- Don't want the bot to respond to commands in private messages? That's the flag for you.

**`--no-messages`**

- Disable messageCreate event (disables plain message commands).
- Useful for developers who cannot or prefer not to grant the bot the **MessageContent** permission.

---

For example:

```
node . --private --silent
```

The bot will only register commands in servers that have its owners, and will default to ephemeral responses for all slash commands and components.

# App Features

## Roles and Permissions

The bot uses a MongoDB access configuration to link user and guild IDs to role groups, such as "owner", "homeGuild", "friendGroup", and more.<br>
Each ID can belong to one or several groups. Learn more about roles in [Configs and Database](configs_and_database.md).

This role-based approach lets you precisely control the bot's behavior for each environment. These roles define <ins>who</ins> can use which commands and <ins>where</ins> those commands are available.

> [!NOTE]
> The role system effectively transforms the bot from a single global Discord bot into a multi-environment platform, adapting its permissions and visibility to each user or server.

## Server Locked Commands

The bot gives you fine-grained control over where each command is registered - allowing you to tailor its features to specific groups, servers, or contexts.

- **User role commands** - register only in guilds that have <ins>members</ins> from a specific role group.
- **Owner commands** - a stricter version of user role commands, available only where the bot's <ins>owner</ins>(s) are present.
- **Guild role commands** - register in <ins>guilds</ins> that belong to a specific role group.
- **Home guild commands** - a stricter version of guild role commands, available only in the the bot's "<ins>home</ins>" server(s) - typically used for testing.
- **Extra role commands** - register in guilds where the bot itself has a <ins>role</ins> with a predefined name.
- **Test commands** - register in the home guild <ins>only if</ins> the bot instance is marked as a "test" bot.

In addition, the bot supports:

- **Global commands** - get registered globally, defined not by folder but by command name.

Commands that don't match any of these conditions are "regular" by default - registered in all servers the bot is in, but not globally.

> [!NOTE]
> This flexible system allows keeping testing and production separate - but **more importantly** - you can create completely different sets of commands for different groups of people.
> You can think of it as giving every community its own version of the bot, each with access to exactly the commands they should have.

> [!IMPORTANT]
> Learn more about configuring **server-locked** folders and defining **global commands** in [Configs and Database](configs_and_database.md).

## Slash and Plain Message Commands Support

The bot supports both **slash commands** and **plain message commands**, handled through a unified Command Context class collection.

This abstraction converts `interactionCreate` and `messageCreate` events into the same type of class instance, so the command logic can stay simple and consistent regardless of how it was triggered.

In other words, you write one command - and it automatically works for <ins>both</ins> slash and plain message command calls.

> [!NOTE]
> More on the class [here](command_context.md).<br>
> More on how the events get handled [here](interaction_handling.md).

## Fully Modular

The entire app is built around modularity. Commands, components, and runtime features are all loaded dynamically, meaning you can add or update functionality without touching the core codebase.

To add a new command, simply drop the file into the appropriate folder.<br>
The bot will automatically parse it, extract its description, categorize it by folder, and link it to its logic. No imports, no hardcoding - just full flexibility.

> [!IMPORTANT]
> You can see templates for all the files that need to follow an explicit structure in `templates/`.<br>
> More on adding new files [here](adding_new_files.md).

# More in Depth

For a deeper understanding of the project, refer to the following detailed documentation files:

<img align="right" style="width:450px; height:auto;" src="https://github.com/user-attachments/assets/db69420f-9d5a-4fc4-802d-ca481b3185eb" />

### Configs and Database

- [Intro](configs_and_database.md)
- [MongoDB Schemas Overview](configs_and_database.md#mongodb-schemas-overview)
- [Global Configurations (src/config/)](configs_and_database.md#global-configurations-srcconfig)
- [Server-Locked Commands (config.js)](configs_and_database.md#server-locked-commands-configjs)
- [Context Commands (config.json)](configs_and_database.md#context-commands-configjson)

### Bot Loading Process & Context

- [Intro](loading_process_and_context.md)
- [Bot Loading Process](loading_process_and_context.md#bot-loading-process)
- [Context Structure](loading_process_and_context.md#context-structure)

### Interaction Handling

- [Intro](interaction_handling.md)
- [Interaction Create](interaction_handling.md#interaction-create)
- [Message Create](interaction_handling.md#message-create)

### Command Context Class

- [Intro](command_context.md)
- [Instance Creation](command_context.md#instance-creation)
- [Public Methods](command_context.md#public-methods)
- [Helper Functions](command_context.md#helper-functions)

### Built-in Commands and Components

- [Intro](built_in_commands.md)
- [Global Commands](built_in_commands.md#global-commands)
- [Owner Commands](built_in_commands.md#owner-commands)
- [Test Commands](built_in_commands.md#test-commands)
- [Help Command `help()`](built_in_commands.md#help-command-help)
- [Context Commands](built_in_commands.md#context-commands)
- [Buttons](built_in_commands.md#buttons)

### Built-in Utilities

- [Intro](built_in_utilities.md)
- [Builder Utilities (builders/)](builder_utilities.md)
- [Access Utilities (accessUtils.js)](built_in_utilities.md#access-utilities-accessutilsjs)
- [File Utilities (fileUtils.js)](built_in_utilities.md#file-utilities-fileutilsjs)
- [Message Utilities (messageUtils.js)](built_in_utilities.md#message-utilities-messageutilsjs)
- [Parse Utilities (parseUtils.js)](built_in_utilities.md#parse-utilities-parseutilsjs)
- [Text Utilities (textUtils.js)](built_in_utilities.md#text-utilities-textutilsjs)
- [Time Utilities (timeUtils.js)](built_in_utilities.md#time-utilities-timeutilsjs)
- [Validator Utilities (validatorUtils.js)](built_in_utilities.md#validator-utilities-validatorutilsjs)

### Adding New Files and Features

- [Intro](adding_new_files.md)
- [New Slash Command](adding_new_files.md#new-slash-command)
- [New Context Menu Command](adding_new_files.md#new-context-menu-command)
- [New Component (Button/Select Menu)](adding_new_files.md#new-component-buttonselect-menu)
- [New Runtime Function](adding_new_files.md#new-runtime-function)
- [New Utility Function](adding_new_files.md#new-utility-function)
- [New Schema](adding_new_files.md#new-schema)
- [New Event Listener](adding_new_files.md#new-event-listener)

### Logging and Error Handling

- [Intro](logging_and_error_handling.md)
- [Log Channel](logging_and_error_handling.md#log-channel)
- [Logs](logging_and_error_handling.md#logs)
- [Loading Logs (logTime)](logging_and_error_handling.md#loading-logs-logtime)
- [Error Handling](logging_and_error_handling.md#error-handling)

# Acknowledgments

This template was inspired by various Discord.js tutorials and resources.

Notably, `Fusion Terror`'s Discord.js v14 tutorial series on YouTube provided the foundation for the bot's core structure. Unfortunately, the series is no longer available.

Additionally, `Nathaniel-VFX`'s [Discord.js-v14-Command-Handlers](https://github.com/Nathaniel-VFX/Discord.js-v14-Command-Handlers) repository inspired the implementation of the loading log tables. Their repository offers a more lightweight but still modular bot structure - check it out for an alternative approach.
