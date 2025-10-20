//[Imports]
const { Events } = require("discord.js");
const { version } = require("../../config/info.json");

//[clientReady]: Runs when bot comes online
module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client, context) {
    const { utilsLib, runtimeLib, info, load } = context;
    utilsLib.logTime("App", "Ready");

    //[Run "ready" handlers]
    await runtimeLib.loadDatabase();
    const commandLogs = await runtimeLib.registerCommands(true);
    await load.handlersReady;
    await runtimeLib.updateLoadTime();

    //[Bot is online]
    const botVersion = version ? ` v${version}` : "";
    utilsLib.logTime("App", "Online");

    //[Notify that bot is online]
    const { consoleMsg: consoleTimes, discordMsg: discordTimes } = utilsLib.dualColorMsg(formatTimes(load.times), "cyan");
    console.log(consoleTimes);
    console.log(utilsLib.colorMsg(`Logged in as ${client.user.tag}${botVersion}!`, "green"));
    if (info.logChannel) {
      const logChannel = client.channels.cache.get(info.logChannel);
      if (logChannel && load.logs) {
        await logChannel.send(utilsLib.ansiBlock(load.logs));
        if (commandLogs) await logChannel.send(utilsLib.ansiBlock(commandLogs));
        const loginMsg = utilsLib.colorDiscMsg(`${client.user.tag} v${version} is online.`, "green");
        await logChannel.send(utilsLib.ansiBlock(discordTimes + "\n" + loginMsg));
      }
    }
    delete context.load;
    context.appLoaded = true;
    console.timeEnd("Load time");
  },
};
//[Format load times]
function formatTimes(table) {
  return table
    .toString()
    .split("\n")
    .map((line) => {
      line = line.replace(/^\| (\w)]/, "|$1]"); //| X] -> |X]
      if (!/^\|[A-Z]\]/.test(line)) line = line.replace(/^(.)[ =]/, "$1"); //fix length in other lines

      return line.replaceAll(" ", "_");
    })
    .join("\n");
}
