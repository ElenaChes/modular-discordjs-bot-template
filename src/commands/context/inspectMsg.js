//[Imports]
const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js");
//[Variables]
const type = ApplicationCommandType.Message;
const hidden = true;
const access = "";

//[Inspect message]: command
module.exports = ({}) => ({
  data: new ContextMenuCommandBuilder().setName("Inspect message").setType(type),

  async execute(commandContext) {
    await commandContext //
      .setCommandLogic("inspectMessage")
      .runCommand(access, hidden);
  },
});
