//[Imports]
const AsciiTable = require("ascii-table");
const { CONTEXT_TYPES } = require("../../../config/constants.js");
const { errors } = require("../../../config/info.json");

module.exports = ({ client, utilsLib, runtimeLib, info }) => {
  //[Wrapper for commands declarations and logic]
  runtimeLib.wrapWithCatch = (fn, { errorMsg, fileName }) => {
    return async (commandContext, ...args) => {
      try {
        return await fn(commandContext, ...args);
      } catch (error) {
        const finalErrorMsg = errorMsg ?? getFriendlyErrorMsg(commandContext.type);
        //custom error handler
        await commandContext.handleError({ message: finalErrorMsg, error, location: { fileName, fnName: fn.name } });
      }
    };
  };
  function getFriendlyErrorMsg(type) {
    //prettier-ignore
    switch (type) {
      case CONTEXT_TYPES.Button: return errors.buttonFailure;
      case CONTEXT_TYPES.StringSelectMenu:
      case CONTEXT_TYPES.UserSelectMenu:
      case CONTEXT_TYPES.RoleSelectMenu:
      case CONTEXT_TYPES.ChannelSelectMenu:
      case CONTEXT_TYPES.MentionableSelectMenu: return errors.menuFailure;
      default: return errors.commandFailure;
    }
  }
  //[Wrapper for command autocomplete]
  runtimeLib.plainWrapWithCatch = (fn, { fileName }) => {
    return async (interaction, ...args) => {
      try {
        return await fn(interaction, ...args);
      } catch (error) {
        //custom error handler
        await runtimeLib.handleError(error, fileName, { guild: interaction.guild, user: interaction.user });
      }
    };
  };

  //[Notify when something crashes]
  runtimeLib.handleError = async (error, location, { crash = false, unhandled = false, guild = null, user = null } = {}) => {
    try {
      //[Format table]
      const header = unhandled ? "Unhandled Error" : "Error";
      const table = new AsciiTable(header).setBorder("|", "=", "0", "0");
      //normalize location
      let fileName, fnName;
      if (typeof location === "string") {
        fileName = location;
        fnName = null;
      } else if (typeof location === "object" && location !== null) {
        ({ fileName, fnName } = location);
      }
      const locationName = utilsLib.getFileName(fileName) + (fnName ? `: ${fnName}` : "");
      const errorMessage = unhandled ? `Error caught by ${locationName}` : `Error occurred in ${locationName}`;
      table.addRow(errorMessage);
      //error origin (line & column)
      const origin = findOriginLineCol(error);
      if (origin) table.addRow(`Origin: ${origin}`);
      //other info
      if (guild?.name && guild?.id) table.addRow(`Guild: ${info.Aliases?.[guild.id] || guild.name}`);
      if (user?.username) table.addRow(`User: ${user.username}`);
      if (error) table.addRow((error.message || error.toString())?.split("\n", 1)[0]);

      //[Print error]
      let msg = table.toString().replaceAll(" ", "_");
      console.log(utilsLib.colorMsg(msg, "black"));
      if (error) console.error(error);

      //[Log in discord]
      if (!info.logChannel) return;
      const logChannel = client.channels.cache.get(info.logChannel);
      if (!logChannel) return;
      if (crash) msg += "\n" + utilsLib.colorDiscMsg(`${client.user.tag} crashed.`, "red"); //bot crashes on unhandled
      await logChannel.send(utilsLib.codeBlock(msg));
    } catch (error) {
      console.error(error);
    }
  };
  //[Find error origin]
  function findOriginLineCol(error) {
    if (!error?.stack) return;
    const stackLines = error.stack.split("\n");
    if (stackLines.length < 2) return;

    //[Find file & line & column]
    const callerLine = stackLines[1];
    const regex = /\((.*):(\d+):(\d+)\)$/;
    const match = regex.exec(callerLine);
    if (match?.length !== 4) return;

    //[Format origin]
    const filepath = utilsLib.getFileName(match[1]);
    const line = parseInt(match[2], 10);
    const column = parseInt(match[3], 10);
    return `${filepath}:${line}:${column}`;
  }
};
