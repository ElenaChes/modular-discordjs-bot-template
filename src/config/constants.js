const { ApplicationCommandOptionType, ChannelType, ActivityType, PresenceUpdateStatus } = require("discord.js");

//[Class enums]
const CONTEXT_ORIGINS = Object.freeze({
  InteractionCreate: "interactionCreate",
  MessageCreate: "messageCreate",
  HelpMessageCreate: "helpMessageCreate",
});
const CONTEXT_TYPES = Object.freeze({
  ChatInput: "chat",
  Autocomplete: "autocomplete",
  ContextMenu: "context",
  Button: "button",
  StringSelectMenu: "stringSelectMenu",
  UserSelectMenu: "userSelectMenu",
  RoleSelectMenu: "roleSelectMenu",
  ChannelSelectMenu: "channelSelectMenu",
  MentionableSelectMenu: "mentionableSelectMenu",
  PlainMessage: "plainMessage",
});

//[Message argument enums]
const { Boolean: Bool, Integer, Number: Num, String: Str } = ApplicationCommandOptionType;
const { Attachment, Channel, Mentionable, Role, User } = ApplicationCommandOptionType;
const TYPE_LABELS = Object.freeze({
  [Attachment]: "Attachment",
  [Bool]: ["true", "false"],
  [Channel]: "Channel",
  [Integer]: "Round number",
  [Mentionable]: "User or Role",
  [Num]: "Number",
  [Role]: "Role",
  [Str]: "Text",
  [User]: "User",
});
const { GuildAnnouncement, GuildCategory, GuildForum, GuildStageVoice, GuildText, GuildVoice } = ChannelType;
const { AnnouncementThread, PrivateThread, PublicThread } = ChannelType;
const CHANNEL_LABELS = Object.freeze({
  [GuildAnnouncement]: "Announcement channel",
  [GuildCategory]: "Category",
  [GuildForum]: "Forum",
  [GuildStageVoice]: "Stage channel",
  [GuildText]: "Text channel",
  [GuildVoice]: "Voice channel",
  [AnnouncementThread]: "Announcement thread",
  [PrivateThread]: "Private thread",
  [PublicThread]: "Public thread",
});

//[Presence enums]
const { Playing, Listening, Watching, Competing } = ActivityType;
const ACTIVITY_LABELS = Object.freeze({
  [Playing]: "Playing",
  [Listening]: "Listening to",
  [Watching]: "Watching",
  [Competing]: "Competing in",
});
const { Online, Idle, DoNotDisturb, Invisible } = PresenceUpdateStatus;
const STATUS_LABELS = Object.freeze({
  [Online]: "Online",
  [Idle]: "Idle",
  [DoNotDisturb]: "Do not disturb",
  [Invisible]: "Invisible",
});

//[Status enums]
const STATE_CONFIG = {
  //regular behaviour, but unstable
  maintenance: {
    activity: "[maintenance]",
    status: Idle,
    already: "I'm already under maintenance.",
    success: (activity, statusLabel) => `Entering maintenance state.\nNew presence: ${activity}, ${statusLabel}.`,
  },
  //ignores all interactions (except state update)
  sleep: {
    activity: "[asleep]",
    status: DoNotDisturb,
    already: "I'm sleeping already.",
    success: (activity, statusLabel) => `Night night!\nNew presence: ${activity}, ${statusLabel}.`,
  },
  //normal activity
  active: {
    activity: "",
    status: null, //null = reset
    already: "Hmm I was already active.",
    success: () => "Going back to regular activity!",
  },
};

module.exports = { CONTEXT_ORIGINS, CONTEXT_TYPES, TYPE_LABELS, CHANNEL_LABELS, ACTIVITY_LABELS, STATUS_LABELS, STATE_CONFIG };
