import User from "../models/userModel.js"

// GET user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id.trim()).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FOLLOW user
export const followUser = async (req, res) => {
  const userId = req.user._id;
  const targetId = req.params.id.trim();

  if (userId.toString() === targetId) {
    return res.status(400).json({ message: "You can't follow yourself" });
  }

  try {
    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser) return res.status(404).json({ message: "User not found" });

    if (targetUser.followers.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    targetUser.followers.push(userId);
    currentUser.following.push(targetId);

    await targetUser.save();
    await currentUser.save();

    res.json({ message: "User followed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UNFOLLOW user
export const unfollowUser = async (req, res) => {
  const userId = req.user._id;
  const targetId = req.params.id;

  if (userId.toString() === targetId) {
    return res.status(400).json({ message: "You can't unfollow yourself" });
  }

  try {
    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser) return res.status(404).json({ message: "User not found" });

    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId.toString());
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetId.toString());

    await targetUser.save();
    await currentUser.save();

    res.json({ message: "User unfollowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET followers
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name username profilePic');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET following
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name username profilePic');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
