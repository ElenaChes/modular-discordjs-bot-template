//[exit]: Runs when process closes
module.exports = {
  name: "exit",
  async execute(code, { client, utilsLib }) {
    const msg = `${client.user.tag} has shut down.`;
    console.log(utilsLib.colorMsg(msg, "red"));
  },
};
