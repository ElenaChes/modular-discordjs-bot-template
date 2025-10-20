//[Imports]
const { SlashCommandBuilder } = require("discord.js");
//[Variables]
const hidden = true; //ephemeral replies?
const access = ""; //"admin"/"owner"/other custom roles

//[/<COMMAND>]: command
module.exports = ({ utilsLib /*, client, info, etc... */ }) => ({
  data: new SlashCommandBuilder().setName("<COMMAND>").setDescription("<DESCRIPTION>"),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused()?.toLowerCase();

    //autocomplete logic (conditional filtering, adding choices, etc)
    const availableChoices = [
      //options for autocomplete...
    ];

    //[Filter as user types]
    const suggestions = availableChoices?.filter(({ name }) => name.toLowerCase().startsWith(focusedValue));
    await interaction.respond(suggestions.length ? suggestions : [{ name: "No matches", value: "none" }]);
  }, //no try/catch necessary -> wrapped with catch during load

  async execute(commandContext) {
    await commandContext.runCommand(access, hidden); //add { defer: true } to defer
  }, //no try/catch necessary -> wrapped with catch during load
});
