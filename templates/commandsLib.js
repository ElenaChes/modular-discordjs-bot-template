module.exports = ({ client, utilsLib, commandsLib, runtimeLib, info }) => {
  const { wrapWithCatch } = runtimeLib;
  //[/commandName]
  commandsLib.commandName = wrapWithCatch(
    async function commandName(interaction) {
      //command logic...
    },
    { errorMsg: "Custom user friendly error.", fileName: __filename }
  );
};
