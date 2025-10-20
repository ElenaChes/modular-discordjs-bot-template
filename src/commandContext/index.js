//[Imports]
const { ComponentType } = require("discord.js");
const InteractionContext = require("./InteractionContext.js");
const ComponentContext = require("./ComponentContext.js");
const ContextMenuContext = require("./ContextMenuContext.js");
const MessageContext = require("./MessageContext.js");
const HelpContext = require("./HelpContext.js");
//helpers
const { CONTEXT_ORIGINS } = require("../config/constants.js");

function createCommandContext(origin, raw, libs, extra = {}) {
  switch (origin) {
    case CONTEXT_ORIGINS.InteractionCreate:
      //component
      if (isComponent(raw)) {
        return new ComponentContext(raw, libs);
      }
      //context menu
      else if (raw.isContextMenuCommand()) {
        return new ContextMenuContext(raw, libs);
      }
      //slash command
      else {
        return new InteractionContext(raw, libs);
      }

    case CONTEXT_ORIGINS.MessageCreate:
      return new MessageContext(raw, libs, extra);

    case CONTEXT_ORIGINS.HelpMessageCreate:
      return new HelpContext(raw, libs, extra);
    default:
      return utilsLib.throwError(__filename, `Unknown command origin "${origin}".`);
  }
}
function isComponent(raw) {
  const componentTypes = [
    ComponentType.Button,
    ComponentType.StringSelect,
    ComponentType.UserSelect,
    ComponentType.RoleSelect,
    ComponentType.ChannelSelect,
    ComponentType.MentionableSelect,
  ];
  return (
    componentTypes.includes(raw.componentType) ||
    raw.isButton() || //failsafe for old components
    raw.isStringSelectMenu() //failsafe for old components
  );
}

module.exports = { createCommandContext };
