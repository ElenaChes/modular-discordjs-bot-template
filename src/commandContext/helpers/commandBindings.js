//[Imports]
const { ApplicationCommandOptionType, MessageFlags } = require("discord.js");
const { Subcommand, SubcommandGroup, Attachment } = ApplicationCommandOptionType;
const { errors } = require("../../config/info.json");

module.exports = (commandContext, context) => {
  const { client } = context;

  //[Parse data to instance]
  function assignInteractionProps(interaction) {
    //context information
    commandContext.guild = interaction.guild;
    commandContext.guildId = interaction.guild?.id;
    commandContext.channel = interaction.channel;
    commandContext.channelId = interaction.channel?.id;
    commandContext.message = interaction.message;
    commandContext.user = interaction.user;
    commandContext.member = interaction.member;
    commandContext.createdTimestamp = interaction.createdTimestamp;
  }
  //[Find command declaration]
  function fetchInteractionCmdDeclaration() {
    const command = client.commands.get(commandContext.commandName);
    if (command) commandContext._command = command;
    else commandContext.commandError = errors.commandError;
  }
  //[Attach reply/editReply/etc]
  function assignInteractionResponds(interaction) {
    if ("deferReply" in interaction) {
      commandContext.deferReply = async (payload) => {
        commandContext.ephemeral = handleEphemeralFlag(payload);
        commandContext.deferred = true;
        return interaction.deferReply(payload);
      };
    }

    if ("reply" in interaction) {
      commandContext.reply = async (payload) => {
        commandContext.ephemeral = handleEphemeralFlag(payload);
        if (typeof payload === "string") {
          await interaction.reply({ content: payload, flags: commandContext.ephemeral });
        } else {
          await interaction.reply(payload);
        }
        commandContext.replied = true;
      };
    }

    if ("editReply" in interaction) commandContext.editReply = interaction.editReply.bind(interaction);
    if ("followUp" in interaction) commandContext.followUp = interaction.followUp.bind(interaction);
  }
  function handleEphemeralFlag(payload) {
    //payload is a string
    if (typeof payload === "string") return commandContext.ephemeral;

    //payload has additional flags
    if (payload.flags) payload.flags |= commandContext.ephemeral;
    //payload has no flags
    else payload.flags = commandContext.ephemeral;

    return Boolean(payload.flags & MessageFlags.Ephemeral); //ephemeral flag state
  }

  //[Parse data to instance]
  function assignMessageProps(message) {
    if (commandContext._slashDoesntExist) return; //async check finished?
    //context information
    commandContext.guild = message.guild;
    commandContext.guildId = message.guildId ?? message.guild?.id;
    commandContext.channelId = message.channelId ?? message.channel?.id;
    commandContext.channel = message.channel;
    commandContext.message = message;
    commandContext.user = message.author;
    commandContext.member = message.member;
    commandContext.createdTimestamp = message.createdTimestamp;
  }
  //[Find command declaration and options]
  function fetchMessageCmdDeclaration(commandNames) {
    if (commandContext._slashDoesntExist) return; //async check finished?
    const command = client.commands.get(commandContext.commandName);
    if (!command) return; //no code found -> treat as a typo
    commandContext._command = command;

    const options = findCmdOptions(command.data.toJSON(), commandNames);
    if (!options) return; //no code found -> treat as a typo
    const { description, messageOptions, attachOptions, subCommands, nameCategories } = options;

    commandContext._commandOptions = { description, messageOptions, attachOptions, subCommands };
    commandContext.subcommand = nameCategories?.subcommand;
    commandContext.subcommandGroup = nameCategories?.subcommandGroup;
  }
  //[Attach reply/editReply/etc]
  function assignMessageResponds(message) {
    if (commandContext._slashDoesntExist) return; //async check finished?
    commandContext.deferReply = async () => {
      loopTyping();
      commandContext.deferred = true;
    };

    commandContext.reply = async (payload) => {
      loopTyping();
      if (typeof payload === "string") await message.reply({ content: payload, allowedMentions: { repliedUser: false } });
      else await message.reply({ ...payload, allowedMentions: { repliedUser: false } });
      commandContext.replied = true;
    };

    commandContext.editReply = commandContext.reply.bind(message);
    commandContext.followUp = async (payload) => {
      commandContext.replied = false;
      loopTyping();
      await commandContext.channel.send(payload);
      commandContext.replied = true;
    };
    commandContext.update = async (payload) => {
      commandContext.replied = false;
      loopTyping();
      await message.edit(payload);
      commandContext.replied = true;
    };
  }
  function loopTyping() {
    commandContext.channel.sendTyping();
    setTimeout(() => {
      if (commandContext.replied) return;
      loopTyping();
    }, 10000); //repeat every 9 seconds
  }

  //[Find options of sub slash command]
  function findCmdOptions(command, names = []) {
    if (commandContext._slashDoesntExist) return; //async check finished?
    //[Find options]
    let options = command.options;
    let description = command.description;
    let nameCategories = {};

    for (let i = 1; i < names.length; i++) {
      const subCommand = options.find(
        (opt) => (opt.type === SubcommandGroup || opt.type === Subcommand) && opt.name === names[i]
      );
      if (!subCommand) return null; //command doesn't exist
      options = subCommand.options ?? []; //go deeper into the command options
      description = subCommand.description ?? "";
      if (subCommand.type === SubcommandGroup) nameCategories.subcommandGroup = names[i];
      else if (subCommand.type === Subcommand) nameCategories.subcommand = names[i];
    }

    const messageOptions = options.filter(({ type }) => type !== Attachment && type !== SubcommandGroup && type !== Subcommand);
    const attachOptions = options.filter(({ type }) => type === Attachment);
    const subCommands = options.filter(({ type }) => type === SubcommandGroup || type === Subcommand);

    return { description, messageOptions, attachOptions, subCommands, nameCategories };
  }

  //[Check if slash command is registered]
  async function checkRegisteredCommand(message, { commandNames }) {
    if (!commandNames) return false;

    //guild commands
    if (message.guild) {
      let commands = await message.guild.commands.fetch();
      if (commands.some((c) => c.name === commandNames[0])) return true;
    }

    //global commands
    commands = await client.application.commands.fetch();
    if (commands.some((c) => c.name === commandNames[0])) return true;

    return false;
  }

  return {
    //interaction-like
    assignInteractionProps,
    fetchInteractionCmdDeclaration,
    assignInteractionResponds,

    //message-like
    checkRegisteredCommand,
    assignMessageProps,
    fetchMessageCmdDeclaration,
    assignMessageResponds,
  };
};
