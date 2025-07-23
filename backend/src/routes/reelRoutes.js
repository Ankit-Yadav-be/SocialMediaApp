// routes/reelRoutes.js
import express from "express";
import { createReel, getAllReels } from "../controllers/reelController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReel);
router.get("/", protect, getAllReels);

export default router;
