module.exports = {
  ownerRole: "owner", //bot's owner role
  homeRole: "homeGuild", //bot's testing server role
  testLabel: "test", //default label of the test bot

  globalCommandNames: ["bot"], //top-level names of commands that should register globally
  lockedFolderNames: ["serverLocked"], //folders that store server-locked commands
  testFolderName: "test", //folder with test commands
};
