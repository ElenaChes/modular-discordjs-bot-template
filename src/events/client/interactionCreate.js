//[Imports]
const { Events, MessageFlags } = require("discord.js");
const { createCommandContext } = require("../../commandContext/");
const { CONTEXT_ORIGINS } = require("../../config/constants.js");
const { errors } = require("../../config/info.json");
//[Variables]
const hidden = true; //ephemeral replies

//[interactionCreate]: Runs when bot receives a command
module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, context) {
    if (!interaction) return;
    const { client, utilsLib, runtimeLib } = context;

    //[Guards]
    if (!context.appLoaded) return await interactionSendError(interaction, errors.loadingError, context);

    //[Parse command]
    try {
      //[Autocomplete commands]
      if (interaction.isAutocomplete()) {
        if (utilsLib.isBotAsleep()) return; //bot is asleep
        const { commandName } = interaction;
        const command = client.commands.get(commandName);
        if (command?.autocomplete) return command.autocomplete(interaction);
      }
      //[Other commands]
      const commandContext = createCommandContext(CONTEXT_ORIGINS.InteractionCreate, interaction, context);
      const command = await commandContext.getCommand();
      if (command?.execute) return command.execute(commandContext);
    } catch (error) {
      await interactionSendError(interaction, errors.interactionFailure, context);
      await runtimeLib.handleError(error, __filename, { guild: interaction.guild, user: interaction.user });
    }
  },
};
//[Safely send errors]
async function interactionSendError(interaction, error, { runtimeLib }) {
  try {
    if ("reply" in interaction) return await interaction.reply({ content: error, flags: hidden ? MessageFlags.Ephemeral : 0 });
  } catch (error) {
    await runtimeLib.handleError(error, __filename, { guild: interaction.guild, user: interaction.user });
  }
}
