//[Imports]
const { Schema, model } = require("mongoose"); //database access

//[Schema]
module.exports = ({}) => {
  const nameSchema = new Schema(
    {
      //schema fields...
    },
    { versionKey: false }
  );

  //[Register in database]
  model("Name", nameSchema);
};
