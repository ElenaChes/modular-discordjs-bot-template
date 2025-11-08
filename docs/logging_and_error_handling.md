# Logging and Error Handling

The bot includes logging and error handling systems that allow you to send information as messages to a designated Discord channel.

<details>
  <summary><h3>Content</h3></summary>
  
- [Log Channel](#log-channel)
  - [Bot Command](#bot-command)
  - [Directly in the Database](#directly-in-the-database)
- [Logs](#logs)
- [Loading Logs (logTime)](#loading-logs-logtime)
  - [Examples](#examples)
    - [Example 1: Immediate Execution](#example-1-immediate-execution)
    - [Example 2: Awaiting Another Handler](#example-2-awaiting-another-handler)
    - [Example 2: Timestamp With No Execution Time](#example-2-timestamp-with-no-execution-time)
  - [How to Read These Logs](#how-to-read-these-logs)
- [Error Handling](#error-handling)
  - [Regular try/catch.](#regular-trycatch)
  - [Execute and Autocomplete Function Wrapping](#execute-and-autocomplete-function-wrapping)
  - [Command Logic Wrapping](#command-logic-wrapping)
  - [Error Event Listeners](#error-event-listeners)
  - [Command Context Error Handler](#command-context-error-handler)
  - [Global Error Handler](#global-error-handler)

</details>
<hr>

# Log Channel

To receive logs and error messages, you need to set a log channel using one of the following methods:

## Bot Command

- **Slash command:** `/manage log-channel update` with the desired channel.
- **Plain message command:** `manage.log-channel.update(#channel)`.

## Directly in the Database

Update the bot's `Profile` document to have the desired channel:

```json
"logChannel": "<Discord channel ID>"
```

> [!NOTE]
> More on the `profile` schema in [Configs and Database](configs_and_database.md#profile-schema-profilejs).

# Logs

The bot has a built-in logs function in [`log.js`](../src/functions/runtime/core/log.js):

```js
await runtimeLib.handleLog({ consoleMsg <string>, discordMsg <string> });
```

While:

- **consoleMsg**: Gets printed in the console and get used as a fallback if `discordMsg` wasn't passed.
- **discordMsg**: Gets sent in the Discord log-channel.

> [!TIP]
> Logs are useful for notifying you about events or information that are not necessarily errors.

For ease of use, you can use one of the following functions to color text for logs:

```js
//create both a consoleMsg and discordMsg
const { consoleMsg, discordMsg } = utilsLib.dualColorMsg(msg, "<Valid chalk color>");

//create only a discordMsg
const consoleMsg = utilsLib.colorMsg(msg, "<Valid chalk color>");

//create only a discordMsg
const discordMsg = utilsLib.colorDiscMsg(msg, "<Valid chalk color>");
```

> [!NOTE]
> For the list of supported colors see `chalk`'s [documentation](https://www.npmjs.com/package/chalk#colors).

Usage example:

```js
//disconnected.js
const msg = `Database disconnected.`;
await runtimeLib.handleLog(utilsLib.dualColorMsg(msg, "red"));

//exit.js
const msg = `${client.user.tag} has shut down.`;
console.log(utilsLib.colorMsg(msg, "red"));
```

# Loading Logs (logTime)

The `utilsLib.logTime` function is used to log processes during the bot's loading phase. It helps identify bottlenecks and track execution times for handlers and other processes.

```js
utilsLib.logTime(name <string>, type <string>, start <optional Date>, actual <optional Date>);
```

- **name:** A short, descriptive name for the process being logged.
- **type:** The type of process (for example "Handler", "Ready", "Online").
- **start** (Optional): The time when the process began execution. If no start is given, logs the current time as a simple timestamp.
- **actual** (Optional): The time when the process actually started, if it was waiting for another process to complete.

## Examples

### Example 1: Immediate Execution

```js
load.handleComponents = async () => {
  const start = new Date();

  //handler logic...

  utilsLib.logTime("Comps", "Handler", start);
};
```

Gets added to the logs as:

```bash
0======================================0
|T]_Name___|_Ready/Done__|_Exec_/Idle__|
|==========|=============|=============|
|H]_Comps__|_1.09s/1.1s__|_4ms_________|
0======================================0
```

### Example 2: Awaiting Another Handler

```js
load.handleCommands = async () => {
  const start = new Date();
  await load.accessReady;
  const actual = new Date();

  //handler logic...

  utilsLib.logTime("Comms", "Handler", start, actual);
};
```

Gets added to the logs as:

```bash
0======================================0
|T]_Name___|_Ready/Done__|_Exec_/Idle__|
|==========|=============|=============|
|H]_Comms__|_1.08s/3.05s_|_18ms_/1.95s_|
0======================================0
```

### Example 2: Timestamp With No Execution Time

```js
utilsLib.logTime("App", "Online");
```

Gets added to the logs as:

```bash
0======================================0
|T]_Name___|_Ready/Done__|_Exec_/Idle__|
|==========|=============|=============|
|O]_App____|_______4.24s_|_____________|
0======================================0
```

Together, all the logs look like this:

```bash
0======================================0
|_____________Load_Times_______________|
|======================================|
|T]_Name___|_Ready/Done__|_Exec_/Idle__|
|==========|=============|=============|
|P]_App____|_______1.07s_|_____________|
|H]_Events_|_1.08s/1.09s_|_18ms________|
|H]_Comps__|_1.09s/1.1s__|_4ms_________|
|L]_App____|_______1.1s__|_____________|
|R]_App____|_______2.15s_|_____________|
|C]_DB_____|_1.07s/2.63s_|_1.55s_______|
|H]_Access_|_1.08s/3.03s_|_407ms/1.55s_|
|H]_Comms__|_1.08s/3.05s_|_18ms_/1.95s_|
|H]_DB_____|_2.15s/3.28s_|_227ms/897ms_|
|R]_Comms__|_3.28s/4.11s_|_832ms/0ms___|
|O]_App____|_______4.24s_|_____________|
0======================================0
```

## How to Read These Logs

Each row represents a process, showing its start time, end time, execution time, and idle time (if applicable).

Translation of a few rows for example:

- **Row 3:** Components handler - started at `1.09s`, finished at `1.1s`, total execution time: `4ms`.
- **Row 6:** Database connection - started at `1.07s`, finished at `2.63s`, total execution time: `1.55s`.
- **Row 8:** Commands handler - ready to start `1.08s`, finished at `3.05s`, total execution time: `18ms`, was idle for: `1.95s`.
- **Row 11:** App went online at `4.24s`.

> [!NOTE]
> The app also logs time via `console.time("Load time")` and `console.timeEnd("Load time")`, which include additional actions after the bot is online so they display a slightly longer load time.

# Error Handling

The bot includes several built-in error handling mechanisms to ensure that users receive friendly error messages while the bot owner receives detailed error logs in the `log channel`.

## Regular try/catch.

Not much to add here, anything that needs a catch has it.

## Execute and Autocomplete Function Wrapping

Command and component `execute` functions get wrapped with the `runtimeLib.wrapWithCatch` try/catch wrapper while being processed by `handleCommands.js` or `handleComponents.js`.<br>
Similarly, command `autocomplete` functions get wrapped in `runtimeLib.plainWrapWithCatch`.

> [!IMPORTANT]
> In other words, manual try/catch blocks inside `execute` and `autocomplete` functions are unnecessary unless you want to handle specific errors directly.

> [!NOTE]
> The `runtimeLib.wrapWithCatch` wrapper uses the <ins>command context</ins> instance's error handler, while `runtimeLib.plainWrapWithCatch` relies on the <ins>global error handler</ins>, allowing it to work even in scopes without a command context instance.

## Command Logic Wrapping

Command logic in commandsLib (`scr/functions/commands/`) can be wrapped in a try/catch wrapper like so:

```js
const { wrapWithCatch } = runtimeLib;
//[/commandName]
commandsLib.commandName = wrapWithCatch(
  async function commandName(interaction) {
    //command logic...
  },
  { errorMsg: "Custom user friendly error.", fileName: __filename }
);
```

Ensure that `commandsLib.commandName` matches the function's name:

- commandsLib.**commandName**: Used to find the command's logic during runtime.
- Function's actual name: Used in the wrapper to name the function that threw the error.

> [!NOTE]
> The try/catch wrappers can be found in [`error.js`](../src/functions/runtime/core/error.js).<br>

## Error Event Listeners

The bot has built-in error events listeners such as:

- Discord.js client error (`error.js`)
- Database events (`disconnected.js`, `error.js`)
- Process events (`uncaughtException.js`, `unhandledRejection.js`)

## Command Context Error Handler

The [command context](command_context.md) class instances have a built in error handler located in [`ContextBase.js`](../src/commandContext/ContextBase.js):

```js
await handleError({ message <string>, error <error>, location <string/object> });
```

- **message**: User friendly message.
- **error**: Full error instance.
- **location**: Either a file name, or an object containing the file name and function name `{ fileName, fnName }`.

This function responds to the user and, if an error is provided, calls the global error handler.

Usage examples:

```js
//only send a user friendly error, no logs
await commandContext.handleError({ message: msg });

//catching error
try {
  //code that might throw
} catch (error) {
  commandContext.handleError({ error, location: __filename });
}

//full location
await commandContext.handleError({ message: msg, error, location: { fileName: __filename, fnName: "functionName" } });
```

## Global Error Handler

The global error handler can be accessed from any file with access to the `context` object, unlike the `commandContext` handler, which is only available while processing an interaction.<br>
This handler, located in [`error.js`](../src/functions/runtime/core/error.js) gets called like this:

```js
await runtimeLib.handleError(error <error>, location <string/object>, { crash <boolean>, unhandled <boolean>, guild <Guild>, user <User> });
```

- **error**: Full error instance.
- **location**: Either a file name, or an object containing the file name and function name `{ fileName, fnName }`.
- **crash**: Is the bot going offline after this log?
- **unhandled**: Was the error caught by `uncaughtException.js`/`unhandledException.js`?
- **guild**: The guild of the interaction that threw (only relevant if the error came from an interaction).
- **user**: The user of the interaction that threw (only relevant if the error came from an interaction).

Usage examples:

```js
//non-interaction error catch
try {
  //code that might throw
} catch (error) {
  await runtimeLib.handleError(error, __filename);
}

//error thrown by an interaction
try {
  //code that might throw
} catch (error) {
  await runtimeLib.handleError(error, __filename, { guild: interaction.guild, user: interaction.user });
}

//uncaughtException.js
module.exports = {
  name: "uncaughtException",
  async execute(error, origin, { runtimeLib }) {
    await runtimeLib.closeMongoose();
    await runtimeLib.handleError(error, __filename, { crash: true, unhandled: true });
    process.exit(1);
  },
};
```

---

[<- Back to Main Page](../)
