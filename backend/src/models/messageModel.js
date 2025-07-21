// models/Message.js
import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
