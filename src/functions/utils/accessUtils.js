//[Imports]
const labels = require("../../config/labels");
//[Permissions map]
let userRoleMap = {}; //{ role: [user IDs] }
let guildRoleMap = {}; //{ role: [guild IDs] }

module.exports = ({ client, utilsLib, info }) => {
  //[Refresh IDs map]
  utilsLib.refreshRoleMap = (IDs) => {
    if (!IDs?.length) return;
    userRoleMap = {};
    guildRoleMap = {};

    for (const entry of IDs) {
      const { idType, value, roles } = entry;
      if (!roles?.length || idType === "other") continue; //only process "user"/"guild" that have roles

      for (const role of roles) {
        const targetMap = idType === "user" ? userRoleMap : guildRoleMap;
        if (!targetMap[role]) targetMap[role] = [];
        targetMap[role].push(value);
      }
    }
    //ownerRole bypasses all user roles
    const ownerIDs = userRoleMap[labels.ownerRole] ?? [];
    for (const role of Object.keys(userRoleMap)) {
      if (role !== labels.ownerRole) userRoleMap[role] = [...new Set([...userRoleMap[role], ...ownerIDs])];
    }

    //homeRole bypasses all other guild roles
    const homeGuilds = guildRoleMap[labels.homeRole] ?? [];
    for (const role of Object.keys(guildRoleMap)) {
      if (role !== labels.homeRole) guildRoleMap[role] = [...new Set([...guildRoleMap[role], ...homeGuilds])];
    }
  };
  utilsLib.isValidUserRole = (role) => !!userRoleMap[role];
  utilsLib.isValidGuildRole = (role) => !!guildRoleMap[role];

  //[Checks user permissions]
  utilsLib.checkAccess = (userID, role) => userRoleMap[role]?.includes(userID) ?? false;
  utilsLib.checkOwnerAccess = (userID) => utilsLib.checkAccess(userID, labels.ownerRole);

  //[Check guild permissions]
  utilsLib.checkGuild = (guildID, role) => guildRoleMap[role]?.includes(guildID) ?? false;
  utilsLib.checkHomeGuild = (guildID) => utilsLib.checkGuild(guildID, labels.homeRole);

  //[Checks if bot has the "extra" role]
  utilsLib.hasExtraInGuild = (guild) =>
    !!(info.extraRole && guild.members.me.roles.cache.find(({ name }) => name === info.extraRole));

  //[Checks if guild has someone with a role]
  utilsLib.guildHasRoleUsers = async (guild, role) => {
    const roleUsers = userRoleMap[role] ?? [];
    for (const userID of roleUsers) {
      try {
        await guild.members.fetch(userID);
        return true; //found member
      } catch (err) {
        if (err.code === 10007) continue; //fetch throws on not found member
        throw err; //rethrow unexpected errors
      }
    }
    return false;
  };
  utilsLib.guildHasOwners = async (guild) => await utilsLib.guildHasRoleUsers(guild, labels.ownerRole);

  //[Check bot is test and in home guild]
  utilsLib.checkTestBotGuild = (guild) => utilsLib.isTestBot() && utilsLib.checkHomeGuild(guild?.id);
};
