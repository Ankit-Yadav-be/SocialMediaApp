// routes/musicRoutes.js
import express from "express";
import { uploadMusic, getAllMusic } from "../controllers/musicController.js";
import protect from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/upload", protect, uploadMusic); // only admin if needed
router.get("/", getAllMusic);

export default router;
