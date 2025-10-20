//[Access to database]
const { Schema, model } = require("mongoose");

//[Shared field templates]
const requiredField = (type) => ({ type, required: true });

//[Schema]
module.exports = ({}) => {
  const profileSchema = new Schema(
    {
      botID: { ...requiredField(String), unique: true },
      botLabel: requiredField(String), //"test", "main", etc

      presence: {
        activity: requiredField(String),
        activityType: requiredField(Number),
        status: { ...requiredField(String), enum: ["online", "idle", "dnd", "invisible"] },
        _id: false,
      },
      loginTime: { ...requiredField(Date), default: Date.now() },
      loadCommandsTime: Date, //last time commands were refreshed

      extraRole: String, //"extra" role for command permissions
      logChannel: String, //Discord channel ID
    },
    { versionKey: false }
  );

  //[Register in database]
  model("Profile", profileSchema);
};
