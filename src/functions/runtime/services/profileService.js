//[Imports]
const { ActivityType, PresenceUpdateStatus: Status } = require("discord.js");
//[Access to database]
const mongoose = require("mongoose");
const Profile = mongoose.model("Profile");

module.exports = ({ client, runtimeLib }) => {
  //[Find this bot's profile]
  runtimeLib.findBotProfile = async () => {
    return await Profile.findOne({ botID: client.user.id });
  };
  //[Find profile or create default]
  runtimeLib.findOrCreateProfile = async () => {
    let profile = await Profile.findOne({ botID: client.user.id });
    if (!profile) {
      profile = await Profile.create({
        botID: client.user.id,
        botLabel: "test",
        presence: {
          activity: "with commands",
          activityType: ActivityType.Playing,
          status: Status.DoNotDisturb,
        },
      });
    }
    return profile;
  };
  //[Update fields in profile]
  runtimeLib.updateBotProfile = async (update) => {
    return await Profile.updateOne({ botID: client.user.id }, update);
  };
  //[Update load time to current time]
  runtimeLib.updateLoadTime = async () => {
    const now = new Date();
    await Profile.updateOne({ botID: client.user.id }, { loginTime: now.toISOString(), loadCommandsTime: now.toISOString() });
  };
  //[Update command load time to current time]
  runtimeLib.updateLoadCmdTime = async () => {
    const now = new Date();
    await Profile.updateOne({ botID: client.user.id }, { loadCommandsTime: now.toISOString() });
  };
  //[Reload presence from profile]
  runtimeLib.refreshPresence = async (presence) => {
    try {
      //[Fetch presence from profile]
      if (!presence || !("activity" in presence) || !("activityType" in presence) || !("status" in presence)) {
        const profile = await Profile.findOne({ botID: client.user.id });
        presence = profile.presence;
      }
      //[Update presence]
      client.user.setPresence({
        activities: [{ name: presence.activity, type: presence.activityType }],
        status: presence.status,
      });
    } catch (error) {
      await runtimeLib.handleError(error, __filename);
    }
  };
};
