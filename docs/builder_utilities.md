# Builder Utilities

The builder utilities (`builders/`) simplify the creation of Discord embeds, sections, containers, buttons, menus, and other interactive components by wrapping Discord.js's official builders. The builder utilities are organized into three categories: **visual**, **interactive**, and **attachments**.

> [!NOTE]
> All builder functions are made to accept every value supported by Discord.js's builders.

You can see them in action through the example commands:

- `/v2-examples` (in [v2examples.js](../src/commands/serverLocked/test/v2examples.js))
- `/v1-examples` (in [v1examples.js](../src/commands/serverLocked/test/v1examples.js))

For reference, see the official Discord.js documentation:

- [Display Components](https://www.discordjs.guide/legacy/popular-topics/display-components) (`V2`)
- [Embeds](https://www.discordjs.guide/legacy/popular-topics/embeds)
- [Buttons](https://www.discordjs.guide/legacy/interactive-components/buttons)
- [Select Menus](https://www.discordjs.guide/legacy/interactive-components/select-menus)

> [!IMPORTANT]
> In all the following builders, values enclosed in braces are optional unless specified otherwise.

<details>
  <summary><h3>Content</h3></summary>

- [visualUtils.js](#visualutilsjs)
  - [makeTextDisplay | `V2`](#maketextdisplay--v2)
  - [makeTitleDisplay | `V2`](#maketitledisplay--v2)
  - [makeSeparator | `V2`](#makeseparator--v2)
  - [makeSection | `V2`](#makesection--v2)
  - [makeContainer | `V2`](#makecontainer--v2)
  - [makeEmbed](#makeembed)
  - [makeRefEmbed](#makerefembed)
  - [makeEmbedMimic | `V2`](#makeembedmimic--v2)
- [interactiveUtils.js](#interactiveutilsjs)
  - [makeButton](#makebutton)
  - [makeSelectMenu](#makeselectmenu)
  - [makeUserSelectMenu](#makeuserselectmenu)
  - [makeRoleSelectMenu](#makeroleselectmenu)
  - [makeChannelSelectMenu](#makechannelselectmenu)
  - [makeMentionableSelectMenu](#makementionableselectmenu)
  - [makeRow](#makerow)
  - [stripCompsFromPayload](#stripcompsfrompayload)
- [attachmentUtils.js](#attachmentutilsjs)
  - [makeAttachment](#makeattachment)
  - [makeThumbnail | `V2`](#makethumbnail--v2)
  - [makeFile](#makefile)
  - [makeGalleryItem | `V2`](#makegalleryitem--v2)
  - [makeMediaGallery | `V2`](#makemediagallery--v2)
- [builderHelpers.js](#builderhelpersjs)
  - [fetchFromEnum](#fetchfromenum)
  - [getMemberColor](#getmembercolor)

</details>
<hr>

# visualUtils.js

## makeTextDisplay | `V2`

```js
utilsLib.makeTextDisplay(content <string>);
```

Creates a text display from content.

## makeTitleDisplay | `V2`

```js
utilsLib.makeTitleDisplay(content <string>);
```

Variant of makeTextDisplay, make a text display that can be used as a title in containers.

## makeSeparator | `V2`

```js
utilsLib.makeSeparator({ divider <boolean>, spacing <string/SeparatorSpacingSize option> });
```

Creates a separator.

## makeSection | `V2`

```js
utilsLib.makeSection(textDisplays <textDisplays array>, accessory <button or thumbnail>);
```

Creates a section. Requires either a button or a thumbnail. Example usage:

```js
const msgs = ["Example text 1", "Example text 2", "Example text 3"];
const textDisplays = msgs.map(utilsLib.makeTextDisplay); //create text display
const button = utilsLib.makeButton("Button inside a Section", { customId: "exampleButton", style: "Primary" }); //create button with style "Primary"

//[Reply]
const section = utilsLib.makeSection(textDisplays, button); //create a section
await interaction.reply({ components: [section], ...utilsLib.useV2 });
```

## makeContainer | `V2`

```js
utilsLib.makeContainer(components <components array>, color <hex or int>);
```

Creates a container. Example usage:

```js
const { color } = require("../../../config/info.json"); //get colors

const textDisplay = utilsLib.makeTextDisplay("Example text"); //create text display
const separator = utilsLib.makeSeparator(); //create a separate
const userSelectMenu = utilsLib.makeUserSelectMenu("exampleSelect", { placeholder: "Select users" }); //create a user select menu

//[Reply]
const container = utilsLib.makeContainer([textDisplay, separator, userSelectMenu], color.bot); //create a container
await interaction.reply({ components: [container], ...utilsLib.useV2 });
```

## makeEmbed

```js
utilsLib.makeEmbed({ title <string>, desc <string>, author <object>, thumbnail <url>, fields <array>, image <url>, color <hex or int>, footer <object>, timestamp <timestamp> });
```

Builds an embed from given values.

Example simple embed:

```js
const { color } = require("../../../config/info.json"); //get colors

const embed = utilsLib.makeEmbed({ title: "Example", desc: "Example description", color: color.bot }); //create an embed
await interaction.reply({ embeds: [embed] });
```

Example embed with fields:

```js
const { color } = require("../../../config/info.json"); //get colors

const fields = [
  { name: "Field 1", value: "Value 1" },
  { name: "Field 2", value: "Value 2" },
];
const embed = utilsLib.makeEmbed({ title: "Example", fields, color: color.bot }); //create an embed
await interaction.reply({ embeds: [embed] });
```

## makeRefEmbed

```js
await utilsLib.makeRefEmbed({ message <Message>, author <Member/User>, messageId <string>, channel <Channel>, guild <Guild> });
```

Creates a reference to a message in an embed form, and a button linking to the original message.

Can work in one of two ways:

1. Receiving `messageId`, `channel`, and optionally `guild`, example usage:

```js
const messageId = interaction.options.getString("message-id");
const reference = await utilsLib.makeRefEmbed({ messageId, channel: interaction.channel, guild: interaction.guild }); //create reference
if (!reference) return await interaction.reply(`Couldn't find message with ID "${messageID}".`);

//[Reply]
const { embed, row } = reference; //reference embed and link button
await interaction.reply({ embeds: [embed], components: [row] });
```

2. Receiving `message` and optionally `author`, example usage:

```js
const messageId = interaction.options.getString("message-id");
const foundMessage = await utilsLib.findMessage(messageId, interaction.channel); //foundMessage = { message, author }
if (!foundMessage) return await interaction.reply(`Couldn't find message with ID "${messageId}".`);

const reference = await utilsLib.makeRefEmbed(foundMessage); //create reference
if (!reference) return await interaction.reply(`Couldn't create reference for message with ID "${messageId}".`);

//[Reply]
const { embed, row } = reference; //reference embed and link button
await interaction.reply({ embeds: [embed], components: [row] });
```

## makeEmbedMimic | `V2`

```js
utilsLib.makeEmbedMimic({ title <string>, desc <string>, author <object>, thumbnail <url>, fields <array>, image <url>, color <hex or int>, footer <object>, timestamp <timestamp> });
```

Creates an embed-like container, accepts all values that `utilsLib.makeEmbed` accepts.

Embed usage:

```js
//embed usage:
const embed = utilsLib.makeEmbed({ title: "Example", desc: "Example description", color: color.bot });
await interaction.reply({ embeds: [embed] });

//embed mimic usage:
const embedMimic = utilsLib.makeEmbedMimic({ title: "Example", desc: "Example description", color: color.bot });
await interaction.reply({ components: [embedMimic], ...utilsLib.useV2 });
```

> [!NOTE]
> There's no easy way to mimic `inline fields` with the current container and sections layout, so embed mimics with fields will look different than actual embeds. It's also currently impossible to add `author` or `footer` avatars like in embeds.

# interactiveUtils.js

## makeButton

```js
utilsLib.makeButton(label <string>, { customId <string>, url <url>, style <string/ButtonStyle option> });
```

Creates a button. Requires either a customId or a URL.

## makeSelectMenu

```js
utilsLib.makeSelectMenu(customId <string>, options <options array>, { placeholder <string>, minValues <int>, maxValues <int> });
```

Creates a string select menu from an array of options.

## makeUserSelectMenu

```js
utilsLib.makeUserSelectMenu(customId <string>, { placeholder <string>, minValues <int>, maxValues <int> });
```

Creates a user select menu.

## makeRoleSelectMenu

```js
utilsLib.makeRoleSelectMenu(customId <string>, { placeholder <string>, minValues <int>, maxValues <int> });
```

Creates a role select menu.

## makeChannelSelectMenu

```js
utilsLib.makeChannelSelectMenu(customId <string>, { placeholder <string>, minValues <int>, maxValues <int>, channelTypes <string/ChannelType option> });
```

Creates a channel select menu.

## makeMentionableSelectMenu

```js
utilsLib.makeMentionableSelectMenu(customId <string>, { placeholder <string>, minValues <int>, maxValues <int> });
```

Creates a mentionable (user & role) select menu.

## makeRow

```js
utilsLib.makeRow(components <components array>);
```

Creates an action row from an array of components.

## stripCompsFromPayload

```js
utilsLib.stripCompsFromPayload({ content, embeds, components, flags } <message payload>, customIds <strings array>);
```

Remove components from message payload. Example usage:

```js
const filteredPayload = utilsLib.stripCompsFromPayload(interaction.message, ["toggle.hidden", "toggle.public"]);
await interaction.update(filteredPayload);
```

# attachmentUtils.js

## makeAttachment

```js
utilsLib.makeAttachment(filePath <file path>, data <optional object>);
```

Creates an attachment from a file path (local or url), accepts additional [data](https://discord.js.org/docs/packages/discord.js/main/AttachmentData:Interface).

Example usage:

```js
const filePath = utilsLib.relativePathToAbs("./config/info.json");
const file = utilsLib.makeAttachment(filePath, { name: "example.json" });
const fileAttachment = utilsLib.makeFile("attachment://example.json"); //name has to match attachment file
```

## makeThumbnail | `V2`

```js
utilsLib.makeThumbnail(url <url>, { desc <string> });
```

Creates a thumbnail from a URL.

## makeFile

```js
utilsLib.makeFile(url <url>, { spoiler <boolean> });
```

Creates a file from a URL.

## makeGalleryItem | `V2`

```js
utilsLib.makeGalleryItem(url <url>, { desc <string>, spoiler <boolean> });
```

Creates a media gallery item from a URL.

## makeMediaGallery | `V2`

```js
utilsLib.makeMediaGallery(galleryItems);
```

Creates a media gallery from media gallery item array.

# builderHelpers.js

## fetchFromEnum

```js
utilsLib.fetchFromEnum(optionsEnum <Enum>, option <string/enum option>);
```

Normalizes strings and enum options, allowing both to be passed to builders. Example usages:

```js
utilsLib.fetchFromEnum(ButtonStyle, style); //makes style = "Secondary" and style = ButtonStyle.Secondary valid
utilsLib.fetchFromEnum(ChannelType, channelType); //makes channelType = "GuildText" and channelType = ChannelType.GuildType valid
utilsLib.fetchFromEnum(SeparatorSpacingSize, spacing); //makes spacing = "Small" and spacing = SeparatorSpacingSize.Small valid
```

## getMemberColor

```js
utilsLib.getMemberColor(member <Member>);
```

Retrieves the member's username color. If the color is `#000000` (no color), it is adjusted to `#ffffff` (white), which is the default color for usernames without colored roles.<br>
(The color is often used for embeds and containers, hence why this function is here)

---

[<- Back to Main Page](../)
