//[Imports]
const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js");
//[Variables]
const type = ApplicationCommandType.User; //or Message
const hidden = true; //ephemeral replies?
const access = ""; //"admin"/"owner"/other custom roles

//[/<COMMAND>]: command
module.exports = ({ utilsLib /*, client, info, etc... */ }) => ({
  data: new ContextMenuCommandBuilder().setName("<COMMAND>").setType(type),

  async execute(commandContext) {
    await commandContext
      .setCommandLogic("<FUNCTION>") //set name of the commandsLib function
      .runCommand(access, hidden); //add { defer: true } to defer
  }, //no try/catch necessary -> wrapped with catch during load
});
