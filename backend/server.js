import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import  dbConnect  from "./src/config/dbConnection.js"
import authRoutes from "./src/routes/authRoutes.js"
import userRoutes from "./src/routes/userRoutes.js"
import postRoutes from "./src/routes/postRoutes.js"
import notificationRoutes from "./src/routes/notificationRoutes.js"
import reelsRoutes from "./src/routes/reelRoutes.js"
import musicRoutes from "./src/routes/musicRoutes.js"
const app = express()

dotenv.config();
app.use(cors())
app.use(express.json());

dbConnect();

app.get('/',(req,res)=>{
   res.send("API Running...")
})

app.use("/api/auth", authRoutes)
app.use("/api/users",userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reels", reelsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/music",musicRoutes);

export default app;

