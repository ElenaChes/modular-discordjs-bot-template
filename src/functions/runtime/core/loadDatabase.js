//[Imports]
const AsciiTable = require("ascii-table");
//[Variables]
let errorsCount = 0;

//[Load database data]
module.exports = (context) => {
  const { utilsLib, runtimeLib, info } = context;

  //[Loader functions map]
  const loadersConfig = {
    profile: { loader: loadProfile, result: "x" },
    /* Alternatively count documents instead of plain x/v:
       schema: { load: loadSchema, result: 0 }
    */
  };

  //[Load data from database]
  runtimeLib.loadDatabase = async (schemaName) => {
    const { load } = context;
    const start = new Date();
    if (load) await load.accessReady;
    const actual = new Date();

    //[Run single database loader]
    if (schemaName) {
      if (!(schemaName in loadersConfig)) return null;
      const success = await loadersConfig[schemaName].loader(); //load single schema
      if (!success) return null;
      return utilsLib.timeDiff(start);
    }
    if (!load) return utilsLib.throwError(__filename, "Can't load the entire DB, pass a valid schemaName.");

    //[Run all database loaders]
    await Promise.all(
      Object.values(loadersConfig).map(async (config) => {
        config.result = (await config.loader()) || config.result; //update result or keep default
      })
    );

    //[Format logs]
    const table = new AsciiTable("Database").setBorder("|", "=", "0", "0").setAlign(1, AsciiTable.CENTER);
    table.addRow(`Access`, load.accessResult || "x");
    for (const [name, config] of Object.entries(loadersConfig)) {
      if (config.result == "x") errorsCount++;
      table.addRow(utilsLib.capitalize(name), config.result || "x");
    }
    if (load.accessResult !== "✓") errorsCount++;
    table.addRow(`Errors`, errorsCount);

    const msg = table.toString().replaceAll(" ", "_");
    const { consoleMsg, discordMsg } = utilsLib.dualColorMsg(msg, "cyan");
    load.addLogs(discordMsg);
    console.log(consoleMsg);
    utilsLib.logTime("DB", "Handler", start, actual);
  };

  function parseResult(result) {
    if (!result) return null;
    if (Array.isArray(result)) return result.length;
    else return "✓";
  }

  //[Load bot profile or create new]
  async function loadProfile() {
    try {
      let profile = await runtimeLib.findOrCreateProfile();

      info.appLabel = profile.botLabel;
      info.logChannel = profile.logChannel ?? undefined;
      info.extraRole = profile.extraRole ?? undefined;
      runtimeLib.refreshPresence(profile.presence); //refresh bot presence

      return parseResult(profile);
    } catch (error) {
      await runtimeLib.handleError(error, __filename);
      errorsCount++;
    }
  }
};
