
import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, required: true },
    caption: { type: String, default: "" },
    music: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Music",
      default: null,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    shareText: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);