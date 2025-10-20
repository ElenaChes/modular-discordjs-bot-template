console.time("Load time");
const loadStart = new Date();
//[Imports]
const chalk = require("chalk").default;
console.log(chalk.red("Starting bot..."));
require("dotenv").config({ quiet: true });
//[Access to Discord]
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent } = GatewayIntentBits;
//[Prepare files]
const bootstrap = require("./app.js");

//[Setting Discord permissions]
const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, DirectMessages, MessageContent],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});

//[App flags] -> command-line arguments to customize bot behavior
const args = process.argv.slice(2);
const appFlags = {
  privateRegister: args.includes("--private"), //only register in servers with bot's owners
  unregisterGuilds: args.includes("--delete"), //unregister all commands (except global)
  unregisterGlobal: args.includes("--delete-global"), //unregister global commands
  silent: args.includes("--silent"), //use ephemeral messages where possible
  guildOnly: args.includes("--guild-only"), //disable global commands in DMs
  noMessages: args.includes("--no-messages"), //disable messageCreate event (disables plain message commands)
};

//[Load app]
(async () => {
  const context = await bootstrap(client, loadStart, { appFlags });
  client.login(process.env.TOKEN);
  context.utilsLib.logTime("App", "Login");
})();
