//[Imports]
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");

module.exports = ({ utilsLib, info, commandsMap }) => {
  //[Get absolute path]
  utilsLib.relativePathToAbs = (relativePath, dirPath = null) => path.resolve(dirPath ?? ROOT, relativePath);

  //[Get file name from file path]
  utilsLib.getFileName = (file) => {
    if (typeof file !== "string") return file;
    return file.includes("/") || file.includes("\\") ? path.basename(file) : file;
  };

  //[Throw error with file name]
  utilsLib.throwError = (file, msg) => {
    throw new Error(`${utilsLib.getFileName(file)}: ${msg}`);
  };

  //[Warn with function name]
  utilsLib.warn = (func, msg) => console.warn(`${utilsLib.colorMsg(`${func}:`, "yellow")} ${msg}`);

  //[Chop without rounding]
  utilsLib.chopNumber = (number, digits = 1, fractionOnly = false) => {
    const factor = 10 ** digits;
    const chopped = Math.trunc(number * factor) / factor;

    if (!fractionOnly) return chopped;

    //calculate fractional part (always positive)
    const frac = number - Math.trunc(number);
    const choppedFrac = Math.trunc(frac * factor) / factor;

    return Math.abs(choppedFrac);
  };

  //[Command categories registered in guild]
  utilsLib.getCmdCategories = async (guild) => {
    const { commandCategories } = info;
    const commandPerms = commandsMap?.guildLocked;
    console.log(commandCategories);

    //map checks
    const checks = await Promise.all(
      commandCategories.map(async (label) => {
        const category = label.value;
        const lockedCategory = commandPerms[category];
        const include = lockedCategory ? await lockedCategory.check(guild) : true;
        return { label, include };
      })
    );

    //filter
    const categories = checks
      .filter(({ include }) => include)
      .map(({ label }) => label)
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(categories);
    return categories || [];
  };
};
