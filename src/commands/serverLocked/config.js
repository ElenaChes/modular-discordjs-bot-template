module.exports = (utilsLib) => {
  return {
    //register in servers with bot's owners
    owner: async (guild) => utilsLib.guildHasOwners(guild),

    //register in bot's testing server
    homeGuild: async (guild) => utilsLib.checkHomeGuild(guild?.id),

    //register where bot has "extra" role
    extraRole: async (guild) => utilsLib.hasExtraInGuild(guild),

    /*NOTE! No need to set a check for the test folder.
    Test folder name is defined in config/labels.js*/
  };
};
