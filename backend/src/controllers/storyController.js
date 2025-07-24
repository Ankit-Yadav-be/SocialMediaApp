import Story from "../models/storyModel.js";

// ✅ 1. Create a new story
export const createStory = async (req, res) => {
  const { media, mediaType, caption, musicId } = req.body;
  const userId = req.user._id;

  if (!media || !mediaType) {
    return res.status(400).json({ message: "Media and mediaType are required" });
  }

  try {
    const story = await Story.create({
      user: userId,
      media,
      mediaType,
      caption,
      music: musicId || null,
    });

    res.status(201).json({ story });
  } catch (error) {
    res.status(500).json({ message: "Failed to create story", error: error.message });
  }
};




// ✅ 2. Get all active stories (not expired)
export const getAllStories = async (req, res) => {
  const stories = await Story.find({ expiresAt: { $gt: Date.now() } })
    .populate("user", "name profilePic")
    .populate("music", "title url")
    .sort({ createdAt: -1 });

  res.status(200).json(stories);
};

// ✅ 3. Like / Unlike a story
export const likeStory = async (req, res) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    return res.status(404).json({ message: "Story not found" });
  }

  const userId = req.user._id;

  if (story.likes.includes(userId)) {
    // Already liked → remove like
    story.likes.pull(userId);
  } else {
    // Not liked yet → add like
    story.likes.push(userId);
  }

  await story.save();
  res.status(200).json({ likes: story.likes });
};

// ✅ 4. Add comment to a story
export const commentOnStory = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  const story = await Story.findById(req.params.id);
  if (!story) {
    return res.status(404).json({ message: "Story not found" });
  }

  const comment = {
    user: req.user._id,
    text,
  };

  story.comments.push(comment);
  await story.save();

  res.status(201).json(story.comments);
};
