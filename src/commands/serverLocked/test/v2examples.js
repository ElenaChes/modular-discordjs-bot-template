//[Imports]
const { SlashCommandBuilder } = require("discord.js");
//[Variables]
const hidden = false;
const access = "";

//[/v2-examples]: command
module.exports = ({ utilsLib }) => ({
  data: new SlashCommandBuilder()
    .setName("v2-examples")
    .setDescription("Examples of V2 components. (from Discord.js documentation)")
    /*https://www.discordjs.guide/legacy/popular-topics/display-components*/
    .addSubcommand((subcommand) => subcommand.setName("text-display").setDescription("Get a Text Display component."))
    .addSubcommand((subcommand) => subcommand.setName("section").setDescription("Get a Section component."))
    .addSubcommand((subcommand) => subcommand.setName("thumbnail").setDescription("Get a Thumbnail component."))
    .addSubcommand((subcommand) => subcommand.setName("media-gallery").setDescription("Get a Media Gallery component."))
    .addSubcommand((subcommand) => subcommand.setName("file").setDescription("Get a File component."))
    .addSubcommand((subcommand) => subcommand.setName("separator").setDescription("Get a Separator component."))
    .addSubcommand((subcommand) => subcommand.setName("container").setDescription("Get a Container component.")),

  async execute(commandContext) {
    //prepareExecution instead of runCommand so the logic can go here
    const interaction = await commandContext.prepareExecution(access, hidden);
    if (!interaction) return;

    switch (commandContext.subcommand) {
      case "text-display":
        return await textDisplayExample(interaction, { utilsLib });
      case "section":
        return await sectionExample(interaction, { utilsLib });
      case "thumbnail":
        return await thumbnailExample(interaction, { utilsLib });
      case "media-gallery":
        return await mediaGalleryExample(interaction, { utilsLib });
      case "file":
        return await fileExample(interaction, { utilsLib });
      case "separator":
        return await separatorExample(interaction, { utilsLib });
      case "container":
        return await containerExample(interaction, { utilsLib });
    }
  },
});
//[Example 1]
async function textDisplayExample(interaction, { utilsLib }) {
  const msg =
    "This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.";
  const textDisplay = utilsLib.makeTextDisplay(msg);

  //[Reply]
  await interaction.reply({ components: [textDisplay], ...utilsLib.useV2 });
}
//[Example 2]
async function sectionExample(interaction, { utilsLib }) {
  const msgs = [
    "This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.",
    "Using a section, you may only use up to three Text Display components.",
    "And you can place one button or one thumbnail component next to it!",
  ];
  const textDisplays = msgs.map(utilsLib.makeTextDisplay);
  const button = utilsLib.makeButton("Button inside a Section", { customId: "exampleButton", style: "Primary" });

  //[Reply]
  const section = utilsLib.makeSection(textDisplays, button);
  await interaction.reply({ components: [section], ...utilsLib.useV2 });
}
//[Example 3]
async function thumbnailExample(interaction, { utilsLib }) {
  const msg =
    "This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.";
  const textDisplay = utilsLib.makeTextDisplay(msg);

  //thumbnail using an attached file
  const filePath = "https://i.imgur.com/AfFp7pu.png"; //can use a local file like "./assets/image.png"
  const file = utilsLib.makeAttachment(filePath, { name: "image.png" });
  const desc = "alt text displaying on the image";
  const thumbnail = utilsLib.makeThumbnail("attachment://image.png", { desc }); //name has to match attachment file

  //[Reply]
  const section = utilsLib.makeSection([textDisplay], thumbnail);
  await interaction.reply({ components: [section], files: [file], ...utilsLib.useV2 });

  //thumbnail using a url
  /* const url = "https://i.imgur.com/AfFp7pu.png";
  const thumbnail = utilsLib.makeThumbnail(url, { desc: "alt text displaying on the image" });

  //[Reply]
  const section = utilsLib.makeSection([textDisplay], thumbnail);
  await interaction.reply({ components: [section], ...utilsLib.useV2 }); */
}
//[Example 4]
async function mediaGalleryExample(interaction, { utilsLib }) {
  const galleryItems = [];

  //media gallery item using an attached file
  const filePath = "https://i.imgur.com/AfFp7pu.png"; //can use a local file like "./assets/image.png"
  const file = utilsLib.makeAttachment(filePath, { name: "image.png" });
  let desc = "alt text displaying on an image from the AttachmentBuilder";
  let galleryItem = utilsLib.makeGalleryItem("attachment://image.png", { desc }); //name has to match attachment file
  galleryItems.push(galleryItem);

  //media gallery item using a url
  const url = "https://i.imgur.com/AfFp7pu.png";
  desc = "alt text displaying on an image from an external URL";
  galleryItem = utilsLib.makeGalleryItem(url, { desc, spoiler: true });
  galleryItems.push(galleryItem);

  //[Reply]
  const mediaGallery = utilsLib.makeMediaGallery(galleryItems);
  await interaction.reply({ components: [mediaGallery], files: [file], ...utilsLib.useV2 });
}
//[Example 5]
async function fileExample(interaction, { utilsLib }) {
  const filePath = utilsLib.relativePathToAbs("./config/info.json"); //can use any local file like "./assets/file.txt"
  const file = utilsLib.makeAttachment(filePath, { name: "example.json" });
  const fileAttachment = utilsLib.makeFile("attachment://example.json"); //name has to match attachment file

  //[Reply]
  await interaction.reply({ components: [fileAttachment], files: [file], ...utilsLib.useV2 });
}
//[Example 6]
async function separatorExample(interaction, { utilsLib }) {
  const msg =
    "This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.";
  const textDisplay = utilsLib.makeTextDisplay(msg);
  const separator = utilsLib.makeSeparator({ divider: false, spacing: "Large" });

  //[Reply]
  await interaction.reply({ components: [textDisplay, separator, textDisplay], ...utilsLib.useV2 });
}
//[Example 7]
async function containerExample(interaction, { utilsLib }) {
  const msg =
    "This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.";
  const textDisplay = utilsLib.makeTextDisplay(msg);

  const userSelectMenu = utilsLib.makeUserSelectMenu("exampleSelect", { placeholder: "Select users" });
  const row = utilsLib.makeRow([userSelectMenu]);
  const separator = utilsLib.makeSeparator();

  const msgs = [
    "This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.",
    "And you can place one button or one thumbnail component next to it!",
  ];
  const textDisplays = msgs.map(utilsLib.makeTextDisplay);
  const button = utilsLib.makeButton("Button inside a Section", { customId: "exampleButton", style: "Primary" });
  const section = utilsLib.makeSection(textDisplays, button);

  //[Reply]
  const container = utilsLib.makeContainer([textDisplay, row, separator, section], 0x0099ff);
  await interaction.reply({ components: [container], ...utilsLib.useV2 });
}
