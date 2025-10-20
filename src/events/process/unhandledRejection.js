//[unhandledRejection]: Runs when a promise is rejected
module.exports = {
  name: "unhandledRejection",
  async execute(reason, promise, { runtimeLib }) {
    await runtimeLib.handleError(reason, __filename, { unhandled: true });
  },
};
