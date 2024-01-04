import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  // owner: { type: String, require: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sharedWith: [{ type: String }],
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
