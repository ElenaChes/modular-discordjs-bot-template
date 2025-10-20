//[SIGHUP]: Runs when process is closed
module.exports = {
  name: "SIGHUP",
  async execute(signalArray, { runtimeLib }) {
    await runtimeLib.closeMongoose();
    process.exit();
  },
};
