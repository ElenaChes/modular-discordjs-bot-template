//[Imports]
const chalk = require("chalk").default;

module.exports = ({ utilsLib }) => {
  //[Capitalizes first letter] -> depending on type, explanation in function
  utilsLib.capitalize = (text) => {
    if (!text) return "";

    //["test", "string"] => ["Test", "String"]
    if (Array.isArray(text)) return text.map(utilsLib.capitalize);
    if (typeof text !== "string") return text;

    //"test-string" => "TestString"
    if (text.includes("-")) {
      const capitalizedParts = text.split("-").map(utilsLib.capitalize);
      return capitalizedParts.join("");
    }

    //"[text string]" => "[Text string]"
    if (text.startsWith("[") && text.endsWith("]")) {
      const inner = text.slice(1, -1);
      const capitalizedInner = utilsLib.capitalize(inner);
      return `[${capitalizedInner}]`;
    }

    //"testString" => "Test String"
    if (/[a-z][A-Z]/.test(text)) {
      const spaced = text.replace(/([a-z])([A-Z])/g, "$1 $2");
      const capitalizedCamel = utilsLib.capitalize(spaced);
      return capitalizedCamel;
    }

    //"test string" => "Test string"
    const capitalizedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    return capitalizedText;
  };

  //[Add s to word if needed]
  utilsLib.endPlural = (text, amount) => {
    if (!text) return "";

    const last = text.charAt(text.length - 1);
    if (amount === 1) {
      if (last === "s") return text.slice(0, -1);
      return text;
    }
    if (last === "s") return text;
    return text + "s";
  };

  //[Create initials from text]
  utilsLib.getInitials = (text) => {
    if (!text) return "";

    //"string" => "S"
    //"test string" => "TS"
    //"test_string 1" => "TS1"
    //"test-string_1" => "TS1"
    //"test1String2" => "T1S2"
    const parts = text.split(/[\s_-]+/); //split on snake_case, kebab-case and spaces
    const subParts = parts.map((part) => part.match(/[A-Z]?[a-z]+|[A-Z]+|[0-9]+/g) || []).flat(); //split camelCase and numbers
    const initials = subParts.filter(Boolean).map((word) => word[0].toUpperCase()); //capitalize first letters
    return initials.join("");
  };

  //[Color text for chalk]
  utilsLib.colorMsg = (msg, color = "red") => {
    if (!chalk[color]) utilsLib.throwError(__filename, `Invalid color "${color}"`);
    const consoleMsg = chalk[color](msg);
    return consoleMsg; //terminal colors
  };
  //[Color text for discord]
  utilsLib.colorDiscMsg = (msg, color = "red") => {
    const consoleMsg = utilsLib.colorMsg(msg, color);
    const discordMsg = consoleMsg
      .replace(/\x1B\[(\d+)m/g, (_, code) => `\u001b[2;${code}m`)
      .replaceAll("\u001b[2;92m", "\u001b[2;32m"); //Discord has "yellowish green" instead of "brightGreen"
    return discordMsg; //discord colors
  };
  //[Color text for chalk AND discord]
  utilsLib.dualColorMsg = (msg, color = "red") => {
    return {
      consoleMsg: utilsLib.colorMsg(msg, color),
      discordMsg: utilsLib.colorDiscMsg(msg, color),
    };
  };

  //[Wrap in a code block]
  utilsLib.codeBlock = (msg, code = "") => `\`\`\`${code}\n${msg}\n\`\`\``;
  utilsLib.ansiBlock = (msg) => utilsLib.codeBlock(msg, "ansi");
};
 