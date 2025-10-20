//[Imports]
const ContextBase = require("./ContextBase.js");
const { CONTEXT_TYPES } = require("../config/constants.js");

class InteractionContext extends ContextBase {
  //[Command information]
  commandName;
  subcommand;
  subcommandGroup;

  constructor(interaction, libs) {
    super(libs);
    this.#parseInteractionData(interaction);
    this._raw = interaction;
  }

  //[Parse data to instance]
  #parseInteractionData(interaction) {
    //command information
    this.type = this.#getInteractionType(interaction);
    this.commandName = interaction.commandName;
    this.subcommandGroup = interaction.options?.getSubcommandGroup(false);
    this.subcommand = interaction.options?.getSubcommand(false);

    //context information
    this._helpers.assignInteractionProps(interaction);

    //declaration & implementation
    this._helpers.fetchInteractionCmdDeclaration();
    this.#fetchCommandLogic();

    //fill option getters
    this.#assignInteractionGetters(interaction);

    //responding
    this._helpers.assignInteractionResponds(interaction);
  }

  //[Categorize interaction type]
  #getInteractionType(interaction) {
    return interaction.isChatInputCommand()
      ? CONTEXT_TYPES.ChatInput
      : interaction.isContextMenuCommand()
      ? CONTEXT_TYPES.ContextMenu
      : /* Note:
          commandContext of type Autocomplete don't get created in current setup.
          (check out interactionCreate.js)
        */
      interaction.isAutocomplete()
      ? CONTEXT_TYPES.Autocomplete
      : null;
  }

  //[Find command's function]
  #fetchCommandLogic() {
    const functionName =
      this.commandName + this._utilsLib.capitalize(this.subcommandGroup) + this._utilsLib.capitalize(this.subcommand);
    this._commandsLibsName = functionName;
    this._commandLogic = this._commandsLib[functionName] ?? undefined;
  }

  //[Attach getters]
  #assignInteractionGetters(interaction) {
    this.options = {
      getMember: () => interaction.member,
      getMessage: () => interaction.message,
    };
    if (interaction.options) {
      for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(interaction.options))) {
        const value = interaction.options[key];
        if (typeof value !== "function") continue;
        this.options[key] = (...args) => interaction.options[key](...args);
      }
    }
  }
}

module.exports = InteractionContext;
