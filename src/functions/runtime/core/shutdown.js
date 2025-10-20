//[Import stuff]
const { mongoose } = require("mongoose");

module.exports = ({ runtimeLib }) => {
  //[Safely close mongoose]
  runtimeLib.closeMongoose = async () => {
    try {
      if (mongoose.connection?.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (error) {
      console.error(error);
    }
  };
};
