//[error]: Runs when database gives an error
module.exports = {
  name: "error",
  async execute(error, { utilsLib, runtimeLib }) {
    const msg = `There was an error with the database connection:\n ${error}`;
    await runtimeLib.handleLog(utilsLib.dualColorMsg(msg, "red"));
    console.error(error);
  },
};
