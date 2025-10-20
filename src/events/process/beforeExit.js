//[Imports]
const { ActivityType, PresenceUpdateStatus: Status } = require("discord.js");

//[beforeExit]: Runs before process closes
module.exports = {
  name: "beforeExit",
  async execute(code, { runtimeLib }) {
    await runtimeLib.refreshPresence({
      activity: "[offline]",
      activityType: ActivityType.Playing,
      status: Status.Invisible,
    });
  },
};
