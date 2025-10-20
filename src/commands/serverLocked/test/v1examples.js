//[Imports]
const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
//[Variables]
const hidden = false;
const access = "";

//[/v1-examples]: command
module.exports = ({ utilsLib }) => ({
  data: new SlashCommandBuilder()
    .setName("v1-examples")
    .setDescription("Examples of legacy embeds and components. (from Discord.js documentation)")
    /*https://www.discordjs.guide/legacy/popular-topics/embeds*/
    .addSubcommand((subcommand) => subcommand.setName("embed").setDescription("Get an Embed."))
    .addSubcommand((subcommand) => subcommand.setName("attaching-images").setDescription("Get an embed with an attached image."))
    /*https://www.discordjs.guide/legacy/interactive-components/buttons*/
    .addSubcommand((subcommand) => subcommand.setName("button-styles").setDescription("Get Buttons components."))
    /*https://www.discordjs.guide/legacy/interactive-components/select-menus*/
    .addSubcommand((subcommand) => subcommand.setName("select-menu").setDescription("Get a Select Menu component."))
    .addSubcommand((subcommand) =>
      subcommand.setName("multi-select").setDescription("Get a User Select Menu component with multi-select.")
    ),

  async execute(commandContext) {
    //prepareExecution instead of runCommand so the logic can go here
    const interaction = await commandContext.prepareExecution(access, hidden);
    if (!interaction) return;

    switch (commandContext.subcommand) {
      case "embed":
        return await embedExample(interaction, { utilsLib });
      case "attaching-images":
        return await attachingImagesExample(interaction, { utilsLib });
      case "buttons":
        return await buttonsExample(interaction, { utilsLib });
      case "button-styles":
        return await buttonStylesExample(interaction, { utilsLib });
      case "select-menu":
        return await selectMenuExample(interaction, { utilsLib });
      case "multi-select":
        return await multiSelectExample(interaction, { utilsLib });
    }
  },
});
//[Example 1]
async function embedExample(interaction, { utilsLib }) {
  const title = "Some title";
  const url = "https://discord.js.org/";
  const author = { name: "Some name", iconURL: "https://i.imgur.com/AfFp7pu.png", url: "https://discord.js.org" };
  const desc = "Some description here";
  const thumbnail = "https://i.imgur.com/AfFp7pu.png";
  let fields = [
    { name: "Regular field title", value: "Some value here" },
    { name: "\u200B", value: "\u200B" },
    { name: "Inline field title", value: "Some value here", inline: true },
    { name: "Inline field title", value: "Some value here", inline: true },
  ];
  fields.push({ name: "Inline field title", value: "Some value here", inline: true });
  const image = "https://i.imgur.com/AfFp7pu.png";
  const color = 0x0099ff;
  const timestamp = ""; // -> sets current time
  const footer = { text: "Some footer text here", iconURL: "https://i.imgur.com/AfFp7pu.png" };
  const embed = utilsLib.makeEmbed({ title, url, author, desc, thumbnail, fields, image, color, timestamp, footer });

  //[Reply]
  await interaction.reply({ embeds: [embed] });
}
//[Example 2]
async function attachingImagesExample(interaction, { utilsLib }) {
  const filePath = "https://i.imgur.com/AfFp7pu.png"; //can use a local file like "./assets/image.png"
  const file = new AttachmentBuilder(filePath, { name: "image.png" }); //can use a local file like "./assets/image.png"
  const embed = utilsLib.makeEmbed({ title: "Some title", image: "attachment://image.png" }); //name has to match attachment file

  //[Reply]
  await interaction.reply({ embeds: [embed], files: [file] });
}
//[Example 3]
async function buttonStylesExample(interaction, { utilsLib }) {
  const confirmButton = utilsLib.makeButton("Confirm", { customId: "confirm", style: "Danger" });
  const cancelButton = utilsLib.makeButton("Cancel", { customId: "cancel", style: "Secondary" });
  const linkButton = utilsLib.makeButton("discord.js docs", { url: "https://discord.js.org" });
  const disabledButton = utilsLib.makeButton("Click me?", { customId: "disabled", style: "Primary", disabled: true });
  const emojiButton = utilsLib.makeButton("Primary", { customId: "primary", style: "Primary", emoji: "✨" });
  const row = utilsLib.makeRow([confirmButton, cancelButton, linkButton, disabledButton, emojiButton]);

  //[Reply]
  await interaction.reply({ components: [row] });
}
//[Example 4]
async function selectMenuExample(interaction, { utilsLib }) {
  const options = [
    { label: "Bulbasaur", description: "The dual-type Grass/Poison Seed Pokémon.", value: "bulbasaur" },
    { label: "Charmander", description: "The Fire-type Lizard Pokémon.", value: "charmander" },
    { label: "Squirtle", description: "The Water-type Tiny Turtle Pokémon.", value: "squirtle" },
  ];
  const selectMenu = utilsLib.makeSelectMenu("starter", options, { placeholder: "Make a selection!" });
  const row = utilsLib.makeRow([selectMenu]);

  //[Reply]
  await interaction.reply({ content: "Choose your starter!", components: [row] });
}
//[Example 5]
async function multiSelectExample(interaction, { utilsLib }) {
  const placeholder = "Select multiple users.";
  const selectMenu = utilsLib.makeUserSelectMenu("users", { placeholder, minValues: 1, maxValues: 10 });
  const row = utilsLib.makeRow([selectMenu]);

  //[Reply]
  await interaction.reply({ content: "Select users:", components: [row] });
}
