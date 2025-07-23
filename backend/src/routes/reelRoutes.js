// routes/reelRoutes.js
import express from "express";
import { addCommentToReel, createReel, getAllReels, shareReel, toggleLikeReel } from "../controllers/reelController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReel);
router.get("/", protect, getAllReels);
router.put("/:id/like", protect, toggleLikeReel);
router.post("/:id/comment", protect, addCommentToReel);
router.post("/:id/share", protect, shareReel);
export default router;
