//[uncaughtException]: Runs when process crashes
module.exports = {
  name: "uncaughtException",
  async execute(error, origin, { runtimeLib }) {
    await runtimeLib.closeMongoose();
    await runtimeLib.handleError(error, __filename, { crash: true, unhandled: true });
    process.exit(1);
  },
};
