//[SIGINT]: Runs when process is closed
module.exports = {
  name: "SIGINT",
  async execute(signalArray, { runtimeLib }) {
    await runtimeLib.closeMongoose();
    process.exit();
  },
};
