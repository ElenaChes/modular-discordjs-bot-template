//[Imports]
const { SlashCommandBuilder } = require("discord.js");
//[Variables]
const hidden = false;
const access = "";

//[/bot]: command
module.exports = ({ utilsLib }) => ({
  data: new SlashCommandBuilder()
    .setName("bot")
    .setDescription("Bot's information.")
    //[/bot about]: command
    .addSubcommand((subcommand) => subcommand.setName("about").setDescription("About the bot."))

    //[/bot commands]: command
    .addSubcommand((subcommand) =>
      subcommand
        .setName("commands")
        .setDescription("Bot's commands.")
        .addStringOption((option) =>
          option.setName("category").setDescription("What command category to display.").setRequired(false).setAutocomplete(true)
        )
    )
    //[/bot ping]: command
    .addSubcommand((subcommand) => subcommand.setName("ping").setDescription("Check bot's ping.")),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused()?.toLowerCase();

    //[Command categories registered in guild]
    const categories = await utilsLib.getCmdCategories(interaction.guild);
    const availableChoices = [{ name: "All categories", value: "all" }, ...categories];

    //[Filter as user types]
    const suggestions = availableChoices?.filter(({ name }) => name.toLowerCase().startsWith(focusedValue));
    await interaction.respond(suggestions.length ? suggestions : [{ name: "No matches", value: "none" }]);
  },
  async execute(commandContext) {
    let options = {};
    if (commandContext.subcommand === "ping") {
      options = { defer: true, saveMessage: true }; //pass message for ping
    }
    await commandContext.runCommand(access, hidden, options);
  },
});
