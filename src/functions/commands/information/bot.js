//[Variables]
const { about, color, errors } = require("../../../config/info.json");

module.exports = ({ client, utilsLib, commandsLib, runtimeLib, info }) => {
  const { wrapWithCatch } = runtimeLib;
  //[/bot about]
  commandsLib.botAbout = wrapWithCatch(
    async function botAbout(interaction) {
      const desc = about?.join("\n");
      if (!desc) return interaction.reply('No "about" description was found in my config.');

      //[Reply]
      const embedMimic = utilsLib.makeEmbedMimic({ title: "About", desc, color: color.bot });
      await interaction.reply({ components: [embedMimic], ...utilsLib.useV2 });
    },
    { errorMsg: 'Couldn\'t find my "about".', fileName: __filename }
  );

  //[/bot commands]
  commandsLib.botCommands = wrapWithCatch(
    async function botCommands(interaction) {
      const category = interaction.options.getString("category") ?? "all";
      const categories = await utilsLib.getCmdCategories(interaction.guild);
      const lcCategory = category.toLowerCase();
      let pickedChoices = [];
      //get all categories
      if (category === "all") {
        pickedChoices = categories;
      }
      //find picked category
      else {
        pickedChoices = categories.filter(({ name, value }) => name.toLowerCase() == lcCategory || value.toLowerCase() == lcCategory ); //prettier-ignore
      }
      if (!pickedChoices?.length) return interaction.reply(`"${category}" isn't a valid command category.`);

      //[Parse descriptions into embeds]
      const commandContainers = [];
      for (const { name, value } of pickedChoices) {
        let desc = [];
        const commandMap = info.commandDescs[value] ?? {};
        for (const commandName in commandMap) {
          const cmdDesc = commandMap[commandName];
          if (!cmdDesc.length) continue;
          desc.push(cmdDesc.join("\n"));
        }
        if (!desc?.length) continue;
        const embedMimic = utilsLib.makeEmbedMimic({ title: name, desc: desc.join("\n\n"), color: color.bot });
        commandContainers.push(embedMimic);
      }
      if (!interaction.guildId && commandContainers.length) {
        commandContainers.push(utilsLib.makeTextDisplay(`-# ${errors.commandListDMs}`));
      }

      //[Reply]
      if (!commandContainers.length) return interaction.reply(`There are no commands in category "${category}".`);
      await utilsLib.batchSendComponents(commandContainers, interaction, { replyMsg: "Here are my commands!" });
    },
    { errorMsg: "Couldn't find my commands.", fileName: __filename }
  );

  //[/bot ping]
  commandsLib.botPing = wrapWithCatch(
    async function botPing(interaction) {
      //[Calculate ping]
      const botPing = client.ws.ping;
      const displayBotPing = botPing === -1 ? "n/a" : `${Math.round(botPing)} ms`;
      const userPing = interaction.message ? interaction.message.createdTimestamp - interaction.createdTimestamp : 0;
      const displayUserPing = userPing === 0 ? "n/a" : `${userPing} ms`;
      const userName = interaction.member?.displayName || interaction.user.globalName || interaction.user.username;

      const fields = [
        { name: `${client.user.displayName}'s ping`, value: displayBotPing, inline: true },
        { name: `${userName}'s ping`, value: displayUserPing, inline: true },
      ];

      //[Non owner response]
      let desc = "I don't know you...";
      let col = color.deny;

      //[Response if owners ran the command]
      if (utilsLib.checkOwnerAccess(interaction.user.id)) {
        desc = `Hello ${userName}!`;
        const profile = await runtimeLib.findBotProfile();
        if (profile?.loginTime) {
          const loginTime = utilsLib.unixFormat("describe", { date: profile.loginTime });
          desc += `\nI've been online since ${loginTime}`;
        }
        col = color.owner;
      }

      //[Reply]
      const embed = utilsLib.makeEmbed({ title: "Ping", desc, fields, color: col });
      await interaction.editReply({ embeds: [embed] });
    },
    { errorMsg: "Couldn't get my ping.", fileName: __filename }
  );
};
