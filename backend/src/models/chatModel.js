// models/Chat.js
import mongoose from "mongoose"

const chatSchema = new mongoose.Schema({
  isGroupChat: { type: Boolean, default: false },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  chatName: { type: String },
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
