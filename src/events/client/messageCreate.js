//[Imports]
const { Events } = require("discord.js");
const { createCommandContext } = require("../../commandContext/");
const { CONTEXT_ORIGINS } = require("../../config/constants.js");
//[Command parsing]
const NAME_FORMAT = "[a-z0-9]+(?:-[a-z0-9]+)*"; //valid command names
const NAME_SEPARATOR = "."; //"name1.name2" -> ["name1", "name2"]
const ARGS_SEPARATOR = ","; //"arg1, arg2" - > ["arg1", "arg2"]

const CHAINED_NAMES = `(?<commandPart>${NAME_FORMAT}(?:\\.${NAME_FORMAT})*)`; //name1.name2.name3
const CHAINED_ARGS = `(?<argsPart>[^)]*)`; //allow any char except )

const HELP_FORMAT_REGEX = new RegExp(`^help\\(${CHAINED_NAMES}\\);?$`); //"help(name1.name2)" -> ["name1.name2"]
const COMMAND_FORMAT_REGEX = new RegExp(`^${CHAINED_NAMES}\\(${CHAINED_ARGS}\\);?$`); //"name1.name2(arg1, arg2)" -> ["name1.name2", "arg1, arg2"]
/*Message commands behaviours:
"help(command.subgroup.subcommand)"" -> list arguments that /<command> <subgroup> <subcommand> requires
"command.subgroup.subcommand(1, 2, ...)"" -> /<command> <subgroup> <subcommand> (option1 = 1, option2 = 2, ...)
*/

//[messageCreate]: Runs when users send messages in chat
module.exports = {
  name: Events.MessageCreate,
  async execute(message, context) {
    const { info } = context;
    //[Guards]
    if (info.appFlags.noMessages) return; //plain message commands disabled
    if (!checkValidMessage(message, context)) return;

    //[Parse commands]
    let commandContext;

    //[Check if help command was run]
    const helpCommand = parseHelpCommand(message);
    if (helpCommand) commandContext = createCommandContext(CONTEXT_ORIGINS.HelpMessageCreate, message, context, helpCommand);

    //[Check if command was run]
    if (!commandContext) {
      const parsedCommand = parseCommand(message);
      if (parsedCommand) commandContext = createCommandContext(CONTEXT_ORIGINS.MessageCreate, message, context, parsedCommand);
    }

    //[Execute command]
    if (commandContext) {
      const command = await commandContext.getCommand();
      if (command?.execute) return command.execute(commandContext);
    }

    //other messageCreate logic...
  },
};

//[Guards]
function checkValidMessage(message, context) {
  return (
    message && //message exists
    !message.author?.bot && //author isn't a bot
    !message.reference && //message isn't a reply
    !message.interaction && //message isn't an interaction
    context.appLoaded //bot fully loaded
  );
}

//[Parse if message is a help command call]
function parseHelpCommand(message) {
  //"help(command.subgroup.subcommand)" -> ["command", "subgroup", "subcommand"]
  const match = message.content?.match(HELP_FORMAT_REGEX);
  if (!match?.groups) return; //not a help command call

  //"command.subgroup.subcommand" -> ["command", "subgroup", "subcommand"]
  const commandNames = match.groups.commandPart
    .split(NAME_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean);
  return { commandNames };
}

//[Parse if message is a command call]
function parseCommand(message) {
  //"command.subgroup.subcommand(1, 2, ...)" -> ["command.subgroup.subcommand", "1, 2, ..."]
  const match = message.content?.match(COMMAND_FORMAT_REGEX);
  if (!match?.groups) return; //not a command call

  const { commandPart, argsPart } = match.groups;
  //"command.subgroup.subcommand" -> ["command", "subgroup", "subcommand"]
  const commandNames = commandPart
    .split(NAME_SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean);

  //"1, 2, ..." -> ["1", "2", ...]
  const args = argsPart
    ? argsPart
        .split(ARGS_SEPARATOR)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return { commandNames, args };
}
