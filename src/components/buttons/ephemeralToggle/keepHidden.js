//[Variables]
const hidden = true;
const access = "";

//[Keep Hidden]: button
module.exports = ({ utilsLib }) => ({
  data: { name: "toggle.hidden" },
  async execute(commandContext) {
    const interaction = await commandContext.prepareExecution(access, hidden, { userBound: true });
    if (!interaction) return;

    const filteredPayload = utilsLib.stripEphemeralToggle(interaction.message);

    //[Reply]
    await interaction.update(filteredPayload);
  },
});
