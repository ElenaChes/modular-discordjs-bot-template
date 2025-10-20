# Built-in Utilities

The bot includes several built-in utility functions in `src/functions/utils/` that can be accessed from any file with access to the `context` object.

<details>
  <summary><h3>Content</h3></summary>

- [Builder Utilities (builders/)](#builder-utilities-builders)
- [Access Utilities (accessUtils.js)](#access-utilities-accessutilsjs)
  - [refreshRoleMap](#refreshrolemap)
  - [isValidUserRole](#isvaliduserrole)
  - [isValidGuildRole](#isvalidguildrole)
  - [checkAccess](#checkaccess)
  - [checkOwnerAccess](#checkowneraccess)
  - [checkGuild](#checkguild)
  - [checkHomeGuild](#checkhomeguild)
  - [hasExtraInGuild](#hasextrainguild)
  - [guildHasRoleUsers](#guildhasroleusers)
  - [guildHasOwners](#guildhasowners)
  - [checkTestBotGuild](#checktestbotguild)
- [File Utilities (fileUtils.js)](#file-utilities-fileutilsjs)
  - [getFolders](#getfolders)
  - [getFiles](#getfiles)
  - [safeRequire](#saferequire)
- [Message Utilities (messageUtils.js)](#message-utilities-messageutilsjs)
  - [useV2](#usev2)
  - [replyIfNotPlain](#replyifnotplain)
  - [batchSendComponents](#batchsendcomponents)
  - [batchSendEmbeds](#batchsendembeds)
  - [findMessage](#findmessage)
  - [sendWithEphemeralToggle](#sendwithephemeraltoggle)
  - [stripEphemeralToggle](#stripephemeraltoggle)
- [Parse Utilities (parseUtils.js)](#parse-utilities-parseutilsjs)
  - [relativePathToAbs](#relativepathtoabs)
  - [getFileName](#getfilename)
  - [throwError](#throwerror)
  - [warn](#warn)
  - [chopNumber](#chopnumber)
  - [getCmdCategories](#getcmdcategories)
- [Text Utilities (textUtils.js)](#text-utilities-textutilsjs)
  - [capitalize](#capitalize)
  - [endPlural](#endplural)
  - [getInitials](#getinitials)
  - [colorMsg](#colormsg)
  - [colorDiscMsg](#colordiscmsg)
  - [dualColorMsg](#dualcolormsg)
  - [codeBlock](#codeblock)
  - [ansiBlock](#ansiblock)
- [Time Utilities (timeUtils.js)](#time-utilities-timeutilsjs)
  - [timeToMilliseconds](#timetomilliseconds)
  - [millisecondsToTime](#millisecondstotime)
  - [timeDiff](#timediff)
  - [unixFormat](#unixformat)
  - [logTime](#logtime)
- [Validator Utilities (validatorUtils.js)](#validator-utilities-validatorutilsjs)
  - [isTestBot](#istestbot)
  - [isBotAsleep](#isbotasleep)
  - [isComponentsV2](#iscomponentsv2)
  - [checkValidUrl](#checkvalidurl)
  - [checkValidRole](#checkvalidrole)

</details>
<hr>

# Builder Utilities (builders/)

Utilities for creating Discord embeds, sections, containers, buttons, menus, and other interactive components.<br>
See [Builder Utilities](builder_utilities.md) for detailed documentation.

# Access Utilities (accessUtils.js)

Utilities for managing role groups and permissions. These functions handle role and permission checks, making it easy to validate user and guild roles.

## refreshRoleMap

```js
utilsLib.refreshRoleMap(IDs <access.IDs>);
```

Used during the bot's loading process or when reloading the database. This function maps the IDs from the `access` document into two objects: `userRoleMap` and `guildRoleMap`, treating `ownerRole` and `homeRole` as super users.

> [!NOTE]
> By default, `ownerRole` is set to "owner", and `homeRole` is set to "homeGuild". You can read how to change them in [Configs and Database](configs_and_database.md#labelsjs).

## isValidUserRole

```js
utilsLib.isValidUserRole(role <string>);
```

Check if the given string exists in `userRoleMap`.

## isValidGuildRole

```js
utilsLib.isValidGuildRole(role <string>);
```

Check if the given string exists in `guildRoleMap`.

## checkAccess

```js
utilsLib.checkAccess(userID <string>, role <string>);
```

Check if a user has the requested role.

## checkOwnerAccess

```js
utilsLib.checkOwnerAccess(userID <string>);
```

Extension of `utilsLib.checkAccess`, check if a user has the `ownerRole` role.

## checkGuild

```js
utilsLib.checkGuild(guildID <string>, role <string>);
```

Check if a guild has the requested role.

## checkHomeGuild

```js
utilsLib.checkHomeGuild(guildID <string>);
```

Extension of `utilsLib.checkGuild`, check if a guild has the `homeRole` role.

## hasExtraInGuild

```js
utilsLib.hasExtraInGuild(guild <Guild>);
```

Check if the bot has the `extraRole` in the requested guild.

## guildHasRoleUsers

```js
await utilsLib.guildHasRoleUsers(guild <Guild>, role <string>);
```

Check if a guild has members with the requested role.

## guildHasOwners

```js
await utilsLib.guildHasOwners(guild <Guild>);
```

Extension of `utilsLib.guildHasRoleUsers`, check if a guild has the bot's owner(s).

## checkTestBotGuild

```js
utilsLib.checkTestBotGuild(guild <Guild>);
```

Check if the bot instance is marked as "test" **and** the guild has the `homeRole` role.

# File Utilities (fileUtils.js)

Utilities for handling files and directories, including reading folder contents, retrieving file names, and safely requiring files.

## getFolders

```js
utilsLib.getFolders(dirPath <directory path>);
```

Returns array of folder names in the requested directory.

## getFiles

```js
utilsLib.getFiles(dirPath <directory path>, extension <optional file extension> );
```

Returns array of file names in the requested directory, can specify file type.

## safeRequire

```js
utilsLib.safeRequire(filePath <file path>);
```

Checks if the file exists before requiring it.

# Message Utilities (messageUtils.js)

Functions for handling Discord messages, including replying to interactions, managing ephemeral toggles, and sending batch components or embeds.

## useV2

A quick way to apply the `MessageFlags.IsComponentsV2` flag for V2 components. Example usage:

```js
const textDisplay = utilsLib.makeTextDisplay("Example text");
await interaction.reply({ components: [textDisplay], ...utilsLib.useV2 });
```

## replyIfNotPlain

```js
utilsLib.replyIfNotPlain(payload <message payload>, commandContext <command context instance>, { check <optional condition>, toggle <optional boolean> });
```

Sends a reply to an interaction if it is not a plain message command. Optionally, checks an additional condition before replying. Sends the reply with ephemeral toggle if `toggle` is true.

Example usage:

```js
//reply to a slash interaction, react with an emoji for plain message commands
const check = state === "sleep"; //additional check
const toggle = state !== "sleep"; //add ephemeral toggle if bot isn't asleep
const replied = await utilsLib.replyIfNotPlain(msg, interaction,, { check, toggle });
if (!replied) interaction.message.react("👍");
```

```js
//ignore non-slash interactions while the bot is busy
if (busy) await utilsLib.replyIfNotPlain("I'm still working on a previous answer.", interaction);
```

> [!TIP]
> This function is useful in scenarios where the bot should avoid replying to plain message commands or should ensure that slash command interactions receive appropriate responses. Note that replies to plain messages are always non-ephemeral.

## batchSendComponents

```js
await utilsLib.batchSendComponents(componentArray <container/textDisplay array>, commandContext <command context instance>, { channel <optional channel>, replyMsg <string>, skipReply <boolean> });
```

Handles sending large amount of components (`text displays` or `containers`) while adjusting them to Discord message limitations (maximum 10 components per message, maximum 4000 characters across components in message, etc).<br>

- `channel` - for sending the components to a different channel than the interaction channel.
- `replyMsg` - for giving an ephemeral confirmation message when all components are sent publicly.
- `skipReply` - for interactions that shouldn't be replied to for whataver reason.

Example usage:

```js
const components = [
  utilsLib.makeEmbedMimic({ title: "Title 1", desc: "Description 1", color: color.bot }),
  //...more components...
  utilsLib.makeEmbedMimic({ title: "Title 11", desc: "Description 11", color: color.bot }),
];

//[Reply]
await utilsLib.batchSendComponents(components, interaction, { replyMsg: "Here are my components!" });
```

## batchSendEmbeds

```js
await utilsLib.batchSendEmbeds(embedArray <embed array>, commandContext <command context instance>, { channel <optional channel>, replyMsg <string>, skipReply <boolean> });
```

Handles sending long embeds or a large amount of embeds while adjusting them to Discord message limitations (maximum 10 embeds per message, maximum 6000 characters across embeds in message, etc).<br>

- `channel` - for sending the embeds to a different channel than the interaction channel.
- `replyMsg` - for giving an ephemeral confirmation message when all embeds are sent publicly.
- `skipReply` - for interactions that shouldn't be replied to for whataver reason.

Example usage:

```js
const embeds = [
  utilsLib.makeEmbed({ title: "Title 1", desc: "Description 1", color: color.bot }),
  //...more embeds...
  utilsLib.makeEmbed({ title: "Title 11", desc: "Description 11", color: color.bot }),
];

//[Reply]
await utilsLib.batchSendEmbeds(embeds, interaction, { replyMsg: "Here are my embeds!" });
```

## findMessage

```js
await utilsLib.findMessage(messageId <string>, channel <Channel>, guild <optional Guild>);
```

Fetches the message using its ID and channel and returns the message and its author. If `guild` is provided - the `author` is a server `member` instance rather than a `user`.

Example usage:

```js
const messageID = interaction.options.getRole("message-id");
const foundMessage = await utilsLib.findMessage(messageID, interaction.channel, interaction.guild);
if (!foundMessage) return await interaction.reply(`Couldn't find message with ID "${messageId}".`);
const { message, author } = message;
```

## sendWithEphemeralToggle

```js
await utilsLib.sendWithEphemeralToggle(commandContext <command context instance>, payload <message payload>);
```

Attaches "`Keep Hidden`" and "`Make Public`" buttons to an ephemeral payload, alowing the user to choose to re-post the message as public after it's sent.

> [!NOTE]
> More on the command's usage in [Built-in Commands and Components](built_in_commands.md#keep-hidden--make-public).

## stripEphemeralToggle

```js
await utilsLib.stripEphemeralToggle(payload <message payload>);
```

Counterpart to `utilsLib.sendWithEphemeralToggle`, removes the "`Keep Hidden`" and "`Make Public`" buttons.

# Parse Utilities (parseUtils.js)

Utilities for parsing and manipulating data, including file paths, numbers, and autocomplete arrays.

## relativePathToAbs

```js
utilsLib.relativePathToAbs(relativePath <file path>, dirPath <optional __dirname>);
```

Converts relative paths into absolute paths. Example usage:

```js
//src/commands/serverLocked/test/v2examples.js
const filePath = utilsLib.relativePathToAbs("./config/info.json"); // -> src/config/info.json
const filePath = utilsLib.relativePathToAbs("../../../config/info.json", __dirname); // -> src/config/info.json
```

## getFileName

```js
utilsLib.getFileName(file <string>);
```

Safe way to extract the file name from a file path, useful for error logging.

Example usage:

```js
utilsLib.getFileName(__filename); // -> "parseUtils.js"
utilsLib.getFileName("parseUtils.js"); // -> "parseUtils.js"
```

## throwError

```js
utilsLib.throwError(file <file path>, msg <string>);
```

Format custom errors. Example usage:

```js
utilsLib.throwError(__filename, "Buttons needs to have either a customId or a link.");
//Output: "interactiveUtils.js: Buttons needs to have either a customId or a link."
```

## warn

```js
utilsLib.warn(func <string>, msg <string>);
```

Format custom warnings and color it for console. Example usage:

```js
utilsLib.warn("makeSection", "Didn't receive an accessory.");
//Output: "makeSection: Didn't receive an accessory."
```

## chopNumber

```js
utilsLib.chopNumber(number <number>, digits <integer>, fractionOnly <optional boolean>);
```

Chop number without rounding it, `fractionOnly` returns the fraction part in absolute form.

Example usage:

```js
utilsLib.chopNumber(12.3456, 2); // 12.34
utilsLib.chopNumber(12.3456, 2, true); // 0.34
utilsLib.chopNumber(-12.3456, 2); // -12.34
utilsLib.chopNumber(-12.3456, 2, true); // 0.34
```

## getCmdCategories

```js
await utilsLib.getCmdCategories(guild <Guild>);
```

Filters the `info.commandCategories` using the server-locked checks in `commandsMap` to parse what categories are registered in the requested server.

# Text Utilities (textUtils.js)

Functions for manipulating and formatting text, including capitalization, pluralization, and creating colored or formatted messages.

## capitalize

```js
utilsLib.capitalize(text <string>);
```

Capitalizes strings based on their format. Example usage:

```js
utilsLib.capitalize("test string"); // -> "Test string"
utilsLib.capitalize("test-string"); // -> "TestString"
```

See [function comments](../src/functions/utils/textUtils.js) for all use cases.

## endPlural

```js
utilsLib.endPlural(text <string>, amount <number>);
```

Determines if the string should be plural based on the amount.

For example:

```js
const minuteLabel = utilsLib.endPlural("minute", minutes);
console.log(`${minutes} ${minuteLabel}`);
//minutes = 1 -> Output: 1 minute
//minutes = 2 -> Output: 2 minutes
```

## getInitials

```js
utilsLib.getInitials(text <string>);
```

Get the initials from a string. Example usage:

```js
utilsLib.getInitials("string"); // -> "S"
utilsLib.getInitials("test string"); // -> "TS"
```

See [function comments](../src/functions/utils/textUtils.js) for all use cases.

> [!TIP]
> Can be used to dynamically create tags, for example the command categories in the registration logs are created using this function.

## colorMsg

```js
utilsLib.colorMsg(msg <string>, color <chalk color>);
```

Color a string for console printing using `chalk`.

## colorDiscMsg

```js
utilsLib.colorDiscMsg(msg <string>, color <chalk color>);
```

Color a string for Discord code blocks.

## dualColorMsg

```js
utilsLib.dualColorMsg(msg <string>, color <chalk color>);
```

Creates a colored console string and Discord string.

> [!TIP]
> You can see how to use it together with the logging system in [Logging and Error Handling](logging_and_error_handling.md#logs).

## codeBlock

```js
utilsLib.codeBlock(msg <string>, code <optional coding language>);
```

Puts the input message in a code block, if `code` is provided adds the language to the message.

For example:

````js
utilsLib.codeBlock("Text", "python"); // -> ```python\nText\n```
````

## ansiBlock

```js
utilsLib.ansiBlock(msg <string>);
```

Puts the input message in an ansi code block (needed for colored text).

For example:

````js
const text = utilsLib.colorDiscMsg("Text", "blue");
utilsLib.ansiBlock(text); // -> ```ansi\n\u001b[2;34mText\u001b[0m\n```
````

# Time Utilities (timeUtils.js)

Utilities for time formatting and calculations, including converting between human-readable time and milliseconds, calculating time differences, and generating Discord timestamps.

## timeToMilliseconds

```js
utilsLib.timeToMilliseconds(time <number>, units <string>);
```

Convert human time to milliseconds.

Example usage:

```js
const ms = utilsLib.timeToMilliseconds(10, "minutes");
console.log(ms); //600000
```

## millisecondsToTime

```js
utilsLib.millisecondsToTime(ms <number>, units <optional string>);
```

Convert milliseconds to human time.

Example usage with units specified:

```js
const ms = 5400000;
const units = "minutes";
const time = utilsLib.millisecondsToTime(ms, units);
console.log(`${time} ${units}`); //90 minutes
```

Example with units not specified:

```js
const ms = 5400000;
const { time, units } = utilsLib.millisecondsToTime(ms);
console.log(`${time} ${units}`); //1.5 hours
```

## timeDiff

```js
utilsLib.timeDiff(start <Date>, end <Date>);
```

Calculate difference between two date objects, returns result in `ms` or `s`.

> [!TIP]
> This function is useful for calculating execution time, idle time, response time and so on. It's used during the loading process for the logs.

## unixFormat

```js
utilsLib.unixFormat(format <string>, { date <optional Date>, timestamp <optional timestamp> });
```

Formats a `Date` object or `timestamp` into Discord's unix time syntax, which adjusts to each user's timezone and language preferences.

Example usage:

```js
const date = new Date();
utilsLib.unixFormat("time", { date }); // -> <t:1760274684:t> -> 16:11
utilsLib.unixFormat("date", { date }); // -> <t:1760274684:d> -> 12/10/2025
utilsLib.unixFormat("relative", { date }); // -> <t:1760274684:R> -> 1 seconds ago
```

| Format   | Raw Output                              | Possible Discord Appearance |
| -------- | --------------------------------------- | --------------------------- |
| time     | `<t:1760274684:t>`                      | `16:11`                     |
| date     | `<t:1760274684:d>`                      | `12/10/2025`                |
| full     | `<t:1760274684:t>, <t:1760274684:d>`    | `16:11, 12/10/2025`         |
| relative | `<t:1760274684:R>`                      | `1 seconds ago`             |
| describe | `<t:1760274684:t>.\n(<t:1760274684:R>)` | `16:11.\n(1 seconds ago)`   |

> [!NOTE]
> Discord timestamps use a special syntax (`<t:...>`) to display time dynamically, adjusting to each user's timezone and language preferences.

## logTime

See explanation and usage in [Logging and Error Handling](logging_and_error_handling.md#logtime).

# Validator Utilities (validatorUtils.js)

Functions for validating data and states, including checking URLs, roles, and bot-specific conditions.

## isTestBot

```js
utilsLib.isTestBot();
```

Check if the bot instance is marked as "test".

## isBotAsleep

```js
utilsLib.isBotAsleep();
```

Check if the bot's state isn't "sleep".

## isComponentsV2

```js
utilsLib.isComponentsV2(payload <message payload>);
```

Check if message payload has the flag `MessageFlags.IsComponentsV2` attached to it.

## checkValidUrl

```js
utilsLib.checkValidUrl(string <string>);
```

Check if a string is a valid URL.

## checkValidRole

```js
utilsLib.checkValidRole(guild <Guild>, { role <optional Role>, roleID <optional string> });
```

Check if a role is "valid" - it's bellow the bot's highest role so it can give and remove that role.

---

[<- Back to Main Page](README.md)
