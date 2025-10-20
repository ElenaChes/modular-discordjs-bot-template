//[Variables]
const hidden = true;
const access = "";

//[Dismiss message]: button
module.exports = ({}) => ({
  data: { name: "dismiss.msg" },
  async execute(commandContext) {
    const interaction = await commandContext.prepareExecution(access, hidden, { userBound: true });
    if (!interaction) return;

    await interaction.message.delete();
  },
});
