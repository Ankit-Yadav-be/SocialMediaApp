// models/Notification.js
import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["like", "comment", "follow"],
    required: true
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // optional
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
