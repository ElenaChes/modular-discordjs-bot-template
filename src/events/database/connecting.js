//[connecting]: Runs when database is connecting
module.exports = {
  name: "connecting",
  async execute(context) {
    const { appLoaded, utilsLib, runtimeLib, load } = context;

    const msg = `Database connecting...`;
    const { consoleMsg, discordMsg } = utilsLib.dualColorMsg(msg, "cyan");
    if (!appLoaded) {
      load?.addLogs(discordMsg);
      console.log(consoleMsg);
      return;
    }
    //else
    await runtimeLib.handleLog({ consoleMsg, discordMsg });
  },
};
