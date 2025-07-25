import express from "express";
import {
  addComment,
  createPost,
  getAllPosts,
  getAllPostsByPostId,
  getFeedPosts,
  getShareCount,
  likeOrUnlikePost,
  sharePost,
} from "../controllers/postController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/feed", protect, getFeedPosts);
router.put("/like/:id", protect, likeOrUnlikePost);
router.put("/share/:id", protect, sharePost);
router.get("/allPostbyPostId/:id", getAllPostsByPostId);
router.put("/comment/:id", protect, addComment);
router.get("/getpost/:id", getAllPosts);
router.get("/share-count/:id", getShareCount);

export default router;
