// models/Music.js
import mongoose from "mongoose";

const musicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true }, // Cloudinary or any CDN link
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional: admin id
  },
  { timestamps: true }
);

export default mongoose.model("Music", musicSchema);
