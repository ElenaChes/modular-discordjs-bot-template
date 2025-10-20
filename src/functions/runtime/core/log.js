module.exports = ({ client, utilsLib, runtimeLib, info }) => {
  //[Notify when something changes]
  runtimeLib.handleLog = async ({ consoleMsg, discordMsg }) => {
    try {
      if (!consoleMsg && !discordMsg) {
        return utilsLib.throwError(__filename, `No message received, pass a consoleMsg and/or a discordMsg.`);
      }

      //[Print log]
      if (consoleMsg) console.log(consoleMsg);

      //[Log in discord]
      if (!info.logChannel) return;
      const logChannel = client.channels.cache.get(info.logChannel);
      if (!logChannel) return;
      await logChannel.send(utilsLib.ansiBlock(discordMsg || consoleMsg));
    } catch (error) {
      console.error(error);
    }
  };
};
