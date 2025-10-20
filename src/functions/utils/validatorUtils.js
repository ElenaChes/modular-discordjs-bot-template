//[Imports]
const { MessageFlags } = require("discord.js");
const labels = require("../../config/labels");

module.exports = ({ utilsLib, info }) => {
  //[Check bot is test or production]
  utilsLib.isTestBot = () => info.appLabel === labels.testLabel;

  //[Check if bot is asleep]
  utilsLib.isBotAsleep = () => info.appState === "sleep"; //not allowed to respond to interactions/messages

  //[Check if message flags are set to ComponentsV2]
  utilsLib.isComponentsV2 = (payload) => {
    return payload.flags && (payload.flags & MessageFlags.IsComponentsV2) === MessageFlags.IsComponentsV2;
  };

  //[Check if string is a valid url]
  utilsLib.checkValidUrl = (string) => {
    if (typeof string !== "string" || !string) return false;
    if (!string.startsWith("http://") && !string.startsWith("https://")) return false;
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  //[Check if bot can manage (give/remove) given role]
  utilsLib.checkValidRole = (guild, { role, roleID }) => {
    if (!role && !roleID) return false;

    const botMember = guild.members.me;
    if (!botMember) return false; //failsafe - bot not in guild
    const botHighestRole = botMember.roles.highest;
    if (!botHighestRole) return false; //failsafe - bot has no roles

    const targetRole = role || guild.roles.cache.get(roleID);
    if (!targetRole) return false; //role not found

    return targetRole.position < botHighestRole.position;
  };
};
