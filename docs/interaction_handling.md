# Interaction Handling

In most Discord bots, two main events handle interactions between users and the bot: `interactionCreate` and `messageCreate`. This template uses a [command context](command_context.md) abstraction class to parse both events, enabling developers to support commands via slash command interactions and plain messages without the complexity of handling each type separately.

<details>
  <summary><h3>Content</h3></summary>
  
- [Interaction Create](#interaction-create)
  - [1. Check for Autocomplete Interaction](#1-check-for-autocomplete-interaction)
  - [2. Parse Command Context](#2-parse-command-context)
  - [3. Get Command Declaration](#3-get-command-declaration)
  - [4. Execute Command](#4-execute-command)
  - [5. Run Command Logic](#5-run-command-logic)
- [Message Create](#message-create)
  - [1. Check for Help Command or Command Declaration](#1-check-for-help-command-or-command-declaration)
  - [2. Command Context Parsing](#2-command-context-parsing)
  - [3. Get Command Declaration](#3-get-command-declaration-1)
  - [4. Execute Command](#4-execute-command-1)
  - [5. Run Command Logic](#5-run-command-logic-1)

</details>
<hr>

# Interaction Create

When an `interactionCreate` event is fired, the app performs the following steps:

## 1. Check for Autocomplete Interaction

`interactionCreate.js` checks if it is an **Autocomplete** interaction and, if so, runs the associated autocomplete function.

## 2. Parse Command Context

If the interaction is not **Autocomplete**, it is parsed into an **InteractionContext** instance. `createCommandContext` determines if the interaction is a slash command, button/select menu or a context menu and creates the appropriate instance:

- The interaction's information gets added to the class (guild, user, channel, etc).
- The class stores the interaction's options like string options, numbers, and so on (if relevant).
- Adds responding methods, such as `reply`, `editReply` and `deferReply` for slash commands, or `update` and `deferUpdate` for components.
- Parses the command's full name and tries to find its logic, `/manage log-channel check` -> `commandsLib["manageLogChannelCheck"]`.

## 3. Get Command Declaration

`interactionCreate.js` attempts to retrieve the command's declaration via `getCommand`. If the declaration does not exist or the bot is in "sleep" mode, `null` will be returned.

## 4. Execute Command

The command's `execute` function runs, which in turn calls `runCommand`, passing the file's `access` and `hidden` values.

## 5. Run Command Logic

If all of `runCommand`'s checks passed the command's logic runs.

> [!IMPORTANT]  
> The command logic functions call the `commandContext` instance they receive "`interaction`". This is intentional to mimic native interaction behaviour, making it easier to follow Discord.js documentation and online code snippets.<br>
> This "`interaction`" includes additional non-native methods (see [here](command_context.md#public-methods)) that you can use if you are comfortable mixing native behaviours with the built-in custom command context class.

# Message Create

> [!TIP]
> If you do not want to support plain message commands, use the `--no-messages` flag when launching the bot.<br>
> Learn more about the built-in flags [here](README.md#flags).

When a `messageCreate` event is fired, the app performs the following steps:

## 1. Check for Help Command or Command Declaration

`messageCreate.js` checks if a command was called using regex patterns:

- Help command – for example `help(manage.log-channel.check)`
- Plain command – for example `manage.log-channel.check()`

> [!TIP]
> You can adjust the command and help call formats by modifying the regexes in [`messageCreate.js`](../src/events/client/messageCreate.js).

## 2. Command Context Parsing

Depending on the command type, a context instance is created:

- Help command call -> `HelpContext`
- Command call -> `MessageContext`

In both cases:

- The message's information gets added to the class (guild, user, channel, etc).
- "Fake" responding methods are made (for example `message.reply` instead of `interaction.reply`).

For command calls also:

- The arguments passed in the message are parsed into options and validated according to the command declaration's options.
- The command's full name gets parsed and used to find its logic, `manage.log-channel.check()` -> `commandsLib["manageLogChannelCheck"]`.

## 3. Get Command Declaration

`messageCreate.js` tries to get the command's declaration via `getCommand`. If the declaration does not exist, the arguments are invalid (for a command call), or the bot is in "sleep" mode, `null` will be returned.

> [!NOTE]
> If the command name does not match an existing command declaration, the instance treats the message as a typo or accidental command-like syntax and ignores it rather than giving an error.

## 4. Execute Command

The command's `execute` function runs, which in turn calls `runCommand`, passing the file's `access` and `hidden` values.

## 5. Run Command Logic

**Help Command:**

- `runCommand` verifies that the user has permissions to look-up the requested command, parses its options (types, descriptions), and fetches autocomplete lists if relevant.
- Finally, it replies with the help description.

**Command call:**

- Merge with slash command logic: if all of `runCommand`'s checks passed the command's logic runs.

> [!IMPORTANT]
> If the arguments passed in a command call are incorrect (wrong type, amount, etc) - the user is given a list of the command's options (same as the help command's), unless the user is lacking the permissions to use the command in the first place.

---

[<- Back to Main Page](README.md)
