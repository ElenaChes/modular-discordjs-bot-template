module.exports = ({ utilsLib }) => {
  //[Allow string and enum styles]
  utilsLib.fetchFromEnum = (optionsEnum, option) => {
    if (optionsEnum[option]) return optionsEnum[option];
    const stylesList = Object.values(optionsEnum);
    if (stylesList.includes(option)) return option;
    return null;
  };

  //[Get member username color]
  utilsLib.getMemberColor = (member) => {
    if (!member) return "#ffffff"; //fallback
    const color = member.displayHexColor;
    return color && color !== "#000000" ? color : "#ffffff";
  };
};
