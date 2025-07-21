import express from "express";
const router = express.Router();
import protect from "../middlewares/authMiddleware.js";
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getAllUsersProfile,
} from "../controllers/userController.js";

router.get("/:id", protect, getUserProfile);
router.get("/allUsers", protect , getAllUsersProfile);
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);
router.get("/:id/followers", protect, getFollowers);
router.get("/:id/following", protect, getFollowing);

export default router;
