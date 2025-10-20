//[Imports]
const { ApplicationCommandOptionType } = require("discord.js");
const { Channel, Integer, Number: Num, String: Str } = ApplicationCommandOptionType;
const { Subcommand, SubcommandGroup } = ApplicationCommandOptionType;
const { TYPE_LABELS, CHANNEL_LABELS } = require("../../config/constants");

module.exports = (commandContext, context) => {
  //[Fetch autocomplete options from command declaration]
  async function getCmdAutocomplete() {
    try {
      const command = await commandContext.getCommand();
      if (!command?.autocomplete) return ["unknown"]; //failsafe

      let choices = [];
      commandContext.respond = (suggestions) => (choices = suggestions);
      await command.autocomplete(commandContext, context); //fetch autocomplete options
      return choices;
    } catch (error) {
      commandContext.handleError({ error, location: __filename });
      return;
    }
  }

  //[Format slash command option]
  async function formatCmdOption(option, index, getAutocomplete = undefined) {
    let optionDesc = `${index + 1}. __${option.name}__:`;

    //description
    if (option.description) optionDesc += ` ${option.description}`;
    if (option.type === Subcommand || option.type === SubcommandGroup) return optionDesc;

    //base option type
    let typeLabel = formatType(option);

    //special case - channel type instead of "Channel"
    if (option.type === Channel) {
      const { channel_types } = option;
      if (channel_types?.length) typeLabel = formatChannels(channel_types);
    }

    //special case - choices instead of "Integer"/"Number"/"String"
    const { choices } = option;
    if (choices?.length) typeLabel = formatChoices("choices", choices);

    //special case - autocomplete choices
    if (option.autocomplete && getAutocomplete) {
      const suggestions = await getAutocomplete();
      if (suggestions?.length) typeLabel = formatChoices("autocomplete choices", suggestions);
    }

    optionDesc += `\n  - ${typeLabel}`;

    //restrictions - Integer/Number
    if (option.type === Integer || option.type === Num) {
      const { min_value, max_value } = option;
      let restricts = [];
      if (min_value !== undefined) restricts.push(`\`min value: ${min_value}\``);
      if (max_value !== undefined) restricts.push(`\`max value: ${max_value}\``);
      if (restricts.length) optionDesc += formatRestricts(restricts);
    }

    //restrictions - String
    if (option.type === Str) {
      const { min_length, max_length } = option;
      let restricts = [];
      if (min_length !== undefined) restricts.push(`\`min length: ${min_length}\``);
      if (max_length !== undefined) restricts.push(`\`max length: ${max_length}\``);
      if (restricts.length) optionDesc += formatRestricts(restricts);
    }

    //required flag
    if (option.required) optionDesc += "\n  - `required`";

    return optionDesc;
  }
  //format type label
  function formatType(option) {
    const label = TYPE_LABELS[option.type];
    if (!label) return `type: \`Unknown(${option.type})\``;
    if (Array.isArray(label)) return "options: " + label.map((l) => `\`${l}\``).join(" / ");
    return `type: \`${label}\``;
  }
  //format channel options
  function formatChannels(channel_types) {
    return "type: " + channel_types.map((t) => "`" + (`${CHANNEL_LABELS[t]}` ?? `Channel(${t})`) + "`").join(" / ");
  }
  //format option choices
  function formatChoices(title, choices = ["unknown"]) {
    return `${title}: ` + choices.map((c) => `\`${c.name}\``).join(" / ");
  }
  //format option restrictions
  function formatRestricts(restricts) {
    return `\n  - ${restricts.map((r) => `\`${r}\``).join(" | ")}`;
  }

  //[Format all slash command options]
  async function getCmdOptions() {
    const fullName = commandContext._fullCommandNames.join(".");
    if (!commandContext._commandOptions) return null;
    const { description, messageOptions, attachOptions, subCommands } = commandContext._commandOptions;
    const getAutocomplete = async () => await getCmdAutocomplete(); //fetching autocomplete choices

    const sections = [];
    if (description?.length) {
      sections.push(`__Description__: ${description}`);
    }
    //message arguments
    if (messageOptions?.length) {
      let optionDescs = await mapOptions(messageOptions, getAutocomplete);
      let part = `Accepts the following message options:\n${optionDescs}`;

      const hasNonRequired = messageOptions.some((o) => !o.required);
      if (hasNonRequired) part += `\n-# To skip a non-required option, use "null".`;

      sections.push(part);
    } else if (!subCommands?.length) {
      sections.push("Accepts no message options.");
    }
    //attached files
    if (attachOptions?.length) {
      let optionDescs = await mapOptions(attachOptions);
      let part = `Accepts the following attachment options:\n${optionDescs}`;
      sections.push(part);
    }
    //sub commands or groups
    if (subCommands?.length) {
      let optionDescs = await mapOptions(subCommands);
      let part = `Has the following sub commands:\n${optionDescs}`;
      sections.push(part);
    }
    return `### Command \`${fullName}\`\n` + sections.join("\n\n");
  }
  //map command options
  async function mapOptions(options, getAutocomplete = undefined) {
    const optionDescs = await Promise.all(options.map((option, index) => formatCmdOption(option, index, getAutocomplete)));
    return optionDescs.join("\n");
  }

  return { getCmdOptions };
};
