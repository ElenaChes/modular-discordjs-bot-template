# Adding New Files and Features

This project includes template files in the `templates/` directory, which can be used as examples when adding new files or features.

<details>
  <summary><h3>Content</h3></summary>
  
- [New Slash Command](#new-slash-command)
  - [1. Command Declaration](#1-command-declaration)
  - [2. Config](#2-config)
  - [3. Command Logic (commandsLib)](#3-command-logic-commandslib)
  - [Bonus: Command Logic inside Command Declaration](#bonus-command-logic-inside-command-declaration)
- [New Context Menu Command](#new-context-menu-command)
  - [1. Command Declaration](#1-command-declaration-1)
  - [2. Config](#2-config-1)
  - [3. Command Logic (commandsLib)](#3-command-logic-commandslib-1)
  - [4. Set Command Logic Function Name](#4-set-command-logic-function-name)
- [New Component (Button/Select Menu)](#new-component-buttonselect-menu)
  - [1. Component Declaration](#1-component-declaration)
  - [2. Fine-tune Permissions](#2-fine-tune-permissions)
  - [3. Component Logic](#3-component-logic)
- [New Runtime Function](#new-runtime-function)
- [New Utility Function](#new-utility-function)
- [New Schema](#new-schema)
  - [Recommendation](#recommendation)
  - [Loading Documents During Load](#loading-documents-during-load)
- [New Event Listener](#new-event-listener)
  - [Adding a New Emitter](#adding-a-new-emitter)

</details>
<hr>

# New Slash Command

## 1. Command Declaration

Create a new declaration file in `src/commands/`, placing it in the desired folder (which will be used as the command's category). You can also create a new folder if needed.

At the top of the file make sure to set the `hidden` and `access` variables:

```js
//[Variables]
const hidden = true; //ephemeral replies?
const access = ""; //"admin"/"owner"/other custom roles
```

> [!TIP]
> Relevant templates: [`command_basic_1lvl.js`](../templates/commands/command_basic_1lvl.js), [`command_basic_2lvl.js`](../templates/commands/command_basic_3lvl.js), [`command_basic_3lvl.js`](../templates/commands/command_basic_3lvl.js) for all 3 possible slash command depths.

## 2. Config

**Server locked**<br>
If you added a new folder in a server-locked folder, ensure that you add a check for the command in the folder's `config.js` file.

> [!NOTE]
> More on `config.js` in [Configs and Database](configs_and_database.md#server-locked-commands-configjs).

**Global commands**<br>
If you want the commands to be registered globally, make sure to add its name in `src/config/labels.js`.

> [!NOTE]
> More on `labels.js` in [Configs and Database](configs_and_database.md#labelsjs).

## 3. Command Logic (commandsLib)

Add the command implementations in `src/functions/commands/` - in a new file in an existing folder or a new one. Ensure that the functions are named according to the commands they belong to.<br>
For example:

- `/bot ping` -> `botPing`
- `/manage log-channel check` -> `manageLogChannelCheck`

> [!TIP]
> Relevant templates: [`commandsLib.js`](../templates/commandsLib.js).

## Bonus: Command Logic inside Command Declaration

If you prefer not to use `commandsLib` and want to implement the command logic directly inside the command file (added in step 1), you can adjust the `execute` function in one of the following ways.

**Original**:

```js
async execute(commandContext) {
   await commandContext.runCommand(access, hidden); //add { defer: true } to defer
},
```

**Option 1** - utilizing `prepareExecution` for the permission check:

```js
async execute(commandContext) {
   const interaction = await commandContext.prepareExecution(access, hidden);
   if (!interaction) return;

   //command logic...

   await interaction.reply(msg);
},
```

**Option 2** - manual:

```js
//[Imports]
const { SlashCommandBuilder, MessageFlags } = require("discord.js"); //add MessageFlags
const { deny } = require("../config/info.json"); //access denied messages

//command declaration...

//optionally, rename "commandContext" to "interaction" for a more native Discord.js look
async execute(interaction) {
   //using "hidden" to set ephemeral
   const ephemeral = hidden ? MessageFlags.Ephemeral : 0;

   //permission check using "access"
   if (!utilsLib.checkAccess(interaction.user.id, access))
   return await interaction.reply({ content: deny[access], flags: ephemeral });

   //command logic...

   await interaction.reply({ content: msg, flags: ephemeral });
},
```

# New Context Menu Command

## 1. Command Declaration

Create a new declaration file in `src/commands/`, placing it in the desired folder. You can also create a new folder if needed.

At the top of the file make sure to set the `hidden` and `access` variables:

```js
//[Variables]
const hidden = true; //ephemeral replies?
const access = ""; //"admin"/"owner"/other custom roles
```

> [!TIP]
> Relevant templates: [`command_context.js`](../templates/commands/command_context.js).

## 2. Config

Make sure that the folder has a `config.json` and add a description for the new command.

> [!NOTE]
> More on `config.json` in [Configs and Database](configs_and_database.md#context-commands-configjson).

## 3. Command Logic (commandsLib)

Add the command implementations in `sc/functions/commands/` - in a new file or new file in a new folder.

> [!TIP]
> Relevant templates: [`commandsLib.js`](../templates/commandsLib.js).

## 4. Set Command Logic Function Name

Specify the command logic function name in the command's `execute` function using `setCommandLogic(functionName)`.

For example:

```js
async execute(commandContext) {
   await commandContext
   .setCommandLogic("inspectMessage")
   .runCommand(access, hidden);
},
```

> [!TIP]
> Relevant templates: [`command_context.js`](../templates/commands/command_context.js).

> [!TIP]
> If you do not wish to use `commandsLib` and want to implement the command inside the `execute` function - refer to [Bonus: Command Logic inside Command Declaration](adding_new_files.md#bonus-command-logic-inside-command-declaration).

# New Component (Button/Select Menu)

## 1. Component Declaration

Add a new file in `src/components/buttons` or `src/components/selectMenus`.
Set a unique name for the component, like so:

```js
data: { name: "my.new.component" },
```

> [!TIP]
> Relevant templates: [`button.js`](../templates/components/button.js), [`selectMenu.js`](../templates/components/selectMenu.js).

## 2. Fine-tune Permissions

At the top of the file make sure to set the `hidden` and `access` variables:

```js
//[Variables]
const hidden = true; //ephemeral replies?
const access = ""; //"admin"/"owner"/other custom roles
```

Additionally, the `prepareExecution` method accepts additional permission checks:

```js
//only run if the component was made for the user currently using the component
const interaction = await commandContext.prepareExecution(access, hidden, { userBound: true });

//only run if the user has a required role
const interaction = await commandContext.prepareExecution(access, hidden, { roleID: <role ID> });
```

## 3. Component Logic

By default, the component's behaviour is implemented in its `execute` function, as shown below:

```js
async execute(commandContext) {
   const interaction = await commandContext.prepareExecution(access, hidden, { userBound: true });
   if (!interaction) return;

   //component logic...

   await interaction.update(msg);
},
```

But feel free to add it to `commandsLib`, for example:

```js
async execute(commandContext) {
   const interaction = await commandContext.prepareExecution(access, hidden, { userBound: true });
   if (!interaction) return;

   await commandsLib.myNewComponent(interaction);
},
```

# New Runtime Function

Add a new function or a new function in a new file in `src/functions/runtime/core` or `src/functions/runtime/services`.

> [!TIP]
> Relevant templates: [`runtimeLib.js`](../templates/runtimeLib.js), [`exampleService.js`](../templates/exampleService.js).

# New Utility Function

Add a new function or a new function in a new file in `src/functions/utils/`.

> [!TIP]
> Relevant templates: [`utilsLib.js`](../templates/utilsLib.js).

# New Schema

Create a new schema file in `src/schemas`.

> [!TIP]
> Relevant templates: [`schema.js`](../templates/schema.js).

## Recommendation

Consider creating a service file for the schema in (`src/functions/runtime/services/`). Include functions like `find`, `findOne`, `create` to simplify schema management. This approach ensures that changes to the schema only require updates to the service file. Service files also make it easy to switch from an external database to local files without breaking the codebase.

> [!TIP]
> Relevant templates: [`exampleService.js`](../templates/exampleService.js).

## Loading Documents During Load

To ensure the new document is loaded and parsed during the bot's initialization:

1. Navigate to [`loadDatabase.js`](../src/functions/runtime/core/loadDatabase.js) and add a function to load and parse the document.

Example singular document:

```js
async function loadNewSchema1() {
  try {
    let newSchema1 = await runtimeLib.findNewSchema1(); //function defined in newSchema1Service.js

    //process the document...

    return parseResult(newSchema1);
  } catch (error) {
    await runtimeLib.handleError(error, __filename);
    errorsCount++;
  }
}
```

Example multiple documents:

```js
async function loadNewSchemas2() {
  try {
    let newSchemas2 = await runtimeLib.findNewSchemas2(); //function defined in newSchema2Service.js

    //process the document...

    return parseResult(newSchemas2);
  } catch (error) {
    await runtimeLib.handleError(error, __filename);
    errorsCount++;
  }
}
```

The `parseResult()` function automatically converts the result to "✓" for a **single** document or the number of documents for **multiple**.

2. Add the function to the loaders map at the top:

```js
//[Loader functions map]
const loadersConfig = {
  profile: { loader: loadProfile, result: "x" },
  newSchema1: { loader: loadNewSchema1, result: "x" }, //default result for single document
  newSchema2: { loader: loadNewSchemas2, result: 0 }, //default result for multiple documents
};
```

> [!CAUTION]
> The bot supports re-runing these files during runtime (using [`/manage reload-database`](built_in_commands.md#manage-database-reload)). Ensure that your functions are safe to re-run, or disable re-running for the specific schema in the [manage command's logic](../src/functions/commands/homeGuild/manage.js).

# New Event Listener

1. Create a new file under:
   - **client/** - to listen to Discord.js events.
   - **database/** - to listen to Mongoose events.
   - **process/** - to listen to process events.
2. Each event listener receives its arguments first, with the app's context object always passed as the last argument.

Here are examples of how an event listener's `execute` function might look:

```js
//clientReady.js
async execute(client, context) { /*listener logic*/ }

//error.js
async execute(error, { runtimeLib }) { /*listener logic*/ }

//example: messageReactionAdd.js (not included in this project)
async execute(messageReaction, user, details, { client, utilsLib, info}) { /*listener logic*/ }

//example: voiceStateUpdate.js (not included in this project)
async execute(oldState, newState, { client, utilsLib, info }) { /*listener logic*/ }
```

## Adding a New Emitter

To add a completely new event for a new emitter:

1. Add a new folder.
2. Head to [`handleEvents.js`](../src/functions/loaders/handleEvents.js) and add the new emitter to the events map at the top:

```js
const folderConfig = {
  client: { emitter: client, counter: 0 }, //Discord.js events
  database: { emitter: connection, counter: 0 }, //Mongoose events
  process: { emitter: process, counter: 0 }, //Process events
  newFolder: { emitter: newEmitter, counter: 0 },
};
```

---

[<- Back to Main Page](../)
