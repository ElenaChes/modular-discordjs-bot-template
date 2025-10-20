//[Imports]
const ContextBase = require("./ContextBase.js");
const { CONTEXT_TYPES } = require("../config/constants.js");

class ContextMenuContext extends ContextBase {
  //[Command information]
  commandName;

  constructor(interaction, libs) {
    super(libs);
    this.#parseInteractionData(interaction);
    this._raw = interaction;
  }

  //[Parse data to instance]
  #parseInteractionData(interaction) {
    //command information
    this.type = CONTEXT_TYPES.ContextMenu;
    this.commandName = interaction.commandName;

    //context information
    this._helpers.assignInteractionProps(interaction);
    this.isUserContextMenuCommand = () => interaction.isUserContextMenuCommand();
    this.isMessageContextMenuCommand = () => interaction.isMessageContextMenuCommand();
    if (interaction.isUserContextMenuCommand()) this.targetUser = interaction.targetUser;
    else if (interaction.isMessageContextMenuCommand()) this.targetMessage = interaction.targetMessage;

    //declaration & implementation
    this._helpers.fetchInteractionCmdDeclaration();

    //responding
    this._helpers.assignInteractionResponds(interaction);
  }
}

module.exports = ContextMenuContext;
