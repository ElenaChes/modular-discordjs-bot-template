//[Imports]
const { ApplicationCommandType, ApplicationCommandOptionType, InteractionContextType } = require("discord.js");
const { ChatInput, User, Message } = ApplicationCommandType;
const { Subcommand, SubcommandGroup } = ApplicationCommandOptionType;
const AsciiTable = require("ascii-table"); //printable table
const labels = require("../../config/labels");
//[Variables]
const contextConfigs = {};
const lockedPermsConfigs = {};

module.exports = (context) => {
  const { client, utilsLib, runtimeLib, info, commandsMap, load } = context;
  const { commands } = client;
  //[Mapping variables]
  const regularCommands = { commands: [], subCmdCount: 0 }; //default array
  const lockedFolderConfig = {}; //storing locked folder arrays & their counters
  const globalCommands = []; //global commands, get counted with regular commands
  let topLvlCount = 0; //total top level commands
  let contextCount = 0; //count context commands separately, get added to regular array

  //[Process command files to be registered]
  load.handleCommands = async () => {
    const start = new Date();
    await load.accessReady;
    const actual = new Date();
    const commandFolders = utilsLib.getFolders("./commands");

    //[Iterate command folders]
    for (const folder of commandFolders) {
      const fullPath = `commands/${folder}`;
      if (!labels.lockedFolderNames.includes(folder)) processFolder(folder, fullPath);
      else {
        const lockedFolders = utilsLib.getFolders(`./${fullPath}`);
        //[Load commands permissions]
        const folderPermsConfig = utilsLib.safeRequire(`./${fullPath}/config.js`)(utilsLib);
        if (folderPermsConfig) Object.assign(lockedPermsConfigs, folderPermsConfig);

        //[Iterate sub folders]
        for (const lockedFolder of lockedFolders) {
          let check = lockedPermsConfigs[lockedFolder]; //locked command permission check
          if (!check) {
            if (lockedFolder == labels.testFolderName) check = utilsLib.checkTestBotGuild; //test folder permission check
            else utilsLib.throwError(__filename, `Missing a perms definition for "${lockedFolder}" in ./${fullPath}/config.js.`);
          }
          lockedFolderConfig[lockedFolder] = { commands: [], subCmdCount: 0, check };
          processFolder(lockedFolder, `${fullPath}/${lockedFolder}`);
        }
      }
    }
    //[Global commands]
    commandsMap.global = { commands: globalCommands };

    //[Guild commands]
    commandsMap.guildLocked = { regular: { commands: regularCommands.commands, check: () => true } }; //regular registers in all guilds
    for (const [folder, { subCmdCount, ...commandsAndCheck }] of Object.entries(lockedFolderConfig)) {
      commandsMap.guildLocked[folder] = commandsAndCheck;
    }

    //[Sync context command descriptions]
    for (const [name, desc] of Object.entries(contextConfigs)) {
      let parsedDesc = findDescReference(desc);
      const command = commands.get(name);
      if (!command?.data) {
        //not code breaking but probably a mistake
        utilsLib.warn("handleCommands", `config.json has a field "${name}" for a context command that doesn't exist.`);
        continue;
      }
      saveContextCommand(command.data.toJSON(), parsedDesc);
    }
    //[Category names for autocomplete]
    info.commandCategories = Object.keys(info.commandDescs).map((key) => ({ name: utilsLib.capitalize(key), value: key }));

    //[Format logs]
    const table = new AsciiTable("Commands").setBorder("|", "=", "0", "0").setAlign(1, AsciiTable.CENTER);
    table.addRow(`Top level commands`, topLvlCount || "0");
    table.addRow(`Regular sub commands`, regularCommands.subCmdCount || "0");
    table.addRow(`Context commands`, contextCount || "0");
    for (const [name, config] of Object.entries(lockedFolderConfig)) {
      table.addRow(`${utilsLib.capitalize(name)} sub commands`, config.subCmdCount || "0");
    }
    const msg = table.toString().replaceAll(" ", "_");
    const { consoleMsg, discordMsg } = utilsLib.dualColorMsg(msg, "yellow");
    load.addLogs(discordMsg);
    console.log(consoleMsg);
    utilsLib.logTime("Comms", "Handler", start, actual);
  };

  //[Process command files]
  function processFolder(folder, fullPath) {
    const config = lockedFolderConfig[folder] || regularCommands;
    const files = utilsLib.getFiles(`./${fullPath}`);
    for (const file of files) {
      const command = require(`../../${fullPath}/${file}`)(context);
      let jsonCommand = command.data.toJSON();

      //[Check valid command]
      if (!("data" in command)) utilsLib.throwError(__filename, `Command missing "data" ./${fullPath}/${file}.`);
      if (!("execute" in command)) utilsLib.throwError(__filename, `Command missing "execute" ./${fullPath}/${file}.`);
      if (!("autocomplete" in command) && hasAutocompleteOption(jsonCommand.options))
        utilsLib.throwError(__filename, `Command missing "autocomplete" ./${fullPath}/${file}.`);
      if (jsonCommand.type == ChatInput && (!jsonCommand.options || !jsonCommand.description))
        utilsLib.throwError(__filename, `Malformed command ./${fullPath}/${file}.`); //slash commands always have options & description

      //[Save command]
      command.execute = runtimeLib.wrapWithCatch(command.execute, { fileName: file }); //wrap "execute"
      if (command.autocomplete) command.autocomplete = runtimeLib.plainWrapWithCatch(command.autocomplete, { fileName: file }); //wrap "autocomplete"
      commands.set(command.data.name, command);

      //[Categorize commands]
      if (labels.globalCommandNames?.includes(jsonCommand.name)) {
        if (info.appFlags.guildOnly && "setContexts" in command.data) {
          command.data.setContexts([InteractionContextType.Guild]); //work only in servers
          jsonCommand = command.data.toJSON();
        }
        globalCommands.push(jsonCommand);
      } else config.commands.push(jsonCommand);

      //[Command types]
      switch (jsonCommand.type) {
        //[Slash command]
        case ChatInput:
          saveSlashCommandInfo(jsonCommand, folder);
          topLvlCount++; //count top level
          config.subCmdCount += jsonCommand.options?.length || 1; //count sub commands
          break;
        //[Context command]
        case User:
        case Message:
          saveDescReference(jsonCommand, fullPath);
          contextCount++; //count context commands
          break;
        default:
          utilsLib.throwError(__filename, `Unknown command type "${jsonCommand.type}" in ./${fullPath}/${file}.`);
      }
    }
  }

  //[Save desc reference for context commands]
  function saveDescReference(command, fullPath) {
    if (!(command.name in contextConfigs)) {
      const folderConfig = utilsLib.safeRequire(`./${fullPath}/config.json`);
      if (folderConfig) Object.assign(contextConfigs, folderConfig);
      if (!(command.name in contextConfigs))
        utilsLib.throwError(__filename, `Missing a description for "${command.name}" in ./${fullPath}/config.json.`);
    }
  }

  //[Find desc for context commands]
  function findDescReference(desc) {
    if (!desc.startsWith("/")) return desc; //not a command reference

    const commandName = desc.slice(1).split(" ")[0];
    const commandInfo = info.commandDescs[commandName];
    if (!commandInfo) return "";
    for (const line of commandInfo) {
      if (line.includes(desc)) return line.split(" - ")[1];
    }
    return desc;
  }

  //[Save info for later]
  function saveSlashCommandInfo(command, category) {
    try {
      const lines = [];

      //[1 level deep] /<command>
      if (!hasSubCommandsOrGroups(command)) {
        if (command.name === "help" && !info.appFlags.noMessages)
          utilsLib.warn(
            "handleCommands",
            [
              `Having a /help command with no sub commands is not recommended as its behaviour is undefined due to the plain message help command.`,
              `If you're not using the default help command syntax "help(command.name)", feel free to ignore this warning.`,
            ].join("\n")
          );
        lines.push(formatCommand([command.name], command.description)); //plain top level command
      }
      //[2+ levels deep] /<command> <subgroup/subcommand> <?>
      else {
        lines.push(formatTitle(command.name, command.description)); //save title
        for (const sub of command.options) {
          //[2 levels deep] /<command> <subgroup/subcommand>
          if (!isSubcommandGroup(sub) || !hasSubCommands(sub)) {
            lines.push(formatCommand([command.name, sub.name], sub.description));
          }
          //[3 levels deep] /<command> <subgroup> <subcommand>
          else {
            for (const subsub of sub.options) {
              lines.push(formatCommand([command.name, sub.name, subsub.name], subsub.description));
            }
          }
        }
      }
      if (!info.commandDescs[category]) info.commandDescs[category] = {};
      info.commandDescs[category][command.name] = lines;
    } catch (error) {
      console.error(error);
    }
  }
  function saveContextCommand(command, desc) {
    try {
      //[Get command type label]
      const contextLabel = ApplicationCommandType[command.type]?.toLowerCase();
      if (!contextLabel) utilsLib.throwError(__filename, `Unknown command type "${command.type}" in ${command.name}.`);

      //[Format command description]
      if (!info.commandDescs.context) info.commandDescs.context = {};
      if (!info.commandDescs.context[contextLabel]) {
        info.commandDescs.context[contextLabel] = [`**${contextLabel}** - Right click/long tap a ${contextLabel} to use:`];
      }
      const line = formatCommand([command.name], desc, true);
      info.commandDescs.context[contextLabel].push(line);
    } catch (error) {
      console.error(error);
    }
  }
};

//[Aid functions]
function hasAutocompleteOption(options) {
  if (!options || !options.length) return false;
  for (const opt of options) {
    if (opt.autocomplete) return true; //found
    //check sub options
    if (opt.options) if (hasAutocompleteOption(opt.options)) return true;
  }
  return false;
}
function formatTitle(name, desc, context = false) {
  const slash = !context ? "/" : "";
  if (!desc) return `**${slash}${name}**:`;

  const cleanDesc = desc.replace(/ *\([^)]*\)|[.?]+$/g, "").trim(); //remove trailing punctuation & brackets
  return `**${slash}${name}** - ${cleanDesc}:`;
}
function formatCommand(names, desc, context = false) {
  const slash = !context ? "/" : "";
  if (!desc) return `> [__\`${slash}${names.join(" ")}\`__]`;
  return `> [__\`${slash}${names.join(" ")}\`__] - ${desc}`;
}
function isSubcommandGroup(option) {
  return option.type === SubcommandGroup;
}
function hasSubCommandsOrGroups(command) {
  return command.options?.some((option) => option.type === Subcommand || option.type === SubcommandGroup);
}
function hasSubCommands(command) {
  return command.options?.some((option) => option.type === Subcommand);
}
