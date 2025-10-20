//[Imports]
const fs = require("fs"); //accessing other folders & files
const path = require("path");
const { Collection } = require("discord.js");
const AsciiTable = require("ascii-table");
//[Access to database]
const mongoose = require("mongoose");
const { DBURL } = process.env; //load passwords

module.exports = async (client, loadStart, { appFlags }) => {
  client.commands = new Collection();
  client.buttons = new Collection();
  client.selectMenus = new Collection();

  const context = {
    appLoaded: false, //block interactions while bot is loading
    client, //Discord client instance
    utilsLib: {}, //utility functions
    commandsLib: {}, //commands logic
    runtimeLib: {}, //runtime functions
    info: {
      appFlags, //command-line flags
      commandDescs: {}, //command descriptions
      commandCategories: [], //command categories for autocomplete
      schemaNames: [], //schema names for autocomplete
    },
    commandsMap: {
      global: {}, //global commands
      guildLocked: {}, //server-locked commands
    },
    load: {
      logs: "", //logs for the loading process
      addLogs(msg) {
        this.logs += "\n" + msg;
      },
      start: loadStart, //start time of the bot loading process
      times: new AsciiTable("Load Times") //time logs
        .setHeading("T] Name ", "Ready/Done ", "Exec /Idle ")
        .setBorder("|", "=", "0", "0"),
    }, //deleted once bot is fully loaded
  };

  //[Prepare files]
  const folders = [
    "./schemas", //mongoose schemas
    "./functions/utils", //utility functions (context.utilsLib)
    "./functions/runtime", //runtime functions (context.runtimeLib) [dependent on schemas]
    "./functions/commands", //commands logic (context.commandsLib) [dependent on runtimeLib]
    "./functions/loaders", //app handlers (context.load)
  ];
  folders.forEach((f) => prepareFolder(path.join(__dirname, f)));

  //[Iterate folder and sub folders]
  function prepareFolder(folder) {
    const files = fs.readdirSync(folder, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(folder, file.name);
      if (file.isDirectory()) prepareFolder(fullPath); //go into sub folder
      else if (file.name.endsWith(".js"))
        try {
          require(fullPath)(context);
        } catch (error) {
          console.error(`Failed to load ${fullPath}`, error);
          process.exit(1);
        }
    }
  }
  context.utilsLib.logTime("App", "Prep");

  //[Schema names for autocomplete]
  context.info.schemaNames = mongoose.modelNames().map((key) => ({ name: key, value: key.toLowerCase() })); //prettier-ignore

  //[Connect to Database]
  const dbStart = new Date();
  //prettier-ignore
  context.load.dbReady = mongoose.connection?.close() 
    .then(() => mongoose.connect(DBURL))
    .then(() => context.utilsLib.logTime("DB", "Connect", dbStart))
    .catch((error) => {
      console.error("DB connection failed:", error);
      process.exit(1);
    });

  //[Run handlers]
  const handlers = {
    accessReady: context.runtimeLib.loadAccess, //in runtime because it's reload-able
    commandsReady: context.load.handleCommands,
    eventsReady: context.load.handleEvents,
    componentsReady: context.load.handleComponents,
  };

  console.log(context.utilsLib.colorMsg("Running handlers...", "red"));

  //[Save promises]
  Object.entries(handlers).forEach(([key, fn]) => {
    if (fn) context.load[key] = fn();
  });
  context.load.handlersReady = Promise.all(
    Object.entries(handlers)
      .filter(([_, fn]) => fn)
      .map(([key]) => context.load[key])
  );
  /* Wait for handlers:
    await context.load.dbReady -> database connected
    await context.load.xReady -> x handler finished running
    await context.load.handlersReady -> all handlers finished running
  */

  return context;
};
