//[Access to database]
const mongoose = require("mongoose");
const Example = mongoose.model("Example");

module.exports = ({ client, utilsLib, runtimeLib, info }) => {
  //[Find this bot's Example document by field]
  runtimeLib.findExampleByField = async (field) => {
    return await Example.findOne({ botID: client.user.id, field });
  };

  //[Find this bot's Examples]
  runtimeLib.findAllExamples = async () => {
    return await Example.find({ botID: client.user.id });
  };

  //[Create new Example]
  runtimeLib.createExample = async (field1, field2, optionalField = undefined) => {
    const exampleData = { botID: client.user.id, field1, field2 };
    if (optionalField) exampleData.optionalField = optionalField;
    return await Example.create(exampleData);
  };

  //[Update fields in Example]
  runtimeLib.updateBotExample = async (update) => {
    return await Example.updateOne({ botID: client.user.id }, update);
  };

  //[Delete Example]
  runtimeLib.deleteExampleByField = async ({ uniqueField, exampleObject }) => {
    if (!uniqueField && !exampleObject) {
      return utilsLib.warn("deleteExampleByField", "Didn't receive a uniqueField nor a exampleObject.");
    }
    //delete via object
    if (exampleObject) {
      await exampleObject.delete();
    }
    //delete via field
    else if (uniqueField) {
      await Example.deleteOne({ botID: client.user.id, field: uniqueField });
    }
  };

  //[Delete Examples that contain the field]
  runtimeLib.deleteExamplesWithField = async (field) => {
    await Example.deleteMany({ botID: client.user.id, field });
  };
};
