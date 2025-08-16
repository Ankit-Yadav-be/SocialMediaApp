import User from "../models/userModel.js";
import cache from "../utils/cache.js";

// GET user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id.trim();

    // 1. Cache check
    const cachedUser = cache.get(userId);
    if (cachedUser) {
      return res.json({ fromCache: true, ...cachedUser });
    }

    // 2. Agar cache me nahi to DB se fetch
    const user = await User.findById(userId)
      .select("-password")
      .populate("followers", "name email bio followers following profilePic")
      .populate("following", "name email bio followers following profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Cache me set karo
    cache.set(userId, user);

    res.json({ fromCache: false, ...user._doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsersProfile = async (req, res) => {
  try {
    console.log(req.user._id);
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("followers", "name profilePic") // Optional: if you want followers' details
      .populate("following", "name profilePic"); // Optional: if you want following details

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Users (excluding passwords)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Internal Server Error" });
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

    if (!targetUser || !currentUser)
      return res.status(404).json({ message: "User not found" });

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

    if (!targetUser || !currentUser)
      return res.status(404).json({ message: "User not found" });

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== userId.toString()
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetId.toString()
    );

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
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name username profilePic"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET following
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name username profilePic"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const updateProfile = async (req, res) => {
  const userId = req.user.id; // from auth middleware
  const { name, username, email, bio, profilePic } = req.body;

  try {
    // Check for username/email conflict if changed
    const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Update allowed fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          username,
          email,
          bio,
          profilePic,
        },
      },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: "Server error while updating profile" });
  }
};
