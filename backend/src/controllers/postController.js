import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import createNotification from "../utils/notification.js";
dotenv.config();

// create post
export const createPost = async (req, res) => {
  const { caption, image, music } = req.body;

  try {
    if (!image) return res.status(400).json({ message: "Image is required" });

    const newPost = await Post.create({
      user: req.user._id,
      image: image,
      caption,
      music
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get feed
export const getFeedPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followedUsers = currentUser.following;
    const allUsersToFetch = [...followedUsers, req.user._id];

    const posts = await Post.find({ user: { $in: allUsersToFetch } })
      .sort({ createdAt: -1 })
      .populate("user", "name email profilePic") // Post author
      .populate("comments.user", "name email profilePic") // Comment authors
      .populate("likes", "name email profilePic")
      .populate("music", "url title")
      ; // Users who liked the post

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// like or unlike post

export const likeOrUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;

    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like
      post.likes.push(userId);
      await createNotification({
        recipient: post.user,
        sender: userId,
        type: "like",
        post: postId,
      });
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// comment on post

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: req.user._id,
      text,
      createdAt: new Date(),
    };
    const userId = req.user._id;
    post.comments.push(newComment);
    await createNotification({
      recipient: post.user,
      sender: userId,
      type: "comment",
      post: postId,
    });

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/postController.js

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id }) // ✅ Find all posts of that user
      .populate("user", "name email profilePic")
      .populate("likes", "name email profilePic")
      .populate("comments.user", "name email profilePic")
      .populate("music", "url title")
      .sort({ createdAt: -1 }); // Latest first

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts", error });
  }
};

export const getAllPostsByPostId = async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id)
      .populate("user", "name email profilePic")
      .populate("likes", "name email profilePic")
      .populate("comments.user", "name email profilePic")
      .sort({ createdAt: -1 }); // Latest first

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts", error });
  }
};

// POST /api/posts/share/:postId
export const sharePost = async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost)
      return res.status(404).json({ message: "Post not found" });
    console.log(req.body.shareText);
    const newPost = await Post.create({
      user: req.user._id, // assuming you're using protect middleware
      image: originalPost.image,
      caption: originalPost.caption, // optional
      sharedFrom: originalPost._id,
      shareText: req.body.shareText || "",
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/postController.js
export const getShareCount = async (req, res) => {
  try {
    const count = await Post.countDocuments({ sharedFrom: req.params.id });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
