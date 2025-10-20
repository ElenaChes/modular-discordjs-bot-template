//[Imports]
const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js");
//[Variables]
const type = ApplicationCommandType.User;
const hidden = true;
const access = "";

//[Inspect user]: command
module.exports = ({}) => ({
  data: new ContextMenuCommandBuilder().setName("Inspect user").setType(type),

  async execute(commandContext) {
    await commandContext //
      .setCommandLogic("inspectUser")
      .runCommand(access, hidden);
  },
});
