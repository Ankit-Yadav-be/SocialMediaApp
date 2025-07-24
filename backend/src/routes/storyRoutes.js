// routes/storyRoutes.js
import express from "express";
const router = express.Router();
import {
  createStory,
  getAllStories,
  likeStory,
  commentOnStory,
} from "../controllers/storyController.js";
import protect from "../middlewares/authMiddleware.js";

router.post("/", protect, createStory);
router.get("/", protect, getAllStories);
router.post("/:id/like", protect, likeStory);
router.post("/:id/comment", protect, commentOnStory);

export default router;
