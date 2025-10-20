//[Imports]
const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { ACTIVITY_LABELS, STATUS_LABELS } = require("../../../config/constants");
//[Variables]
const hidden = true;
const access = "owner";

//[/manage]: command
module.exports = ({ info }) => ({
  data: new SlashCommandBuilder()
    .setName("manage")
    .setDescription("Configure the bot (owner only).")
    //[/manage commands]: group
    .addSubcommandGroup((subcommand) =>
      subcommand
        .setName("commands")
        .setDescription("Bot's loaded commands.")
        //[/manage commands loaded]: command
        .addSubcommand((subcommand) => subcommand.setName("loaded").setDescription("View the currently loaded commands."))
        //[/manage commands reload]: command
        .addSubcommand((subcommand) => subcommand.setName("reload").setDescription("Reload bot's commands. (once in 10 minutes)"))
    )
    //[/manage extra]: group
    .addSubcommandGroup((subcommand) =>
      subcommand
        .setName("extra")
        .setDescription("Extra role commands.")
        //[/manage extra check]: command
        .addSubcommand((subcommand) => subcommand.setName("check").setDescription("Check the role needed for extra commands."))
        //[/manage extra update]: command
        .addSubcommand((subcommand) =>
          subcommand
            .setName("update")
            .setDescription("Update the role needed for extra commands.")
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription("What role enables extra commands (across all servers)? Leave empty to clear.")
                .setRequired(false)
            )
        )
    )
    //[/manage log-channel]: group
    .addSubcommandGroup((subcommand) =>
      subcommand
        .setName("log-channel")
        .setDescription("Log channel commands.")
        //[/manage log-channel check]: command
        .addSubcommand((subcommand) => subcommand.setName("check").setDescription("Check the current log channel."))
        //[/manage log-channel update]: command
        .addSubcommand((subcommand) =>
          subcommand
            .setName("update")
            .setDescription("Update bot's log channel.")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription("Bot's new log channel, leave empty to clear.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
    )
    //[/manage presence]: command
    .addSubcommand((subcommand) =>
      subcommand
        .setName("presence")
        .setDescription("Update bot's presence, leave all empty to reload from database.")
        .addIntegerOption((option) =>
          option
            .setName("activity-type")
            .setDescription("What the bot is doing.")
            .setRequired(false)
            .addChoices(...Object.entries(ACTIVITY_LABELS).map(([key, label]) => ({ name: label, value: Number(key) })))
        )
        .addStringOption((option) => option.setName("activity").setDescription("Bot's new activity.").setRequired(false))
        .addStringOption((option) =>
          option
            .setName("status")
            .setDescription("Bot's new status.")
            .setRequired(false)
            .addChoices(...Object.entries(STATUS_LABELS).map(([key, label]) => ({ name: label, value: key })))
        )
    )
    //[/manage reload-database]: command
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reload-database")
        .setDescription("Reload information from database.")
        .addStringOption((option) =>
          option.setName("schema").setDescription("The database schema to reload.").setAutocomplete(true).setRequired(true)
        )
    )
    //[/manage state]: command
    .addSubcommand((subcommand) =>
      subcommand
        .setName("state")
        .setDescription("Update bot's state.")
        .addStringOption((option) =>
          option
            .setName("state")
            .setDescription("State to switch to.")
            .setRequired(true)
            .addChoices(
              { name: "Maintenance", value: "maintenance" },
              { name: "Sleep", value: "sleep" },
              { name: "Active", value: "active" }
            )
        )
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused()?.toLowerCase();

    //[Existing MongoDB schemas]
    const availableChoices = info.schemaNames;

    //[Filter as user types]
    const suggestions = availableChoices?.filter(({ name }) => name.toLowerCase().startsWith(focusedValue));
    await interaction.respond(suggestions.length ? suggestions : [{ name: "No matches", value: "none" }]);
  },

  async execute(commandContext) {
    await commandContext.runCommand(access, hidden);
  },
});
