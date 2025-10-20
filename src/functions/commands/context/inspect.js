//[Variables]
const maxContPrevLen = 35; //max characters to preview from message content

module.exports = ({ client, utilsLib, commandsLib, runtimeLib }) => {
  const { wrapWithCatch } = runtimeLib;
  //[Inspect message]
  commandsLib.inspectMessage = wrapWithCatch(
    async function inspectMessage(interaction) {
      const message = interaction.targetMessage;
      const author = message.author;
      const member = message.guild?.members.cache.get(author.id);

      const name = author.globalName || author.username;
      const thumbnail = member?.displayAvatarURL() ?? author.displayAvatarURL();
      const color = utilsLib.getMemberColor(member);

      const fields = [{ name: "ID", value: message.id || "Unknown" }];

      //[Message location]
      if (message.channel) fields.push({ name: "Channel", value: `<#${message.channelId}>`, inline: true });
      if (message.guild) fields.push({ name: "Server", value: message.guild.name, inline: true });
      fields.push({ name: "Pinned?", value: message.pinned ? "Yes" : "No", inline: true });

      //[Author]
      fields.push({ name: "Author", value: name, inline: true }, { name: "Author ID", value: author.id, inline: true });

      //[Message content]
      if (message.content) {
        const contentLabel = utilsLib.endPlural("character", message.content.length);
        fields.push({ name: "Content", value: `Length: ${message.content.length} ${contentLabel}.` });
      }
      const embedLabel = utilsLib.endPlural("embed", message.embeds?.length);
      const compLabel = utilsLib.endPlural("component", message.components?.length);
      const attached = `${message.embeds?.length ?? 0} ${embedLabel}, ${message.components?.length ?? 0} ${compLabel}.`;
      fields.push({ name: "Attached", value: attached });

      if (message.reference?.messageId) {
        const ref = message.reference;
        const reply = `https://discord.com/channels/${message.guildId ?? "@me"}/${ref.channelId}/${ref.messageId}`;
        fields.push({ name: "Replying to", value: reply });
      }

      //[Message creation]
      if (message.createdAt) {
        const createdAt = utilsLib.unixFormat("describe", { timestamp: Math.floor(message.createdAt / 1000) });
        fields.push({ name: "Message created", value: createdAt });
      }
      if (message.editedAt) {
        const editedAt = utilsLib.unixFormat("describe", { timestamp: Math.floor(message.editedAt / 1000) });
        fields.push({ name: "Last edited", value: editedAt });
      }

      //[Reply]
      const embed = utilsLib.makeEmbed({ title: `Message by ${name}`, thumbnail, fields, color });
      const linkButton = message.url ? utilsLib.makeButton("Jump to message", { url: message.url }) : null;
      const row = linkButton ? utilsLib.makeRow([linkButton]) : null;
      await utilsLib.sendWithEphemeralToggle(interaction, { embeds: [embed], components: row ? [row] : [] });
    },
    { errorMsg: "Couldn't inspect message.", fileName: __filename }
  );

  //[Inspect user]
  commandsLib.inspectUser = wrapWithCatch(
    async function inspectUser(interaction) {
      const user = interaction.targetUser;
      const member = (await interaction.guild.members.cache.get(user.id)) ?? null;

      const name = user.globalName || user.username;
      const image = member
        ? member.displayAvatarURL({ size: 1024, dynamic: true })
        : user.displayAvatarURL({ size: 1024, dynamic: true });
      const thumbnail = member?.avatar ? user.displayAvatarURL() : null;
      const color = utilsLib.getMemberColor(member);

      const fields = [{ name: "ID", value: user.id || "Unknown" }];

      //[Username/display name]
      if (user.discriminator !== "0" && !user.globalName)
        fields.push({ name: "Username", value: `${user.username}#${user.discriminator}`, inline: true });
      else {
        if (user.globalName) fields.push({ name: "Display Name", value: user.globalName, inline: true });
        if (user.username) fields.push({ name: "Username", value: user.username, inline: true });
      }
      //[Member info]
      if (!member) fields.push({ name: "Member?", value: "Not a member." });
      else {
        if (member.nickname) fields.push({ name: "Nickname", value: member.nickname });
        if (member.joinedTimestamp) {
          const joinedTimestamp = utilsLib.unixFormat("describe", { timestamp: Math.floor(member.joinedTimestamp / 1000) });
          fields.push({ name: "Joined on", value: joinedTimestamp });
        }
      }
      //[Account creation]
      if (user.createdAt) {
        const createdAt = utilsLib.unixFormat("describe", { timestamp: Math.floor(user.createdAt / 1000) });
        fields.push({ name: "Account created", value: createdAt });
      }

      //[Reply]
      const embed = utilsLib.makeEmbed({ title: name, thumbnail, fields, image, color });
      await utilsLib.sendWithEphemeralToggle(interaction, { embeds: [embed] });
    },
    { errorMsg: "Couldn't inspect user.", fileName: __filename }
  );
};
