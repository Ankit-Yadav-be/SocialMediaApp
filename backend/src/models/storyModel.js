import mongoose from "mongoose";

// 🔸 Comment Schema
const storyCommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 🔸 Story Schema
const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    media: {
      type: String, // Cloudinary URL
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    music: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Music", // 👈 reference to Music model
      default: null,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    comments: [storyCommentSchema],

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    expiresAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
