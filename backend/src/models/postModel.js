import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, required: true },
    caption: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema], // Embedded comments
    sharedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null }, 
    shareText: { type: String, default: "" }, 
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
