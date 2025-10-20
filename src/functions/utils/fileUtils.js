//[Imports]
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");

module.exports = ({ utilsLib }) => {
  //[Get all folders inside directory]
  utilsLib.getFolders = (dirPath) => {
    const absPath = path.join(ROOT, dirPath);
    return fs
      .readdirSync(absPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  };

  //[Get all files inside directory]
  utilsLib.getFiles = (dirPath, extension = ".js") => {
    const absPath = path.join(ROOT, dirPath);
    return fs
      .readdirSync(absPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name);
  };

  //[Safely require file]
  utilsLib.safeRequire = (filePath) => {
    const absPath = path.join(ROOT, filePath);
    if (!fs.existsSync(absPath)) return null;
    return require(absPath);
  };
};
