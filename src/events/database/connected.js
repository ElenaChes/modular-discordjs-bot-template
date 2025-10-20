//[connected]: Runs when database is connected
module.exports = {
  name: "connected",
  async execute(context) {
    const { appLoaded, utilsLib, runtimeLib, load } = context;
    
    const msg = `Database connected.`;
    const { consoleMsg, discordMsg } = utilsLib.dualColorMsg(msg, "green");
    if (!appLoaded) {
      load?.addLogs(discordMsg);
      console.log(consoleMsg);
      return;
    }
    //else
    await runtimeLib.handleLog({ consoleMsg, discordMsg });
    runtimeLib.refreshPresence();
  },
};
