import mongoose from "mongoose";

async function connectToDb() {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/notes");
    console.log("[MongoDb]: Connected to DB");
  } catch (e) {
    process.exit(1);
  }
}

export default connectToDb;
