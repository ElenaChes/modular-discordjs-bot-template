//[Variables]
const hidden = true;
const access = "";

//[Make Public]: button
module.exports = ({ utilsLib }) => ({
  data: { name: "toggle.public" },
  async execute(commandContext) {
    const interaction = await commandContext.prepareExecution(access, hidden, { userBound: true });
    if (!interaction) return;

    const filteredPayload = utilsLib.stripEphemeralToggle(interaction.message);

    //[Reply]
    await interaction.channel.send(filteredPayload);
    if (utilsLib.isComponentsV2(interaction.message)) {
      await interaction.update({ components: [utilsLib.makeTextDisplay("Displayed message.")], ...utilsLib.useV2 });
    } else await interaction.update({ content: "Displayed message.", embeds: [], components: [] });
  },
});
