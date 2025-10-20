# Configs and Database

The project supports several types of configuration files that allow you to customize the bot's behaviour.

<details>
  <summary><h3>Content</h3></summary>
  
- [MongoDB Schemas Overview](#mongodb-schemas-overview)
  - [Access Schema (access.js)](#access-schema-accessjs)
  - [Profile Schema (profile.js)](#profile-schema-profilejs)
- [Global Configurations (src/config/)](#global-configurations-srcconfig)
  - [constants.js](#constantsjs)
  - [info.json](#infojson)
  - [labels.js](#labelsjs)
- [Server-Locked Commands (config.js)](#server-locked-commands-configjs)
- [Context Commands (config.json)](#context-commands-configjson)

</details>
<hr>

# MongoDB Schemas Overview

New schemas can be freely added in `src/schemas`. (see [Adding New Files](adding_new_files.md#new-schema))<br>
Additionally, there are two schema files built into the app:

## Access Schema (access.js)

- **IDs**: The IDs of users and guilds relevant to the bot's behaviour.
- **Aliases**: Alternative names for servers, used in logs.

An example of how an access document could look:

```json
 "IDs": [
    {
      "label": "OWNER_ID",
      "value": "<Discord user ID>",
      "roles": [ "owner", "friendGroup" ],
      "idType": "user"
    },
    {
      "label": "FRIEND_1",
      "value": "<Discord user ID>",
      "roles": [ "friendGroup" ],
      "idType": "user"
    },
    {
      "label": "HOME_GUILD",
      "value": "<Discord server ID>",
      "roles": [ "homeGuild" ],
      "idType": "guild"
    },
    {
      "label": "FRIEND_GUILD",
      "value": "<Discord server ID>",
      "roles": [ "friendGuild" ],
      "idType": "guild"
    },
    {
      "label": "OTHER_ID_TYPE",
      "value": "<Non user/guild ID>",
    },
  ],
  "Aliases": [
    { "label": "<Discord server ID>", "value": "<alias for the server name>" }
  ]
```

The data from this document can be accessed throughout the app using the `info` object:

- IDs - `info[<ID label>]`.
- Aliases - `info.Aliases[<Alias label>]`.

> [!NOTE]
> Aliases are optional but useful for servers with long or unusual names that might clutter the logs.

> [!TIP]
> You can add more fields to this file and the fields will automatically get parsed into `info`, check the comments in [access.js](../src/schemas/access.js) to configure the format of how they will be parsed.

## Profile Schema (profile.js)

- **botID**: The client's ID, used to store separate profiles for the test and production bots.
- **botLabel**: Lets the bot identify itself ("test", "main", etc).
- **presence**: Bot's status. (can be updated via [/manage presence](built_in_commands.md#manage-presence))
- **loginTime**: The time when the bot went online. (gets updated automatically)
- **loadCommandsTime**: The time when the commands were last registered. Helps ensure that they don't get re-registered too often. (gets updated automatically)
- **extraRole** (optional): The role the bot must have in a guild to register "extra" commands. (can be updated via [/manage extra update](built_in_commands.md#manage-extra-update))
- **logChannel** (optional): The ID of the Discord channel to send logs and errors to. (can be updated via [/manage log-channel update](built_in_commands.md#manage-log-channel-update))

An example of how a profile document could look:

```json
{
  "botID": "<Discord client ID>",
  "botLabel": "test",
  "presence": {
    "activityType": 2,
    "activity": "commands",
    "status": "online"
  },
  "loadCommandsTime": "<Date>",
  "loginTime": "<Date>",
  "extraRole": "[extra]",
  "logChannel": "<Discord channel ID>"
}
```

> [!NOTE]
> A default profile will be created if there's none existing for the bot.

# Global Configurations (src/config/)

The app has 3 built in configuration files:

## constants.js

Enums, custom labels for Discord enums, bot's state options:

- `CONTEXT_ORIGINS` – labels for the event that created a command context (`InteractionCreate`, `MessageCreate`, `HelpMessageCreate`).
- `CONTEXT_TYPES` – names for command types (`ChatInput`, `ContextMenu`, `Button`, `PlainMessage`, etc).
- `TYPE_LABELS` - maps Discord's `ApplicationCommandOptionType` to human-readable option type names.
- `CHANNEL_LABELS` - maps Discord's `ChannelType` to readable channel type names.
- `ACTIVITY_LABELS` - maps Discord's `ActivityType` to readable activity type names.
- `STATUS_LABELS` - maps Discord's `PresenceUpdateStatus` to readable status type names.
- `STATE_CONFIG` - defines activity, status, and success/error messages for each bot state (`maintenance`, `sleep`, `active`).

> [!NOTE]
> See [src/config/constants.js](../src/config/constants.js) for the full reference.

## info.json

Defines user-facing messages and default display values:

- `color` – default colors used across embeds and containers.
- `deny` – messages shown when users lack required permissions.
- `errors` – user-friendly error messages for common failure cases.
- `about` – description text used for the [/bot about](built_in_commands.md#bot-about) command.

> [!NOTE]
> See [src/config/info.json](../src/config/info.json) for the full reference.<br>
> You can freely adjust the colors and messages to customize your bot's personality.

## labels.js

Definitions of key identifiers - super user roles, names of commands to `register globally`, names of `server locked` command folders and the name of the test commands folder.

```js
ownerRole: "owner", //bot's owner role
homeRole: "homeGuild", //bot's testing server role
testLabel: "test", //default label of the test bot

globalCommandNames: ["bot"], //top-level names of commands that should register globally
lockedFolderNames: ["serverLocked"], //folders that store server-locked commands
testFolderName: "test", //folder with test commands
```

# Server-Locked Commands (config.js)

Server-locked folders must include a `config.js` file that defines the checks required for the commands in the folder to be registered in a guild.

```
<Folder name>: async (guild) => <check function>
```

For example, the file could look like this:

```js
//register in servers with bot's owners
owner: async (guild) => utilsLib.guildHasOwners(guild),

//register in bot's testing server
homeGuild: async (guild) => utilsLib.checkHomeGuild(guild?.id),

//register where bot has "extra" role
extraRole: async (guild) => utilsLib.hasExtraInGuild(guild),

//register in "otherGuild" guild group
otherGuild: async (guild) => utilsLib.checkGuild(guild?.id, "otherGuild"),

//register in servers with members with "friendGroup" role
friends: async (guild) => utilsLib.guildHasRoleUsers(guild, "friendGroup"),

//register in all servers if test bot
inProgress: async (guild) => utilsLib.isTestBot(),
```

You do not need to define a check for the test commands folder, as its name is specified in `labels.js` and the check is added automatically.

> [!TIP]
> View a working example in [src/commands/serverLocked/config.js](../src/commands/serverLocked/config.js).

# Context Commands (config.json)

Context commands don't natively support descriptions, making it impossible to get their descriptions programmatically.<br>
For this reason, any folder containing context commands must include a `config.json` file with the command's description.

```json
"<Context command name>": "command description"
```

If a slash command and a context command perform the same action, you can reference the slash command. Its description will automatically be added to the context menu command by using the `/` character followed by the full command name.<br>
For example:

```json
"<Context command name>": "/existing slash command"
```

For example, the file could look like this:

```json
"Inspect message": "Get meta data about a message.",
"Member profile": "/server member profile"
```

> [!TIP]
> View a working example in [src/commands/context/config.json](../src/commands/context/config.json).

---

[<- Back to Main Page](README.md)
