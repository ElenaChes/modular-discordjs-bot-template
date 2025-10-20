//[Imports]
const { ApplicationCommandOptionType } = require("discord.js");
const { Boolean: Bool, Integer, Number: Num, String: Str } = ApplicationCommandOptionType;
const { Channel, Mentionable, Role, User } = ApplicationCommandOptionType;
const ContextBase = require("./ContextBase.js");
//helpers
const { CONTEXT_TYPES } = require("../config/constants.js");
let validators; //gets filled later
let getCmdOptions; //gets filled later
//errors
const { errors } = require("../config/info.json");
const optionNullErr = (pos) => `Argument in position ${pos} can't be \`null\`.`;
const optionInvalidErr = (pos, arg) => `Argument \`${arg}\` in position ${pos} is invalid.`;

class MessageContext extends ContextBase {
  //[Command information]
  _fullCommandNames;
  _slashDoesntExist;
  #slashExistsPromise;

  //[Options]
  _commandOptions;
  #attachments = {};
  #booleans = {};
  #channels = {};
  #integers = {};
  #mentionables = {};
  #numbers = {};
  #roles = {};
  #strings = {};
  #users = {};

  constructor(message, libs, extra) {
    super(libs);
    validators = require("./helpers/argumentValidators.js")(this, libs);
    getCmdOptions = require("./helpers/commandOptions.js")(this, libs).getCmdOptions;

    //check if command exists in current guild
    this.#slashExistsPromise = this._helpers
      .checkRegisteredCommand(message, extra)
      .then((exists) => (this._slashDoesntExist = !exists));

    this.#parseMessageData(message, extra);
    this._raw = message;
  }

  //[Parse data to instance]
  #parseMessageData(message, { commandNames, args }) {
    if (this._slashDoesntExist) return; //async check finished?

    //command information
    this.type = CONTEXT_TYPES.PlainMessage;
    this.commandName = commandNames[0];
    this._fullCommandNames = commandNames; //["command", "subcommandGroup", "subcommand"]

    //context information
    this._helpers.assignMessageProps(message);

    //declaration & implementation
    this._helpers.fetchMessageCmdDeclaration(commandNames);
    this.#fetchCommandLogic();

    //fill options
    this.#assignMessageOptions(message, args);

    //fill option getters
    this.#assignMessageGetters(message);

    //responding
    this._helpers.assignMessageResponds(message);
  }

  //[Find command's function]
  #fetchCommandLogic() {
    if (this._slashDoesntExist) return; //async check finished?

    const [lowercase, capitalized1, capitalized2] = this._fullCommandNames;
    const functionName = lowercase + this._utilsLib.capitalize(capitalized1) + this._utilsLib.capitalize(capitalized2);
    this._commandsLibsName = functionName;
    this._commandLogic = this._commandsLib[functionName] ?? undefined;
  }

  //[Parse arguments]
  #assignMessageOptions(message, args) {
    if (this._slashDoesntExist) return; //async check finished?

    if (!this._commandOptions) return;
    const { messageOptions, attachOptions } = this._commandOptions;

    //[No arguments needed]
    if (!messageOptions?.length && !attachOptions?.length) {
      //[Received extra arguments]
      if (args?.length) this.optionsError = errors.msgExtraArgsError;
      return;
    }

    //[Parse arguments]
    const argsPassed = [...args];
    const totalArgs = argsPassed.length;
    for (const opt of messageOptions) {
      //get next argument
      const arg = argsPassed.shift();
      if (!arg) {
        if (opt.required) {
          this.optionsError = errors.msgArgsError;
          return;
        }
        break;
      }
      //skipping non required
      if (arg === "null") {
        if (!opt.required) continue;
        this.optionsError = optionNullErr(totalArgs - argsPassed?.length);
        return;
      }
      //parse & save
      if (!this.#parseArgToOption(opt, arg)) {
        this.optionsError = optionInvalidErr(totalArgs - argsPassed?.length, arg);
        return;
      }
    }
    //[Received extra arguments]
    if (argsPassed.length) {
      this.optionsError = errors.msgExtraArgsError;
      return;
    }

    //[No attachments needed]
    if (!attachOptions?.length) return; //no error for unnecessary attachments -> treated as mistake

    //[Parse attachments]
    const attachments = Array.from(message.attachments.values());
    for (const opt of attachOptions) {
      //get next attachment
      const attachment = attachments.shift();
      if (!attachment) {
        if (opt.required) {
          this.optionsError = errors.msgAttachError;
          return;
        }
        break;
      }
      //save
      this.#attachments[opt.name] = attachment;
    }
    //no error for extra attachments -> treated as mistake
  }

  //[Convert to correct type]
  #parseArgToOption(opt, arg) {
    //[Check choices]
    let fromChoice = false;
    if (opt.choices?.length) {
      const choice = this.#resolveChoice(opt, arg);
      if (choice === null) return false; //invalid choice
      arg = choice; //replace arg with the resolved choice value
      fromChoice = true;
    }

    //[Check type]
    switch (opt.type) {
      case Bool:
        return this.#validateOption(this.#booleans, validators.validateBoolean, opt, arg);
      case Channel:
        return this.#validateOption(this.#channels, validators.validateChannel, opt, arg);
      case Integer:
        return this.#validateOption(this.#integers, validators.validateInteger, opt, arg, fromChoice);
      case Mentionable:
        return this.#validateOption(this.#mentionables, validators.validateMentionable, opt, arg);
      case Num:
        return this.#validateOption(this.#numbers, validators.validateNumber, opt, arg);
      case Role:
        return this.#validateOption(this.#roles, validators.validateRole, opt, arg);
      case Str:
        return this.#validateOption(this.#strings, validators.validateString, opt, arg);
      case User:
        return this.#validateOption(this.#users, validators.validateUser, opt, arg);
      default:
        return false;
    }
  }
  //[Find choice value]
  #resolveChoice(opt, arg) {
    if (!opt.choices?.length) return undefined;
    const choice = opt.choices.find(({ name }) => name.toLowerCase() === arg.toLowerCase());
    return choice ? choice.value : null;
  }
  //[Parse to type]
  #validateOption(options, validator, opt, arg, fromChoice = false) {
    const value = validator({ commandContext: this, opt, arg, fromChoice });
    if (value === undefined) return false;
    options[opt.name] = value;
    return true;
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

      getAttachment: (name) => this.#attachments[name] ?? undefined,
      getBoolean: (name) => this.#booleans[name] ?? undefined,
      getChannel: (name) => this.#channels[name] ?? undefined,
      getInteger: (name) => this.#integers[name] ?? undefined,
      getMentionable: (name) => this.#mentionables[name] ?? undefined,
      getNumber: (name) => this.#numbers[name] ?? undefined,
      getRole: (name) => this.#roles[name] ?? undefined,
      getString: (name) => this.#strings[name] ?? undefined,
      getUser: (name) => this.#users[name] ?? undefined,
    };
  }

  //[Get command's declaration]
  async getCommand() {
    await this.#slashExistsPromise; //await async check
    if (this._slashDoesntExist) return; //not registered in guild

    if (!this._command?.execute || !this._commandOptions) return null; //no code found -> treat as a typo
    return super.getCommand();
  }

  //[Additional check for runCommand()]
  async _preCommandCheck() {
    if (this.optionsError) {
      const commandOptions = await getCmdOptions();
      return [this.optionsError, commandOptions].join("\n\n");
    }
    return null;
  }
}

module.exports = MessageContext;
