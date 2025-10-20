//[Imports]
const { ComponentType, MessageFlags } = require("discord.js");
const { CONTEXT_TYPES } = require("../../config/constants");

module.exports = ({ client, utilsLib, info }) => {
  const MAX_LEN_COMP_CONTENT = 4000;
  const MAX_COMPS_IN_MSG = 10;
  const MAX_LEN_EMBED_CONTENT = 6000;
  const MAX_EMBEDS_IN_MSG = 10;

  //[Get V2 flag]
  utilsLib.useV2 = { flags: MessageFlags.IsComponentsV2 };

  //[Reply to interaction if it's not a plain message command]
  utilsLib.replyIfNotPlain = async (payload, commandContext, { check = true, toggle = false }) => {
    if (commandContext.type === CONTEXT_TYPES.PlainMessage && check) return false;
    if (toggle) await utilsLib.sendWithEphemeralToggle(commandContext, payload);
    else await commandContext.replyOrEditReply(payload);
    return true;
  };

  //[Handle sending a lot of components]
  utilsLib.batchSendComponents = async (componentArray, commandContext, { channel, replyMsg, skipReply } = {}) => {
    if (!componentArray?.length)
      return await commandContext.replyOrEditReply(replyMsg || "Something went wrong while processing this response.");
    if (!channel) channel = commandContext.channel;

    //process array into batches (array of arrays)
    const batches = redestributeItems(componentArray, getComponentLength, MAX_LEN_COMP_CONTENT, MAX_COMPS_IN_MSG);
    let sentBatches = 0;

    //[No replies]
    if (skipReply) {
      //now - send: first batch | later - send: rest of batches
      await channel.send({ components: batches[0], ...utilsLib.useV2 });
      sentBatches++;
    }
    //[With replies]
    else {
      //[Handle non ephemeral]
      if (!commandContext.ephemeral) {
        //now - reply: first batch | later - send: rest of batches
        await commandContext.replyOrEditReply({ components: batches[0], ...utilsLib.useV2 });
        sentBatches++;
      }
      //[Handle ephemeral]
      else {
        //now - reply (ephemeral): confirmation | later - send: all batches
        if (batches.length > 1 || (replyMsg && !info.appFlags?.silent)) {
          await commandContext.replyOrEditReply(replyMsg || "** **");
        }
        //now - reply (ephemeral): only batch
        else return await commandContext.replyOrEditReply({ components: batches[0], ...utilsLib.useV2 });
      }
    }
    //[Send rest of batches]
    for (const components of batches.slice(sentBatches)) {
      await channel.send({ components, ...utilsLib.useV2 });
    }
  };
  function getComponentLength(component) {
    if (!component) return 0;

    switch (component.data?.type) {
      case ComponentType.TextDisplay:
        return component.data.content?.length || 0;

      case ComponentType.Container:
      case ComponentType.Section:
        return component.components.reduce((sum, c) => sum + getComponentLength(c), 0);

      default:
        return 0; //buttons, thumbnails, etc
    }
  }

  //[Handle sending a lot of embeds]
  utilsLib.batchSendEmbeds = async (embedArray, commandContext, { channel, replyMsg, skipReply } = {}) => {
    if (!embedArray?.length)
      return await commandContext.replyOrEditReply(replyMsg || "Something went wrong while processing this response.");
    if (!channel) channel = commandContext.channel;

    //process array into batches (array of arrays)
    const batches = redestributeItems(embedArray, getEmbedLength, MAX_LEN_EMBED_CONTENT, MAX_EMBEDS_IN_MSG);
    let sentBatches = 0;

    //[No replies]
    if (skipReply) {
      //now - send: first batch | later - send: rest of batches
      await channel.send({ embeds: batches[0] });
      sentBatches++;
    }
    //[With replies]
    else {
      //[Handle non ephemeral]
      if (!commandContext.ephemeral) {
        //now - reply: first batch | later - send: rest of batches
        await commandContext.replyOrEditReply({ embeds: batches[0] });
        sentBatches++;
      }
      //[Handle ephemeral]
      else {
        //now - reply (ephemeral): confirmation | later - send: all batches
        if (batches.length > 1 || (replyMsg && !info.appFlags?.silent)) {
          await commandContext.replyOrEditReply(replyMsg || "** **");
        }
        //now - reply (ephemeral): only batch
        else return await commandContext.replyOrEditReply({ embeds: batches[0] });
      }
    }
    //[Send rest of batches]
    for (const embeds of batches.slice(sentBatches)) {
      await channel.send({ embeds: embeds });
    }
  };
  function getEmbedLength(embed) {
    return (
      (embed.data.title?.length || 0) +
      (embed.data.description?.length || 0) +
      (embed.data.fields?.reduce((sum, f) => sum + (f.value.length || 0), 0) || 0)
    );
  }

  //[Redestrubute Components or Embeds]
  function redestributeItems(items, getLength, maxLenChars, maxInMsg) {
    let batches = [[]];
    let currentCatchIndex = 0;
    let currentBatchLength = 0;
    //process array into arrays array
    for (const item of items) {
      const len = getLength(item);
      currentBatchLength += len;

      if (currentBatchLength > maxLenChars || batches[currentCatchIndex].length >= maxInMsg) {
        currentCatchIndex++;
        batches.push([]);
        currentBatchLength = len;
      }
      batches[currentCatchIndex].push(item);
    }
    return batches;
  }

  //[Find message and author by messageID]
  utilsLib.findMessage = async (messageId, channel, guild = null) => {
    try {
      const message = await channel.messages.fetch(messageId);
      if (!message) return null;

      let author = message.author;
      if (guild) {
        const member = guild.members.cache.get(author.id);
        if (member) author = member;
      }
      return { message, author };
    } catch {
      return null;
    }
  };

  //[Attach Keep Hidden & Make Public to hidden message]
  utilsLib.sendWithEphemeralToggle = async (commandContext, payload) => {
    if (!commandContext.ephemeral) return await commandContext.replyOrEditReply(payload); //already revealed
    const hiddenButton = utilsLib.makeButton("Keep Hidden", { customId: "toggle.hidden", style: "Secondary" });
    const publicButton = utilsLib.makeButton("Make Public", { customId: "toggle.public", style: "Success" });
    const toggleRow = utilsLib.makeRow([hiddenButton, publicButton]);
    if (typeof payload === "string") {
      await commandContext.replyOrEditReply({ content: payload, components: [toggleRow] });
    } else {
      const existingComps = payload.components ?? [];
      await commandContext.replyOrEditReply({ ...payload, components: [...existingComps, toggleRow] });
    }
  };
  //[Remove Keep Hidden & Make Public from message payload]
  utilsLib.stripEphemeralToggle = (payload) => utilsLib.stripCompsFromPayload(payload, ["toggle.hidden", "toggle.public"]);
};
