//[Imports]
const { ActivityType } = require("discord.js");
const { ACTIVITY_LABELS, STATUS_LABELS, STATE_CONFIG } = require("../../../config/constants");
//[Variables]
const reloadCooldown = { time: 10, unit: "minutes" }; //cool-down on /manage commands reload

module.exports = ({ client, utilsLib, commandsLib, runtimeLib, info }) => {
  const { wrapWithCatch } = runtimeLib;
  //[/manage commands loaded]
  commandsLib.manageCommandsLoaded = wrapWithCatch(
    async function manageCommandsLoaded(interaction) {
      const logs = await runtimeLib.registerCommands();
      const msg = `Here's what I loaded last time:\n${utilsLib.ansiBlock(logs)}`;

      //[Reply]
      await utilsLib.sendWithEphemeralToggle(interaction, msg);
    },
    { errorMsg: "Couldn't find my loaded commands.", fileName: __filename }
  );
  //[/manage commands reload]
  commandsLib.manageCommandsReload = wrapWithCatch(
    async function manageCommandsReload(interaction) {
      const profile = await runtimeLib.findBotProfile();
      const cooldownMs = utilsLib.timeToMilliseconds(reloadCooldown.time, reloadCooldown.unit);
      const nextLoad = new Date(profile.loadCommandsTime.getTime() + cooldownMs);
      const now = new Date();
      //[Cooldown didn't pass]
      if (now < nextLoad) {
        const readyTime = utilsLib.unixFormat("relative", { date: nextLoad });
        return await interaction.reply(`Can't load commands, I loaded my commands recently...\nTry again ${readyTime}.`);
      }
      //[Reload]
      const logs = await runtimeLib.registerCommands(true);
      const msg = `Done!\n${utilsLib.ansiBlock(logs)}`;
      await runtimeLib.updateLoadCmdTime();

      //[Reply]
      await utilsLib.sendWithEphemeralToggle(interaction, msg);
    },
    { errorMsg: "Couldn't reload my commands.", fileName: __filename }
  );

  //[/manage reload-database]
  commandsLib.manageReloadDatabase = wrapWithCatch(
    async function manageReloadDatabase(interaction) {
      const schema = interaction.options.getString("schema");
      const validChoice = info.schemaNames.find(({ name, value }) => name === schema || value === schema);
      if (!validChoice) return interaction.reply(`"${schema}" isn't a valid schema option.`);

      //[Reload based on schema]
      let executeTime;
      switch (schema) {
        case "access":
          executeTime = await runtimeLib.loadAccess();
          break;
        default:
          executeTime = await runtimeLib.loadDatabase(schema);
          break;
      }
      if (!executeTime) return await interaction.reply(`Couldn't reload data from \`${validChoice.name}\`.`);

      //[Reply]
      const msg = `Reloaded data from \`${validChoice.name}\`.\nLoad time: \`${executeTime}\`.`;
      await utilsLib.sendWithEphemeralToggle(interaction, msg);
    },
    { errorMsg: "Couldn't reload my database.", fileName: __filename }
  );

  //[/manage extra check]
  commandsLib.manageExtraCheck = wrapWithCatch(
    async function manageExtraCheck(interaction) {
      const msg = info.extraRole ? `My extra role should be called "${info.extraRole}".` : "I have no extra role set-up.";

      //[Reply]
      await utilsLib.sendWithEphemeralToggle(interaction, msg);
    },
    { errorMsg: "Couldn't find my extra role.", fileName: __filename }
  );
  //[/manage extra update]
  commandsLib.manageExtraUpdate = wrapWithCatch(
    async function manageExtraUpdate(interaction) {
      const role = interaction.options.getRole("role");
      info.extraRole = role ? role.name : null;
      await runtimeLib.updateBotProfile(role ? { extraRole: info.extraRole } : { $unset: { extraRole: 1 } });
      const msg = role ? `Extra role updated to "${info.extraRole}".` : `Removed extra role.`;

      //[Reply]
      await utilsLib.sendWithEphemeralToggle(interaction, msg);
    },
    { errorMsg: "Couldn't update my extra role.", fileName: __filename }
  );

  //[/manage log-channel check]
  commandsLib.manageLogChannelCheck = wrapWithCatch(
    async function manageLogChannelCheck(interaction) {
      const msg = info.logChannel ? `My log channel is <#${info.logChannel}>.` : "I have no log channel set-up.";

      //[Reply]
      await utilsLib.sendWithEphemeralToggle(interaction, msg);
    },
    { errorMsg: "Couldn't find my log channel.", fileName: __filename }
  );
  //[/manage log-channel update]
  commandsLib.manageLogChannelUpdate = wrapWithCatch(
    async function manageLogChannelUpdate(interaction) {
      const channel = interaction.options.getChannel("channel");
      info.logChannel = channel ? channel.id : null;
      await runtimeLib.updateBotProfile(channel ? { logChannel: channel.id } : { $unset: { logChannel: 1 } });
      const msg = channel ? `Log channel updated to ${channel}.` : `Removed log channel.`;

      //[Reply]
      await utilsLib.sendWithEphemeralToggle(interaction, msg);
    },
    { errorMsg: "Couldn't update my log channel.", fileName: __filename }
  );

  //[/manage presence]
  commandsLib.managePresence = wrapWithCatch(
    async function managePresence(interaction) {
      const profile = await runtimeLib.findBotProfile();
      const { activity: defaultActivity, activityType: defaultType, status: defaultStatus } = profile.presence;
      const presence = {
        activityType: interaction.options.getInteger("activity-type") ?? defaultType,
        activity: interaction.options.getString("activity") ?? defaultActivity,
        status: interaction.options.getString("status") ?? defaultStatus,
      };

      await runtimeLib.updateBotProfile({ presence });
      await runtimeLib.refreshPresence(presence);
      const activityLabel = ACTIVITY_LABELS[presence.activityType];
      const statusLabel = STATUS_LABELS[presence.status];
      const msg = `Presence updated: ${activityLabel} ${presence.activity}, ${statusLabel}.`;

      //[Reply]
      await utilsLib.sendWithEphemeralToggle(interaction, msg);
    },
    { errorMsg: "Couldn't update my presence.", fileName: __filename }
  );

  //[/manage state]
  commandsLib.manageState = wrapWithCatch(
    async function manageState(interaction) {
      const state = interaction.options.getString("state");
      const config = STATE_CONFIG[state];
      if (!config) return utilsLib.sendWithEphemeralToggle(interaction, { content: `Unknown state "${state}".` });

      let msg;
      //state already selected
      if (info.appState === state || (!info.appState && state === "active")) {
        msg = config.already;
      }
      //switching state
      else {
        info.appState = state === "active" ? null : state; //"active" -> info.appState = null
        const { activity, status } = config;
        const presence = state !== "active" ? { activityType: ActivityType.Playing, activity, status } : {};

        await runtimeLib.refreshPresence(presence);
        msg = config.success(config.activity, STATUS_LABELS[config.status]);
      }

      //[Reply or react]
      const check = state === "sleep"; //additional check
      const toggle = state !== "sleep"; //add ephemeral toggle if bot isn't asleep
      const replied = await utilsLib.replyIfNotPlain(msg, interaction, { check, toggle });
      if (!replied) interaction.message.react("👍");
    },
    { errorMsg: "Couldn't change state.", fileName: __filename }
  );
};
