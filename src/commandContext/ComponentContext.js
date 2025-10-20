//[Imports]
const { ComponentType } = require("discord.js");
const ContextBase = require("./ContextBase.js");
const { CONTEXT_TYPES } = require("../config/constants.js");
const { errors } = require("../config/info.json");

class ComponentContext extends ContextBase {
  //[Command information]
  customId;

  constructor(interaction, libs) {
    super(libs);
    this.#parseInteractionData(interaction);
    this._raw = interaction;
  }

  //[Parse data to instance]
  #parseInteractionData(interaction) {
    //command information
    this.type = this.#getInteractionType(interaction);
    this.customId = interaction.customId;

    //context information
    this._helpers.assignInteractionProps(interaction);

    //declaration & implementation
    this.#fetchComponentDeclaration();

    //responding
    this.#assignInteractionResponds(interaction);
  }

  //[Categorize interaction type]
  #getInteractionType(interaction) {
    switch (interaction.componentType) {
      case ComponentType.Button:
        return CONTEXT_TYPES.Button;
      case ComponentType.StringSelect:
        return CONTEXT_TYPES.StringSelectMenu;
      case ComponentType.UserSelect:
        return CONTEXT_TYPES.UserSelectMenu;
      case ComponentType.RoleSelect:
        return CONTEXT_TYPES.RoleSelectMenu;
      case ComponentType.ChannelSelect:
        return CONTEXT_TYPES.ChannelSelectMenu;
      case ComponentType.MentionableSelect:
        return CONTEXT_TYPES.MentionableSelectMenu;
      default:
        //failsafe for old components
        return interaction.isButton()
          ? CONTEXT_TYPES.Button
          : interaction.isStringSelectMenu()
          ? CONTEXT_TYPES.StringSelectMenu
          : null;
    }
  }

  //[Find component declaration]
  #fetchComponentDeclaration() {
    let component;
    switch (this.type) {
      case CONTEXT_TYPES.Button:
        component = this._client.buttons.get(this.customId);
        if (component) this._command = component;
        else this.commandError = errors.buttonError;
        break;
      case CONTEXT_TYPES.StringSelectMenu:
      case CONTEXT_TYPES.UserSelectMenu:
      case CONTEXT_TYPES.RoleSelectMenu:
      case CONTEXT_TYPES.ChannelSelectMenu:
      case CONTEXT_TYPES.MentionableSelectMenu:
        component = this._client.selectMenus.get(this.customId);
        if (component) this._command = component;
        else this.commandError = errors.menuError;
        break;
      default:
        this.commandError = errors.interactionError;
    }
  }

  //[Attach reply/editReply/etc]
  #assignInteractionResponds(interaction) {
    if ("deferUpdate" in interaction) {
      this.deferUpdate = async (payload) => {
        if (payload?.appFlags && !this._forceSilent) this.ephemeral = payload.flags;
        interaction.deferUpdate(payload);
        this.deferred = true;
      };
    }

    if ("reply" in interaction) {
      this.reply = async (payload) => {
        if (typeof payload === "string") {
          await interaction.reply({ content: payload, flags: this.ephemeral });
        } else {
          if (payload?.appFlags && !this._forceSilent) this.ephemeral = payload.flags;
          await interaction.reply({ ...payload, flags: this.ephemeral });
        }
        this.replied = true;
      };
    }
    this.editReply = this.reply.bind(interaction); //failsafe
    this.followUp = this.reply.bind(interaction); //failsafe

    if ("update" in interaction) {
      this.update = async (payload) => {
        await interaction.update(payload);
        this.replied = true;
      };
    }
  }
}

module.exports = ComponentContext;
