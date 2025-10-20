//[Imports]
const { SlashCommandBuilder } = require("discord.js");
//[Variables]
const hidden = false;
const access = "";

//[/test-example]: command
module.exports = ({ utilsLib }) => ({
  data: new SlashCommandBuilder().setName("test-example").setDescription("Example test command, only registered on test bot."),

  async execute(commandContext) {
    //prepareExecution instead of runCommand so the logic can go here
    const interaction = await commandContext.prepareExecution(access, hidden);
    if (!interaction) return;

    const msg = "Test command, only registered on test bot.\nBonus dismiss button:";

    //[Reply]
    const button = utilsLib.makeButton("Dismiss message", { customId: "dismiss.msg", style: "Secondary" });
    const row = utilsLib.makeRow([button]);
    await interaction.reply({ content: msg, components: [row] });
  },
});
