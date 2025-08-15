import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./src/config/dbConnection.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import reelsRoutes from "./src/routes/reelRoutes.js";
import musicRoutes from "./src/routes/musicRoutes.js";
import storyRoutes from "./src/routes/storyRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import  compression  from "compression";
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(compression())
dbConnect();

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reels", reelsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/ai", aiRoutes);
export default app;
