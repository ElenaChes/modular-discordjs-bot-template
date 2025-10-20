//[Imports]
const { connection } = require("mongoose"); //database access
const AsciiTable = require("ascii-table"); //printable table

module.exports = (context) => {
  const { client, utilsLib, load } = context;
  //[Events map]
  const folderConfig = {
    client: { emitter: client, counter: 0 }, //Discord.js events
    database: { emitter: connection, counter: 0 }, //Mongoose events
    process: { emitter: process, counter: 0 }, //Process events
  };

  //[Attach event listeners]
  load.handleEvents = async () => {
    const start = new Date();
    const eventFolders = utilsLib.getFolders("./events");

    //[Iterate event folders]
    for (const folder of eventFolders) {
      const config = folderConfig[folder];
      if (!config) continue; //skip unrecognized folders
      const emitter = config.emitter;
      if (!emitter) continue; //skip non existing emitters

      //[Attach listeners]
      const eventFiles = utilsLib.getFiles(`./events/${folder}`);
      for (const file of eventFiles) {
        const event = require(`../../events/${folder}/${file}`);

        const handler = (...args) => {
          if (!event.name?.startsWith("SIG")) return event.execute(...args, context);
          return event.execute(args, context); //args = [signalName, signalCode]
        };
        if (event.once) emitter.once(event.name || event.normalize, handler);
        else emitter.on(event.name || event.normalize, handler);
        config.counter++;
      }
    }

    //[Format logs]
    const table = new AsciiTable("Events").setBorder("|", "=", "0", "0").setAlign(1, AsciiTable.CENTER);
    for (const [name, config] of Object.entries(folderConfig)) {
      table.addRow(`${utilsLib.capitalize(name)} events`, config.counter || "0");
    }
    const msg = table.toString().replaceAll(" ", "_");
    const { consoleMsg, discordMsg } = utilsLib.dualColorMsg(msg, "greenBright");
    load.addLogs(discordMsg);
    console.log(consoleMsg);
    utilsLib.logTime("Events", "Handler", start);
  };
};
