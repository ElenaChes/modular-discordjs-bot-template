//[Imports]
const { REST, Routes } = require("discord.js");
const AsciiTable = require("ascii-table");
const labels = require("../../../config/labels");
const { TOKEN } = process.env;
//[Variables]
let commandLogs = ""; //store where commands loaded

module.exports = (context) => {
  const { client, utilsLib, runtimeLib, info, commandsMap } = context;

  //[Run executed command]
  runtimeLib.registerCommands = async (reload = false) => {
    const { appLoaded, load } = context;
    if (!reload) return commandLogs; //fetch logs

    try {
      const start = new Date();

      //wait for handlers
      if (!appLoaded && load) {
        await load.commandsReady;
        await load.databaseReady;
      }
      const actual = new Date();
      await loadCommands(); //force reload

      //[Bot loading]
      if (!appLoaded && load) {
        utilsLib.logTime("Comms", "Register", start, actual);
        return commandLogs;
      }
      //[Bot already online]
      else {
        const executeTime = `Load time: ${utilsLib.timeDiff(start)}`;
        console.log(executeTime);
        return `${commandLogs}\n${executeTime}`;
      }
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  async function loadCommands() {
    const { global, guildLocked } = commandsMap;
    const categories = Object.keys(guildLocked).filter((category) => category !== labels.testFolderName);
    const table = new AsciiTable("Registered Commands")
      .setBorder("|", "=", "0", "0")
      .setHeading("Server", ...categories.map(utilsLib.getInitials)); //heading row
    for (let i = 1; i <= categories.length; i++) table.setAlign(i, AsciiTable.CENTER); //center columns

    let result;
    let message = "";
    const rest = new REST().setToken(TOKEN);

    //[Registering flags]
    const { privateRegister, unregisterGuilds, unregisterGlobal } = info.appFlags;

    //[Global commands]
    if (unregisterGlobal) {
      result = await register(rest, null, []);
      message = result === true ? `\nGlobal slash Commands • Deleted.` : "";
    } else if (global?.commands) {
      result = await register(rest, null, global.commands);
      message = result === true ? `\nGlobal slash Commands • Loaded.` : "";
    }

    //[Guild commands]
    const guilds = Array.from(client.guilds.cache.values());
    for (const guild of guilds) {
      const guildName = info.Aliases?.[guild.id] || guild.name; //handle weird characters
      let commandsToLoad = [];
      const resultsRow = [];
      let loadedTest = false;

      //[Delete commands in guild]
      const unregisterPrivate = privateRegister && !(await utilsLib.guildHasOwners(guild));
      if (unregisterPrivate || unregisterGuilds) {
        result = await register(rest, guild.id, []);
        message += result === true ? `\nSlash Commands • Deleted from ${guildName}.` : "";
      }
      //[Load commands in guild]
      else {
        for (const [name, config] of Object.entries(guildLocked)) {
          if (await config.check(guild)) {
            commandsToLoad.push(...config.commands);
            if (name !== labels.testFolderName) resultsRow.push("✓");
            else loadedTest = true;
          } else {
            if (name !== labels.testFolderName) resultsRow.push("x");
            else loadedTest = false;
          }
        }
        commandsToLoad = [...new Set(commandsToLoad)]; //failsafe
        result = await register(rest, guild.id, commandsToLoad);
      }

      //[Format logs]
      if (result && !(unregisterPrivate || unregisterGuilds)) table.addRow(guildName, ...resultsRow); //loaded -> ✓
      else table.addRow(guildName, ..."x".repeat(categories.length)); //didn't load -> x
      if (loadedTest) message = `\nTest Commands • Loaded in ${guildName}.` + message;
    }

    const msg = table.toString().replaceAll(" ", "_") + message;
    const { consoleMsg, discordMsg } = utilsLib.dualColorMsg(msg, "yellow");
    console.log(consoleMsg);
    commandLogs = discordMsg;
  }
  //[Register commands in guild/globally]
  async function register(rest, guildID, commands) {
    try {
      if (guildID) await rest.put(Routes.applicationGuildCommands(client.user.id, guildID), { body: commands });
      else await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      return true;
    } catch (error) {
      await runtimeLib.handleError(error, __filename);
      return false;
    }
  }
};
