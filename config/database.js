const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb+srv://vaibhavrathorema:ol4mrfmda0tQs4Wi@saburitea.esqjo.mongodb.net/sabur-local", {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log(" connected to Mongoose database.");
  } catch (error) {
    console.error("Unable to connect to MongoDB Database", error);
  }
};

// export database
module.exports = connectDb