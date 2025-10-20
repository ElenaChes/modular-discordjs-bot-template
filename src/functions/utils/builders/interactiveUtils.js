//[Imports]
const { ButtonBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } = require("discord.js");
const { RoleSelectMenuBuilder, MentionableSelectMenuBuilder, ChannelSelectMenuBuilder } = require("discord.js");
const { ButtonStyle, ChannelType, ActionRowBuilder } = require("discord.js");

module.exports = ({ utilsLib }) => {
  const MAX_LEN_LABEL = 80;
  const MAX_LEN_PLACEHOLDER = 100;
  const MAX_MENU_OPTIONS = 25;
  const MAX_COMPS_IN_ROW = 5;

  //[Build custom button]
  utilsLib.makeButton = (label, { customId = null, url = null, style, emoji, disabled = false }) => {
    if (label?.length > MAX_LEN_LABEL)
      utilsLib.warn("makeButton", `Received label of length ${label.length} (max ${MAX_LEN_LABEL}).`);

    const button = new ButtonBuilder().setLabel(label ? label.slice(0, MAX_LEN_LABEL) : "").setDisabled(disabled);
    if (customId) button.setCustomId(customId).setStyle(utilsLib.fetchFromEnum(ButtonStyle, style) ?? ButtonStyle.Secondary);
    else if (url) button.setURL(url).setStyle(ButtonStyle.Link);
    else utilsLib.throwError(__filename, "Buttons needs to have either a customId or a url.");
    if (emoji) button.setEmoji(emoji);
    return button;
  };

  //[Make custom select menu]
  utilsLib.makeSelectMenu = (customId, options = [], config = {}) => {
    return makeMenuBase(StringSelectMenuBuilder, customId, { ...config, options });
  };
  //[Build pre-filled select menu]
  utilsLib.makeUserSelectMenu = (customId, config = {}) => makeMenuBase(UserSelectMenuBuilder, customId, config);
  utilsLib.makeRoleSelectMenu = (customId, config = {}) => makeMenuBase(RoleSelectMenuBuilder, customId, config);
  utilsLib.makeChannelSelectMenu = (customId, config = {}) => makeMenuBase(ChannelSelectMenuBuilder, customId, config);
  utilsLib.makeMentionableSelectMenu = (customId, config = {}) => makeMenuBase(MentionableSelectMenuBuilder, customId, config);

  //[Generic select menu builder]
  function makeMenuBase(builder, customId, { placeholder, minValues = 1, maxValues = 1, options, channelType } = {}) {
    const menu = new builder().setCustomId(customId);

    //placeholder
    if (placeholder) {
      if (placeholder.length > MAX_LEN_PLACEHOLDER)
        utilsLib.warn("makeMenuBase", `Received placeholder of length ${placeholder.length} (max ${MAX_LEN_PLACEHOLDER}).`);
      menu.setPlaceholder(placeholder.slice(0, MAX_LEN_PLACEHOLDER));
    }
    //min & max
    if (minValues) menu.setMinValues(Math.max(1, minValues));
    if (maxValues) menu.setMaxValues(Math.min(maxValues, options?.length ?? maxValues, MAX_MENU_OPTIONS));

    //options (for StringSelect)
    if (options?.length && menu.addOptions) {
      if (options.length > MAX_MENU_OPTIONS)
        utilsLib.warn("makeMenuBase", `Received ${options.length} options (max ${MAX_MENU_OPTIONS}).`);
      menu.addOptions(options.slice(0, MAX_MENU_OPTIONS));
    }
    //channel type (for ChannelSelect)
    if (channelType && menu.setChannelTypes) menu.setChannelTypes(utilsLib.fetchFromEnum(ChannelType, channelType));

    return menu;
  }

  //[Build custom action row]
  utilsLib.makeRow = (components) => {
    if (components?.length > MAX_COMPS_IN_ROW)
      utilsLib.warn("makeRow", `Received ${components.length} components (max ${MAX_COMPS_IN_ROW}).`);

    const row = new ActionRowBuilder();
    components?.slice(0, MAX_COMPS_IN_ROW).forEach((c) => row.addComponents(c));
    return row;
  };

  //[Remove components from message payload]
  utilsLib.stripCompsFromPayload = ({ content, embeds, components, flags }, customIds = []) => {
    if (!components?.length) return { content, embeds, components: [], flags }; //failsafe

    //filter out the buttons
    const filteredComponents = components
      .map((row) => {
        const newRow = ActionRowBuilder.from(row).setComponents(row.components.filter((c) => !customIds.includes(c.customId)));
        return newRow.components.length ? newRow : null;
      })
      .filter(Boolean);
    return { content, embeds, components: filteredComponents, flags };
  };
};
