//[Imports]
const { Events } = require("discord.js");

//[error]: Runs when client encounters an error
module.exports = {
  name: Events.Error,
  async execute(error, { runtimeLib }) {
    await runtimeLib.handleError(error, __filename, { unhandled: true });
  },
};
