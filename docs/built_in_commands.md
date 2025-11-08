# Built-in Commands and Components

The bot includes several built-in commands and components.

<details>
  <summary><h3>Content</h3></summary>
  
- [Global Commands](#global-commands)
  - [/bot about](#bot-about)
  - [/bot commands](#bot-commands)
  - [/bot ping](#bot-ping)
- [Owner Commands](#owner-commands)
  - [/manage commands loaded](#manage-commands-loaded)
  - [/manage commands reload](#manage-commands-reload)
  - [/manage extra check](#manage-extra-check)
  - [/manage extra update](#manage-extra-update)
  - [/manage log-channel check](#manage-log-channel-check)
  - [/manage log-channel update](#manage-log-channel-update)
  - [/manage presence](#manage-presence)
  - [/manage reload-database](#manage-reload-database)
  - [/manage state](#manage-state)
- [Test Commands](#test-commands)
- [Help Command `help()`](#help-command-help)
- [Context Commands](#context-commands)
  - [Message Context Command - `Inspect Message`](#message-context-command---inspect-message)
  - [User Context Command - `Inspect User`](#user-context-command---inspect-user)
- [Buttons](#buttons)
  - [Keep Hidden \& Make Public](#keep-hidden--make-public)
  - [Dismiss Message](#dismiss-message)

</details>
<hr>

# Global Commands

## /bot about

<img align="right" style="width:450px; height:auto;" src="https://github.com/user-attachments/assets/147fb24e-2a38-4836-9478-e07d1897bd9e" />

Provides the bot's "about" description.

> [!NOTE]
> Plain message version: `bot.about()`

## /bot commands

<img align="right" style="width:270px; height:auto;" src="https://github.com/user-attachments/assets/71d8ee76-65b0-416e-859e-cbaa2c9e71ac" />

Provides descriptions of the bot's commands. Optionally, accepts the name of a category. Category options are parsed dynamically using Autocomplete, based on the available command categories (folders) in the server.

**Arguments:**

1. <ins>category</ins>: What command category to display.

   - type: `Text`
   - choices: change based on server, for example: `All categories` / `Context` / `Home guild` / `Information` / `Test`

> [!NOTE]
> Plain message version: `bot.commands()`

## /bot ping

Provides the bot's ping and performs a simple permissions check (response changes based on whether the owner ran the command).

> [!NOTE]
> Plain message version: `bot.ping()`

<p align="center">
  <img style="width:370px; height:auto;" src="https://github.com/user-attachments/assets/b39afc27-b0fa-4ec2-9ccc-76bbcae81d1e" />
   &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
  <img style="width:370px; height:auto;" src="https://github.com/user-attachments/assets/3b0a67bd-825e-4ded-88ab-e35ec61b5cdf" />
</p>

# Owner Commands

## /manage commands loaded

Displays the currently loaded commands (provides the same logs that are created during load).

> [!NOTE]
> Plain message version: `manage.commands.loaded()`

## /manage commands reload

Reloads the bot's commands (with a 10-minute cool-down). This is necessary if the bot is added to a new server, the "extra" role was changed, members with roles joined or left, and more.

> [!NOTE]
> Plain message version: `manage.commands.reload()`

## /manage extra check

Checks what the "extra" role should be called.

> [!NOTE]
> Plain message version: `manage.extra.check()`

## /manage extra update

Updates or removes the "extra" role to the given role's name.

**Arguments:**

1.  <ins>role</ins>: What role enables extra commands (across all servers)? Leave empty to clear.

    - type: `Role`

> [!NOTE]
> Plain message version: `manage.extra.update(@role)`

## /manage log-channel check

Checks the current log channel.

> [!NOTE]
> Plain message version: `manage.log-channel.check()`

## /manage log-channel update

<img align="right" style="width:400px; height:auto;" src="https://github.com/user-attachments/assets/6044be0a-c18b-4b38-9aa3-4855497601cf" />

Updates or removes the log channel.

**Arguments:**

1.  <ins>channel</ins>: Bot's new log channel, leave empty to clear.

    - type: `Text channel`

> [!NOTE]
> Plain message version: `manage.log-channel.update(#channel)`

## /manage presence

<img align="right" style="width:450px; height:auto;" src="https://github.com/user-attachments/assets/af3f9259-6bec-4423-aef9-86eb4adda3f5" />

Updates the bot's presence. Leave all fields empty to reload from the database.

**Arguments:**

<img align="right" style="width:250px; height:auto;" src="https://github.com/user-attachments/assets/5c3cf02b-9977-431b-8404-73b980bf88d5" />

1. <ins>activity-type</ins>: What the bot is doing.

   - choices: `Playing` / `Listening to` / `Watching` / `Competing in`

2. <ins>activity</ins>: Bot's new activity.

   - type: `Text`

3. <ins>status</ins>: Bot's new status.

   - choices: `Online` / `Idle` / `Do not disturb` / `Invisible`

> [!NOTE]
> Plain message version: `manage.presence(activity-type, activity, status)`
>
> To skip optional arguments, use `null`. For example:
>
> - Update only activity: `manage.presence(null, activity)`
> - Reload from database: `manage.presence()`

## /manage reload-database

Reloads data from the database. Necessary if one of the documents that get loaded while the bot loads were changed (for example `access.js` or `profile.js`). Category options are parsed dynamically using Autocomplete, based on the existing schemas.

**Arguments:**

1. <ins>schema</ins>: The database schema to reload.

   - type: `Text`
   - choices: change based on existing schemas, for example: `Access` / `Profile`

> [!NOTE]
> Plain message version: `manage.database(schema)`

## /manage state

<img align="right" style="width:350px; height:auto;" src="https://github.com/user-attachments/assets/e3d3a7cb-aaad-43a4-843b-1586dfc26225" />

Updates the bot's state:

- Maintenance - only changes the bot's status.
- Sleep - bot stops responding to all interactions except state change.
- Active - regular activity.

**Arguments:**

1. <ins>state</ins>: State to switch to.

   - choices: `Maintenance` / `Sleep` / `Active` | `required`

> [!NOTE]
> Plain message version: `manage.state(state)`

> [!TIP]
> To configure the presence that the bot has in each state head to [src/configs/constants.js](../src/config/constants.js).

# Test Commands

There are additional example commands in `src/commands/serverLocked/test`:

- `/test-example`: Demonstrates the `Dismiss` button. See [Dismiss Message](#dismiss-message) for details.
- `/v1-examples`: Demonstrates the use of built-in builder utilities, such as embeds, buttons, and select menus.
- `/v2-examples`: Demonstrates the use of builder utilities for V2 components, including text displays, sections, containers, and more.

> [!Note]
> For more details on the builder utilities, see [Builder Utilities](builder_utilities.md).

# Help Command `help()`

Plain messages include an additional `help` command. This command accepts the name of another command and lists its subcommands or options. For example:

**help(manage)**

<img style="width:600px; height:auto;" src="https://github.com/user-attachments/assets/f9efb138-3f07-46ca-80bb-4df22daa20c7" />

**help(manage.presence)**

<img style="width:600px; height:auto;" src="https://github.com/user-attachments/assets/c0271970-e3b6-44bd-8605-9df2dbb1664e" />

> [!TIP]
> You can adjust the format of help command calls by adjusting the regexes in [`messageCreate.js`](../src/events/client/messageCreate.js).

> [!IMPORTANT]
> Due to the format of the help command, having a `/help` slash command with no sub commands is not recommended as its behaviour is undefined.

# Context Commands

The bot has two built-in context commands:

## Message Context Command - `Inspect Message`

Get meta data about a message.<br>
To use, right-click or long-tap a **message** -> **Apps** -> **Inspect Message**.

## User Context Command - `Inspect User`

Get meta data about a user.<br>
To use, right-click or long-tap a **user** -> **Apps** -> **Inspect User**.

# Buttons

## Keep Hidden & Make Public

A set of buttons that can be added to an ephemeral interaction response, allowing the user to choose whether to make the command public after it has been sent.<br>
Use `utilsLib.sendWithEphemeralToggle(interaction, payload)` to add the buttons to an ephemeral message, for example:

```js
//plain payload
await interaction.reply("Ephemeral message"); //before
await utilsLib.sendWithEphemeralToggle(interaction, "Ephemeral message"); //after

//object payload
await interaction.editReply({ content: "Ephemeral message", embeds: [embed] }); //before
await utilsLib.sendWithEphemeralToggle(interaction, { content: "Ephemeral message", embeds: [embed] }); //after
```

<p align="center">
  <img style="width:200px; height:auto;" src="https://github.com/user-attachments/assets/08feba33-c81f-497e-a6c2-476fbf8d05ec" />
</p>
  
## Dismiss Message

Deletes the message it is attached to.<br>
You can see how to use it in [src/functions/commands/test/testExample.js](../src/commands/serverLocked/test/testExample.js).

<p align="center">
  <img style="width:120px; height:auto;" src="https://github.com/user-attachments/assets/c5857052-77d3-48da-bc10-51e08dea3710" />
</p>

---

[<- Back to Main Page](../)
