//[Access to database]
const mongoose = require("mongoose");
const Access = mongoose.model("Access");

module.exports = (context) => {
  const { utilsLib, runtimeLib, info } = context;
  //[Load access information into "info"]
  runtimeLib.loadAccess = async () => {
    const { appLoaded, load } = context;
    const start = new Date();
    if (!appLoaded && load) await load.dbReady; //wait for handler
    const actual = new Date();
    const success = await loadAccessFields();

    //[Bot loading]
    if (!appLoaded && load) {
      load.accessResult = success ? "✓" : "x"; //to display later
      utilsLib.logTime("Access", "Handler", start, actual);
    }
    //[Bot already online]
    else {
      if (!success) return null;
      return utilsLib.timeDiff(start);
    }
  };

  //[Load links and IDs from database]
  async function loadAccessFields() {
    let item = await Access.findOne({}, { _id: 0, __v: 0 });
    if (!item) return "x";
    const copyModes = getCopyModes();
    try {
      for (const [label, field] of Object.entries(item.toObject())) {
        loadFieldsPattern(label, field, copyModes[label]);
      }
      return true;
    } catch (error) {
      await runtimeLib.handleError(error, __filename);
      return false;
    }
  }
  //[Fields' copy modes]
  function getCopyModes() {
    return Object.fromEntries(
      Object.entries(Access.schema.paths)
        .filter(([_, schemaType]) => schemaType.options.copyMode)
        .map(([path, schemaType]) => [path, schemaType.options.copyMode])
    );
  }
  //[Load contents of a single field]
  function loadFieldsPattern(label, field, copyMode) {
    switch (copyMode) {
      //field: { label: "label", value: any } -> info.label = any
      case "direct":
        if (label === "IDs") {
          utilsLib.refreshRoleMap(field);
        }
        for (const entry of field) info[entry.label] = entry.value;
        return;

      //field: any -> info.field = any
      case "keep":
        info[label] = field.map((item) => ({
          name: item.name,
          value: item.value,
          extended: item.extended || null,
        }));
        return;

      //field: { label: "label", value: any } -> info.field.label = any
      default:
        info[label] = Object.fromEntries(field.map((item) => [item.label, item.value]));
        return;
    }
  }
};
