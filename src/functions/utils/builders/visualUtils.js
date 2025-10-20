//[Imports]
const { TextDisplayBuilder, SeparatorBuilder, SectionBuilder, ContainerBuilder, EmbedBuilder } = require("discord.js");
const { ComponentType, SeparatorSpacingSize } = require("discord.js");

module.exports = ({ utilsLib }) => {
  const MAX_LEN_DESC = 4000;
  const MAX_TEXTS_IN_SECTION = 3;
  const MAX_COMPS_IN_CONTAINER = 10;
  const MAX_LEN_TITLE_EMBED = 250;
  const MAX_FIELDS_IN_EMBED = 25;

  //[Build custom text display]
  utilsLib.makeTextDisplay = (content) => {
    if (content.length > MAX_LEN_DESC)
      utilsLib.warn("makeTextDisplay", `Received content of ${content.length} (max ${MAX_LEN_DESC}).`);

    return new TextDisplayBuilder({ content: content.slice(0, MAX_LEN_DESC) });
  };
  //[Build custom title text display]
  utilsLib.makeTitleDisplay = (content) => {
    if (content.length > MAX_LEN_TITLE_EMBED)
      utilsLib.warn("makeTextDisplay", `Received content of ${content.length} (max ${MAX_LEN_DESC}).`);

    const title = content.slice(0, MAX_LEN_TITLE_EMBED);
    return new TextDisplayBuilder({ content: `### ${title}` });
  };

  //[Build a separator]
  utilsLib.makeSeparator = ({ divider = true, spacing } = {}) => {
    const separator = new SeparatorBuilder()
      .setDivider(divider)
      .setSpacing(utilsLib.fetchFromEnum(SeparatorSpacingSize, spacing) ?? SeparatorSpacingSize.Small);
    return separator;
  };

  //[Build custom section]
  utilsLib.makeSection = (textDisplays = [], accessory) => {
    if (!accessory) {
      utilsLib.warn("makeSection", "Didn't receive an accessory.");
      return textDisplays; //sections need an accessory
    }
    if (textDisplays.length > MAX_TEXTS_IN_SECTION)
      utilsLib.warn("makeSection", `Received ${textDisplays.length} text items (max ${MAX_TEXTS_IN_SECTION}).`);

    const section = new SectionBuilder({ components: textDisplays?.slice(0, MAX_TEXTS_IN_SECTION) });
    if (accessory.data.type === ComponentType.Button) section.setButtonAccessory(accessory);
    else section.setThumbnailAccessory(accessory);
    return section;
  };

  //[Build custom container]
  utilsLib.makeContainer = (components = [], color = null) => {
    if (components?.length > MAX_COMPS_IN_CONTAINER)
      utilsLib.warn("makeContainer", `Received ${components.length} components (max ${MAX_COMPS_IN_CONTAINER}).`);

    const container = new ContainerBuilder({ components: components?.slice(0, MAX_COMPS_IN_CONTAINER) });
    if (color) {
      const intColor = typeof color === "string" ? Number(color.replace("#", "0x")) : color;
      container.setAccentColor(intColor);
    }

    return container;
  };

  //[Build custom embed]
  utilsLib.makeEmbed = ({ title, url, author, desc, thumbnail, fields, image, color, footer, timestamp }) => {
    if (title?.length > MAX_LEN_TITLE_EMBED)
      utilsLib.warn("makeEmbed", `Received title of length ${title.length} (max ${MAX_LEN_TITLE_EMBED}).`);
    if (desc?.length > MAX_LEN_DESC)
      utilsLib.warn("makeEmbed", `Received description of length ${desc.length} (max ${MAX_LEN_DESC}).`);
    if (fields?.length > MAX_FIELDS_IN_EMBED)
      utilsLib.warn("makeEmbed", `Received ${fields.length} fields (max ${MAX_FIELDS_IN_EMBED}).`);

    const embed = new EmbedBuilder()
      .setTitle(title?.slice(0, MAX_LEN_TITLE_EMBED) ?? null)
      .setURL(url ?? null)
      .setAuthor(author ?? null)
      .setDescription(desc?.slice(0, MAX_LEN_DESC) ?? null)
      .setThumbnail(thumbnail ?? null)
      .addFields(fields?.slice(0, MAX_FIELDS_IN_EMBED) ?? [])
      .setImage(image ?? null)
      .setFooter(footer ?? null);
    if (color) embed.setColor(color);
    if (timestamp !== undefined) {
      if (timestamp) embed.setTimestamp(timestamp);
      else embed.setTimestamp();
    }
    return embed;
  };

  //[Build message reference embed]
  utilsLib.makeRefEmbed = async ({ message, author, messageId = null, channel = null, guild = null }) => {
    if (!message) {
      if (!messageId || !channel) return null;
      //find message
      const foundMessage = await utilsLib.findMessage(messageId, channel, guild);
      if (!foundMessage) return null;
      message = foundMessage.message;
      author = foundMessage.author;
    }
    if (!author) author = message.author;

    //format message content
    const desc = [
      message.content || "",
      message.embeds.length ? `[${utilsLib.endPlural("embed", message.embeds.length)}]` : "",
      message.components.length ? `[${utilsLib.endPlural("component", message.components.length)}]` : "",
    ]
      .filter(Boolean)
      .join("\n");
    if (!desc) return null;

    //format author
    const name = author.displayName || author.globalName || author.username;
    const msgAuthor = { name, iconURL: author.displayAvatarURL(), url: message.url };
    const color = utilsLib.getMemberColor(author);

    //make embed & add button
    const embed = utilsLib.makeEmbed({ desc, author: msgAuthor, color, timestamp: message.createdTimestamp });
    const row = utilsLib.makeRow([utilsLib.makeButton("Jump to message", { url: message.url })]);
    return { embed, row };
  };

  //[Mimic embed layout using V2 components]
  utilsLib.makeEmbedMimic = ({ title, url, author, desc, thumbnail, fields, image, color, footer, timestamp }) => {
    if (title?.length > MAX_LEN_TITLE_EMBED)
      utilsLib.warn("makeEmbedMimic", `Received title of length ${title.length} (max ${MAX_LEN_TITLE_EMBED}).`);
    if (desc?.length > MAX_LEN_DESC)
      utilsLib.warn("makeEmbedMimic", `Received description of length ${desc.length} (max ${MAX_LEN_DESC}).`);
    if (fields?.length > MAX_FIELDS_IN_EMBED)
      utilsLib.warn("makeEmbedMimic", `Received ${fields.length} fields (max ${MAX_FIELDS_IN_EMBED}).`);

    const components = [];

    //author
    if (author) {
      const authorLine = author.url ? `[${author.name}](${author.url})` : author.name;
      const authorDisplay = utilsLib.makeTextDisplay(authorLine);
      components.push(authorDisplay);
    }

    let textDisplays = [];

    //title & url
    if (title) {
      const choppedTitle = title.slice(0, MAX_LEN_TITLE_EMBED);
      const titleDisplay = utilsLib.makeTitleDisplay(url ? `[${choppedTitle}](${url})` : choppedTitle); //format like embed titles
      textDisplays.push(titleDisplay);
    }
    //description
    if (desc) {
      const descDisplay = utilsLib.makeTextDisplay(desc.slice(0, MAX_LEN_DESC));
      textDisplays.push(descDisplay);
    }

    //fields
    if (fields?.length) {
      for (const field of fields.slice(0, MAX_FIELDS_IN_EMBED)) {
        const fieldDisplay = utilsLib.makeTextDisplay(`**${field.name}**\n${field.value}`);
        textDisplays.push(fieldDisplay);
      }
    }

    //thumbnail
    if (thumbnail) {
      const accessory = utilsLib.makeThumbnail(thumbnail);
      const section = utilsLib.makeSection(textDisplays.slice(0, MAX_TEXTS_IN_SECTION), accessory);
      components.push(section);
      textDisplays = textDisplays.slice(MAX_TEXTS_IN_SECTION);
    }
    if (textDisplays.length) components.push(...textDisplays);

    //image
    if (image) {
      const galleryItem = utilsLib.makeGalleryItem(image);
      const imageDisplay = utilsLib.makeMediaGallery([galleryItem]);
      components.push(imageDisplay);
    }

    //footer
    if (footer || timestamp) {
      const footerText = [footer?.text ?? null, timestamp ? utilsLib.unixFormat("full", { timestamp }) : null].filter(Boolean);
      const footerDisplay = utilsLib.makeTextDisplay(`-# ${footerText.join(" • ")}`);
      components.push(footerDisplay);
    }

    const container = utilsLib.makeContainer(components, color);
    return container;
  };
};
