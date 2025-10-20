//[disconnected]: Runs when database gets disconnected
module.exports = {
  name: "disconnected",
  async execute({ utilsLib, runtimeLib }) {
    const msg = `Database disconnected.`;
    await runtimeLib.handleLog(utilsLib.dualColorMsg(msg, "red"));
  },
};
