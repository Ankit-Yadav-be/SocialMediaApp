import Reel from "../models/ReelModel.js";

// Create a new reel
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

// Get all reels
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

// Like/Unlike a reel
export const toggleLikeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    const userId = req.user._id;
    const isLiked = reel.likes.includes(userId);

    if (isLiked) {
      reel.likes.pull(userId);
    } else {
      reel.likes.push(userId);
    }

    await reel.save();
    res.json({ message: isLiked ? "Reel unliked" : "Reel liked" });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

// Add comment to reel
export const addCommentToReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    const comment = {
      user: req.user._id,
      text: req.body.text,
    };

    reel.comments.push(comment);
    await reel.save();

    res.status(201).json({ message: "Comment added" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Share a reel
export const shareReel = async (req, res) => {
  try {
    const originalReel = await Reel.findById(req.params.id);
    if (!originalReel) return res.status(404).json({ message: "Original reel not found" });

    const newReel = await Reel.create({
      user: req.user._id,
      video: originalReel.video,
      sharedFrom: originalReel._id,
      shareText: req.body.shareText || "",
    });

    res.status(201).json({ message: "Reel shared successfully", reel: newReel });
  } catch (error) {
    res.status(500).json({ message: "Failed to share reel" });
  }
};
