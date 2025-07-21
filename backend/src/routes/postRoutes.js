import express from "express";
import { addComment, createPost, getFeedPosts, likeOrUnlikePost } from "../controllers/postController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/feed", protect, getFeedPosts);
router.put("/like/:id", protect, likeOrUnlikePost);
router.put("/comment/:id", protect, addComment);
router.get("/getpost/:id", getAllPosts);

export default router;
