//[Access to database]
const { Schema, model } = require("mongoose");

//[Shared field templates]
const labeledField = (type, required = true) => ({
  //will be used in runtime as { label: value }
  label: { type: String, required },
  value: { type, required },
  _id: false,
});
/* copyMode:
  how the field will be handled | enum: ["direct", "keep", "copy"]

    [direct]
  field: { label: "label", value: any } -> info.label = any

    [keep]
  field: any -> info.field = any

    [copy] (default)
  field: { label: "label", value: any } -> info.field.label = any
*/

//[Schema]
module.exports = ({}) => {
  const accessSchema = new Schema(
    {
      IDs: {
        type: [labeledField(String)],
        roles: [String], //"owner", "home", etc
        idType: { type: String, required: true, default: "other", enum: ["user", "guild", "other"] },
        copyMode: "direct",
      },
      Aliases: [labeledField(String)],
      //...more values the bot needs (except api keys and passwords!)
    },
    { versionKey: false }
  );

  //[Register in database]
  model("Access", accessSchema, "access");
};
