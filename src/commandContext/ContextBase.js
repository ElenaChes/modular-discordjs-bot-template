//[Imports]
const { MessageFlags, PermissionsBitField } = require("discord.js");
const { CONTEXT_TYPES } = require("../config/constants");
//errors
const { deny, errors } = require("../config/info.json");
const commandExecErr = (type, name) => `Couldn't find declaration for ${type} '${name}'.`;
const commandLogicErr = (name) => `Couldn't find function '${name}()'.`;

class ContextBase {
  _helpers;

  _client;
  _utilsLib;
  _commandsLib;
  _runtimeLib;

  //[Command information]
  type;
  _commandsLibsName;
  _command;
  _commandLogic;

  //[Context information]
  guild;
  guildId;
  channel;
  channelId;
  message;
  user;
  member;
  createdTimestamp;

  //[Options]
  options = {}; //getters

  //[Responding]
  deferred = false;
  replied = false;
  ephemeral = 0;
  _access = "";

  //[Extra]
  #raw = null; //full interaction/message/etc

  constructor(libs) {
    this._helpers = require("./helpers/commandBindings.js")(this, libs);

    const { client, utilsLib, commandsLib, runtimeLib, info } = libs;
    this._client = client;
    this._utilsLib = utilsLib;
    this._commandsLib = commandsLib;
    this._runtimeLib = runtimeLib;
    this._forceState = info?.appState;
    this._forceSilent = info?.appFlags?.silent;
    if (this._forceSilent) this.setEphemeral(true);
  }

  //[Runtime methods]
  setAccess(access) {
    this._access = access;
    return this.#checkUserPerms(access);
  }
  setEphemeral(hidden = true) {
    if (this.type === CONTEXT_TYPES.PlainMessage) this.ephemeral = 0; //plain messages can't be ephemeral
    else this.ephemeral = hidden || this._forceSilent ? MessageFlags.Ephemeral : 0;
  }
  //set commandsLib function name - needed for Context Menus
  setCommandLogic(functionName) {
    this._commandsLibsName = functionName;
    this._commandLogic = this._commandsLib[functionName] ?? undefined;
    return this;
  }
  //check access and set ephemeral - needed for Components
  async prepareExecution(access, hidden, { userBound = false, roleId = null } = {}) {
    this.setEphemeral(hidden);
    //access check
    const { valid, authError } = this.setAccess(access);
    if (!valid) {
      await this.handleError({ message: authError });
      return null;
    }
    //user ownership check
    if (userBound) {
      const boundUserId = await this.#getBoundUser();
      if (!boundUserId || this.user.id !== boundUserId) {
        const msg = boundUserId ? `This button isn't for you, it belongs to <@${boundUserId}>.` : "This button can't be used.";
        await this.handleError({ message: msg });
        return null;
      }
    }
    //role check
    if (roleId) {
      const hasRole = this.member?.roles.cache.has(roleId);
      if (!hasRole) {
        await this.handleError({ message: `You need the <@&${roleId}> role to interact with this button.` });
        return null;
      }
    }
    return this; //passed all checks
  }

  //[Get command's declaration]
  async getCommand() {
    if (this._forceState === "sleep" && !this.#stateChangeCommand()) {
      return null; //bot is asleep
    }
    if (this.type === CONTEXT_TYPES.PlainMessage) {
      if (!this._command?.execute || !this._commandOptions) return null; //no code found -> treat as a typo
    }

    if (this._command?.execute) return this._command;
    const type = this.type?.replace(/([a-z])([A-Z])/g, "$1 $2")?.toLowerCase();
    const name = this.commandName ? `/${this.commandName}` : this.customId;
    const error = commandExecErr(type, name);
    await this.handleError({ message: this.commandError, error, location: "project structure" });
    return null;
  }
  
  //[Get full interaction/message/etc]
  getRaw() {
    return this.#raw;
  }

  //[Run command's logic]
  async runCommand(access = "", hidden = false, { defer = false, saveMessage = false } = {}) {
    this.setEphemeral(hidden);
    //[Defer interaction]
    if (defer && "deferReply" in this) {
      const message = await this.deferReply({ withResponse: saveMessage, flags: this.ephemeral });
      if (saveMessage) this.message = message?.resource?.message;
    }

    //[Check user permissions]
    const { valid, authError } = this.setAccess(access);
    if (!valid) return await this.handleError({ message: authError });

    //[Sub class check]
    const preLogicError = await this._preCommandCheck?.();
    if (preLogicError) return await this.handleError({ message: preLogicError });

    //[Run command]
    if (!this._commandLogic) {
      if (this.type === CONTEXT_TYPES.PlainMessage) return; //no code found -> treat as a typo
      const error = commandLogicErr(this._commandsLibsName);
      return await this.handleError({ message: errors.commandError, error, location: "project structure" });
    }
    await this._commandLogic(this);
  }

  //[Respond to user when something breaks]
  async handleError({ message = errors.commandFailure, error = null, location = __filename } = {}) {
    this.setEphemeral(true); //errors hidden by default

    //[Reply to user]
    try {
      if (!this.replied) {
        this.replyOrEditReply({ content: message, flags: this.ephemeral });
      }
    } catch (error) {
      if (this.deferred || this.replied) await this.followUp({ content: message, flags: this.ephemeral });
      console.error(error);
    }
    //[Log error for bot owner]
    if (error) await this._runtimeLib.handleError(error, location, { guild: this.guild, user: this.user });
  }

  //[Reply or editReply automatically]
  async replyOrEditReply(payload) {
    if (this.deferred) await this.editReply(payload);
    else await this.reply(payload);
  }

  //verify user permissions
  #checkUserPerms(access) {
    switch (access) {
      case "": //public access
        return { valid: true };

      case "admin": //failsafe (discord perms should be declared in command)
        if (this.member?.permissions.has(PermissionsBitField.flags.Administrator)) return { valid: true };
        return { valid: false, authError: deny.admin };

      default: //check access by user's roles
        if (this._utilsLib.checkAccess(this.user.id, access)) return { valid: true };
        return { valid: false, authError: deny[access] || deny.default };
    }
  }
  //get owner of a component (who the bot replied to)
  async #getBoundUser() {
    if (!this.message) return null;
    //component on an interaction response
    if (this.message.interaction) {
      return this.message.interaction.user?.id;
    }
    //component on a plain message response
    else if (this.message.reference?.messageId) {
      try {
        const refMsg = await this.message.fetchReference();
        return refMsg?.author?.id ?? null;
      } catch {} //referenced message deleted or inaccessible
    }
    return null;
  }
  //check command run is state changing command
  #stateChangeCommand() {
    if (!this._commandsLibsName) return false;
    const lowerCaseName = this._commandsLibsName.toLowerCase();
    return lowerCaseName.includes("manage") && lowerCaseName.includes("state");
  }
}

module.exports = ContextBase;
