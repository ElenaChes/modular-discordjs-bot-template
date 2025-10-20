//[Variables]
const hidden = true; //ephemeral replies?
const access = ""; //"admin"/"owner"/other custom roles

//[<CUSTOM ID>]: menu
module.exports = ({ utilsLib /*, client, info, etc... */ }) => ({
  data: { name: "<CUSTOM-ID>" },
  async execute(commandContext) {
    const interaction = await commandContext.prepareExecution(access, hidden);
    if (!interaction) return;

    //select menu logic...
  }, //no try/catch necessary -> wrapped with catch during load
});
