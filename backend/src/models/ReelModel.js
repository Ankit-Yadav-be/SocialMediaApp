// models/Reel.js
import mongoose from "mongoose";

const reelCommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const reelSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    video: { type: String, required: true }, // Cloudinary video URL
    caption: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [reelCommentSchema],
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reel",
      default: null,
    },
    shareText: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Reel", reelSchema);
