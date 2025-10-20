//[Imports]
const AsciiTable = require("ascii-table"); //printable table

module.exports = (context) => {
  const { client, utilsLib, runtimeLib, load } = context;
  const { buttons, selectMenus } = client;
  //[Components map]
  const folderConfig = {
    buttons: { collection: buttons, counter: 0 },
    selectMenus: { collection: selectMenus, counter: 0 },
  };

  //[Process component files]
  load.handleComponents = async () => {
    const start = new Date();
    const componentFolders = utilsLib.getFolders("./components");

    //[Process component files]
    function processFolder(folder, fullPath) {
      const config = folderConfig[folder];
      if (!config) utilsLib.throwError(__filename, `Unrecognized folder ./${fullPath}.`);
      if (!config.collection) utilsLib.throwError(__filename, `Client is missing a collection for "${folder}".`);

      const files = utilsLib.getFiles(`./${fullPath}`);
      for (const file of files) {
        const component = require(`../../${fullPath}/${file}`)(context);
        //[Check valid component]
        if (!("data" in component)) utilsLib.throwError(__filename, `Component missing "data" ./${fullPath}/${file}.`);
        if (!("execute" in component)) utilsLib.throwError(__filename, `Component missing "execute" ./${fullPath}/${file}.`);

        component.execute = runtimeLib.wrapWithCatch(component.execute, { fileName: file });
        config.collection.set(component.data.name, component);
        config.counter++;
      }
    }

    //[Iterate component folders]
    for (const folder of componentFolders) {
      const fullPath = `components/${folder}`;
      processFolder(folder, fullPath);
      const subFolders = utilsLib.getFolders(`./${fullPath}`);
      for (const subFolder of subFolders) {
        processFolder(folder, `${fullPath}/${subFolder}`);
      }
    }

    //[Format logs]
    const table = new AsciiTable("Components").setBorder("|", "=", "0", "0").setAlign(1, AsciiTable.CENTER);
    for (const [name, config] of Object.entries(folderConfig)) {
      table.addRow(utilsLib.capitalize(name), config.counter || "0");
    }
    const msg = table.toString().replaceAll(" ", "_");
    const { consoleMsg, discordMsg } = utilsLib.dualColorMsg(msg, "blue");
    load.addLogs(discordMsg);
    console.log(consoleMsg);
    utilsLib.logTime("Comps", "Handler", start);
  };
};
