//[Imports]
const ContextBase = require("./ContextBase.js");
const { CONTEXT_TYPES } = require("../config/constants.js");
let getCmdOptions; //gets filled later

class HelpContext extends ContextBase {
  //[Command information]
  _fullCommandNames;
  _slashDoesntExist;
  #slashExistsPromise;

  //[Options]
  _commandOptions;

  constructor(message, libs, extra) {
    super(libs);
    getCmdOptions = require("./helpers/commandOptions.js")(this, libs).getCmdOptions;

    //check if command exists in current guild
    this.#slashExistsPromise = this._helpers
      .checkRegisteredCommand(message, extra)
      .then((exists) => (this._slashDoesntExist = !exists));

    this.#parseMessageData(message, extra);
    this._raw = message;
  }

  //[Parse data to instance]
  #parseMessageData(message, { commandNames }) {
    if (this._slashDoesntExist) return; //async check finished?

    //command information
    this.type = CONTEXT_TYPES.PlainMessage;
    this.commandName = commandNames[0];
    this._fullCommandNames = commandNames; //["command", "subcommandGroup", "subcommand"]

    //context information
    this._helpers.assignMessageProps(message);

    //declaration & implementation
    this._helpers.fetchMessageCmdDeclaration(commandNames);

    //fill option getters
    this.#assignMessageGetters(message, commandNames);

    //responding
    this._helpers.assignMessageResponds(message);
  }

  //[Attach getters]
  #assignMessageGetters(message) {
    if (this._slashDoesntExist) return; //async check finished?

    this.options = {
      getMember: () => message.member,
      getMessage: () => message,
      getSubcommand: () => this.subcommand ?? undefined,
      getSubcommandGroup: () => this.subcommandGroup ?? undefined,
      getFocused: () => "",
    };
  }

  //[Get command's declaration]
  async getCommand() {
    await this.#slashExistsPromise; //await async check
    if (this._slashDoesntExist) return; //not registered in guild

    if (!this._command?.execute || !this._commandOptions) return null; //no code found -> treat as a typo
    return super.getCommand();
  }

  //[Override runCommand's logic]
  async runCommand(access = "") {
    //[Check user permissions]
    const { valid, authError } = this.setAccess(access);
    if (!valid) return await this.handleError({ message: authError });

    //[Parse help command]
    const helpCommandMsg = await getCmdOptions();
    return await this.reply(helpCommandMsg);
  }
}

module.exports = HelpContext;
