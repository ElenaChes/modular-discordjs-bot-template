# Command Context Class

The `CommandContext` class provides a unified interface for handling both slash commands and plain message commands, simplifying the development by abstracting interaction details and providing a consistent API for both interaction types.<br>
It supports native interaction methods such as `reply`, `editReply`, and `deferReply` for slash commands, as well as `update` and `deferUpdate` for component interactions.

<details>
  <summary><h3>Content</h3></summary>
  
- [Instance Creation](#instance-creation)
  - [Instance Creation Examples](#instance-creation-examples)
- [Public Methods](#public-methods)
  - [setAccess](#setaccess)
  - [setEphemeral](#setephemeral)
  - [setCommandLogic](#setcommandlogic)
  - [prepareExecution](#prepareexecution)
  - [getCommand](#getcommand)
  - [getRaw](#getraw)
  - [runCommand](#runcommand)
  - [handleError](#handleerror)
  - [replyOrEditReply](#replyoreditreply)
- [Helper Functions](#helper-functions)

</details>
<hr>

# Instance Creation

To create a new instance, use the factory function located in [`src/commandContext/index.js`](../src/commandContext/index.js):

```js
createCommandContext(origin <CONTEXT_ORIGINS option>, raw <interaction/message>, libs <context object>, extra <additional args>);
```

The factory function dynamically creates the appropriate class instance based on the origin and interaction type:

- `InteractionContext` - slash command interaction.
- `ComponentContext` - button or select menu interaction.
- `ContextMenuContext` - context menu interaction.
- `MessageContext` - plain message command call.
- `HelpContext` - plain message help command call.

## Instance Creation Examples

Slash command or component:

```js
const commandContext = createCommandContext(CONTEXT_ORIGINS.InteractionCreate, interaction, context);
const command = await commandContext.getCommand();
if (command?.execute) return command.execute(commandContext);
```

Plain message command:

```js
const parsedCommand = parseCommand(message);
if (parsedCommand) commandContext = createCommandContext(CONTEXT_ORIGINS.MessageCreate, message, context, parsedCommand);
const command = await commandContext.getCommand();
if (command?.execute) return command.execute(commandContext);
```

# Public Methods

The base class `ContextBase.js` also provides several public methods:

## setAccess

```js
setAccess(access <string>);
```

Sets the command's access level (for example "owner") and returns an error if the user executing the command lacks the required role.

## setEphemeral

```js
setEphemeral(hidden <boolean>);
```

Sets whether the command's responses should be ephemeral (`true`) or visible to everyone (`false`).

> [!NOTE]
> Responses to plain messages cannot be ephemeral.

## setCommandLogic

```js
setCommandLogic(functionName <string>);
```

Define the name of the function in `commandsLib` that holds the logic of this command.

> [!TIP]
> Useful for <ins>context menus</ins>, since their command names don't correlate to function names.

## prepareExecution

```js
await prepareExecution(access <string>, hidden <boolean>, { userBound <boolean>, roleId <string> });
```

> [!TIP]
> Useful for <ins>components</ins>, both to check the button/menu ownership and to be able to implement the logic in the same file as the component declaration.

1. Sets `ephemeral` (true -> ephemeral, false -> not ephemeral).
2. Sets the `access` and checks permissions.
3. If `userBound` is `true`, verifies whether the user 'owns' the component - whether the message it is attached to was created for this user.
4. If `roleId` is provided, performs an additional permission check to verify whether the user has the required role.
5. Returns the class instance if all checks passed, replies with error message otherwise.

## getCommand

```js
await getCommand();
```

Get the command's declaration (where the "execute" sits).<br>
Returns `null` in the following cases:

- No declaration was found (can happen with plain message command calls).
- Bot's state is "sleep".
- Plain message command arguments weren't valid - an error message is sent by the instance.

## getRaw

```js
getRaw();
```

Get the original full interaction/message/etc.

## runCommand

```js
await runCommand(access <string>, hidden <boolean>,  { defer <boolean>, saveMessage <boolean> });
```

> [!TIP]
> Useful for **slash** commands and **context** menus.

1. Sets `ephemeral` (true -> ephemeral, false -> not ephemeral).
2. If `defer` is `true`, defers the interaction. If `saveMessage` is `true` saves the message in the instance.
3. Sets the `access` and checks permissions.
4. Runs additional checks if they're defined in extending classes (`MessageContext` runs an argument check).
5. Executes the command logic if it is found in `commandsLib[functionName]`.

> [!NOTE]
> Instead of executing the command, `HelpContext` instances override `runCommand` - they only check the `access` permissions and reply with the command's description and options.

## handleError

```js
await handleError({ message <string>, error <error>, location <string/object> });
```

Sends a user-friendly error message to the user.<br>
If an error was passed, it invokes the global error handler to process the error logs.

## replyOrEditReply

```js
await replyOrEditReply(payload <string/object>);
```

Replies or editReplies based on whether the interaction was deferred.

> [!TIP]
> Useful in functions where the interaction can be deferred or not deferred (for example - aid utilities).

# Helper Functions

The `CommandContext` class includes several helper functions located in `commandContext/helpers/`:

- `argumentValidators.js`: Provides parsing functions for `MessageContext`. These functions convert plain message arguments into proper interaction options and validate them against the expected options for the corresponding slash command.
- `commandBindings.js`: Used by all classes and saved as `this._helpers` by the base class. This helper contains property assigners for class instances, shared methods, and other utilities.
- `commandOptions.js`: Parses slash command options for `MessageContext` and `HelpContext`.

---

[<- Back to Main Page](../)
