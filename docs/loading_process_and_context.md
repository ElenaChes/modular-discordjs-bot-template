# Bot Loading Process & Context

The bot's loading process ensures modularity and flexibility by dynamically loading files and initializing a centralized context object, which provides seamless access to critical resources and functions.

<details>
  <summary><h3>Content</h3></summary>
  
- [Bot Loading Process](#bot-loading-process)
  - [1. Initialize the Client](#1-initialize-the-client)
  - [2. Prepare Files and Context](#2-prepare-files-and-context)
  - [3. Connect to the Database](#3-connect-to-the-database)
  - [4. Run Loading Handlers](#4-run-loading-handlers)
    - [Explanation of the Logs](#explanation-of-the-logs)
  - [5. Log In the Client](#5-log-in-the-client)
  - [6. Run "Ready" Handlers](#6-run-ready-handlers)
    - [Explanation of the Logs](#explanation-of-the-logs-1)
  - [7. Finalizing](#7-finalizing)
- [Context Structure](#context-structure)
  - [appLoaded](#apploaded)
  - [client](#client)
  - [utilsLib](#utilslib)
  - [commandsLib](#commandslib)
  - [runtimeLib](#runtimelib)
  - [info](#info)
  - [commandsMap](#commandsmap)
  - [load](#load)

</details>
<hr>

# Bot Loading Process

The bot's initialization consists of a sequence of steps:

## 1. Initialize the Client

`index.js` creates a Discord client, parses the `appFlags` and runs the bootstrapper.

## 2. Prepare Files and Context

`app.js` prepares files and initializes the app's context, which is explained in detail in the [Context](#context) section.

## 3. Connect to the Database

`app.js` connects to the database.

## 4. Run Loading Handlers

`app.js` runs the loading handlers, each responsible for loading specific files, such as commands, components, events, and the access document.

<img align="right" style="width:400px; height:auto;" src="https://github.com/user-attachments/assets/68721f8d-41dc-4e99-9f85-82bc81d6211a" />

### Explanation of the Logs

**Events Table:**

- Attached 4 (Discord) Client events.
- Attached 4 (Mongoose) Database events.
- Attached 6 Process events.

**Components Table:**

- Processed 3 buttons.
- Processed 0 select menus.

**Commands Table:**

- Processed 5 total top-level commands:
  - 3 `regular` subcommands.
  - 6 `Home Guild` subcommands.
  - 13 `Test` subcommands.
- Additionally, processed 2 `Context` commands.

## 5. Log In the Client

`index.js` logs the client into Discord.

## 6. Run "Ready" Handlers

The `readyClient.js` event listener runs the database loaders (`runtimeLib.loadDatabase`), then registers slash and context menu commands (`runtimeLib.registerCommands`).

<img align="right" style="width:400px; height:auto;" src="https://github.com/user-attachments/assets/6c3f9151-5caf-4a3a-8617-d685a00536cb" />

### Explanation of the Logs

**Database Table:**

- Loaded the `Access` and `Profile` schemas.
- Encountered 0 errors.

**Registered Commands Table:**

- Commands loaded in "Testing Server":
  - `Regular` commands.
  - `Extra Role` commands.
  - `Home Guild` commands.
  - `Owner` commands.
  - `Test` commands.
- Commands loaded in "Other Server":
  - `Regular` commands.
  - `Owner` commands.
- Loaded Global commands.

> [!NOTE]
> The registered commands table headers correspond to the names of the server-locked command folders in the project:
>
> - `extraRole/` -> `ER`
> - `homeGuild/` -> `HG`
> - `owner/` -> `O`
>
> Regular (non-server-locked) commands are marked as `R`, though they do not correspond to a specific folder.
>
> Note that the logs will state that commands of a category loaded even if there are no commands in the folder. To fully remove a category, delete the folder and remove its check from the `config.js` file.

## 7. Finalizing

`readyClient.js` logs the loading times, command registration logs, and finally sets `appLoaded` to `true`.

# Context Structure

The context object is a core component of the bot's architecture, enabling modularity and simplifying development. It centralizes access to critical resources and functions, eliminating the need for repetitive imports.<br>
It is extensible, allowing developers to add new references or objects as needed to support additional functionality.

The context object is created during the loading process and passed to handlers, utility files, and more.<br>
As a result, the context object is accessible in most files throughout the project.

Here are examples of how the context object can be used in files:

```js
module.exports = ({ client, utilsLib, commandsLib, runtimeLib, info }) => {
  const { wrapWithCatch } = runtimeLib;
  //[/example command]
  commandsLib.exampleCommand = wrapWithCatch(
    async function exampleCommand(interaction) {
      const desc = `My log channel is <#${info.logChannel}>.`;

      //[Reply]
      const embed = utilsLib.makeEmbed({ title: "Example", desc, color: color.bot });
      await interaction.reply({ embeds: [embed] });
    },
    { errorMsg: "Couldn't run example command.", fileName: __filename }
  );
};
```

```js
//[Example event file]
module.exports = {
  name: "exampleEvent",
  async execute(arg, context) {
    if (!arg) return;
    const { client, utilsLib, runtimeLib } = context;
    try {
      const channelID = await utilsLib.exampleFunction(context);
      const channel = client.channels.cache.get(channelID);
      await utilsLib.anotherExample(arg, channel);
    } catch (error) {
      await runtimeLib.handleError(error, __filename);
    }
  },
};
```

---

The following are the references that are grouped into the context:

## appLoaded

A boolean that indicates whether the bot has completed its initialization process.

> [!TIP]
> Prevents the bot from responding to interactions and messages until it is fully initialized.

## client

The bot's Discord.js client.

> [!TIP]
> Access to the bot's client without the need for imports.

## utilsLib

References all utility functions in `src/functions/utils/`. Includes functions for text manipulation, message handling, and more.

> [!TIP]
> Provides direct access to utility functions.<br>
> For example, you can access the `capitalize` function using `utilsLib.capitalize`.

## commandsLib

Contains references to all command logic in `src/functions/commands/`.

> [!TIP]
> Provides access to command implementations, which are automatically parsed by the [commands context](command_context.md) class.<br>
> For example, the class locates the implementation for `/bot ping` at `commandsLib.botPing`.

## runtimeLib

Contains references to all runtime functions in `src/functions/runtime/`. Includes functions for error handling, database operations, and more.

> [!TIP]
> Provides direct access to runtime functions.<br>
> For example, you can access the `handleError` function at `runtimeLib.handleError`.

## info

Stores additional data required for the bot's operation, including: `appFlags`, command descriptions, IDs, `appLabel`, `extraRole` name, `logChannel` ID, etc.

> [!TIP]
> Access pre-parsed data globally instead of fetching and parsing it repeatedly.<br>
> For example:
>
> - Check if the if the `--silent` flag was used: `info.appFlags.silent`.
> - Get descriptions of all registered commands: `info.commandDescs`.
> - Access the bot's label, "extra" role, or log channel: `info.appLabel`, `info.extraRole`, `info.logChannel`.

## commandsMap

Stores categorized commands and the checks required for server-locked folders to register in a guild.

> [!TIP]
> Used during command registration to determine which commands are loaded for specific servers.<br>
> For example, `/bot commands` (in [bot.js](../src/commands/information/bot.js)) uses the checks to display the command categories loaded in the current server.

## load

A temporary object that stores loading logs, handlers, and other data.

> [!TIP]
> Centralizes loading data and allows you to await specific initialization steps.<br>
> For example:
>
> - Wait for database connection: `await load.dbReady`.
> - Wait for access to load: `await load.accessReady`.
> - Wait for single handler, for example **handleCommands**: `await load.commandsReady`.
> - Wait for **all** loading handlers to finish: `await load.handlersReady`.
> - To add new loading logs, use `load.addLogs(discordMsg)`.

> [!IMPORTANT]
> The `load` object is deleted once the bot is fully online.

---

[<- Back to Main Page](README.md)
