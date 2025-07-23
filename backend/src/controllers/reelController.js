// controllers/reelController.js
import Reel from "../models/ReelModel.js";

export const createReel = async (req, res) => {
  try {
    const { video, caption } = req.body;
    const reel = await Reel.create({
      user: req.user._id,
      video,
      caption,
    });
    res.status(201).json(reel);
  } catch (error) {
    console.error("Error creating reel:", error);
    res.status(500).json({ message: "Failed to create reel" });
  }
};

export const getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate("user", "name email profilePic")
      .populate("comments.user", "name profilePic")
      .sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ message: "Failed to get reels" });
  }
};
