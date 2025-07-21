import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No token found in header");
    return res.status(401).json({ message: "No token, access denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("✅ Decoded Token:", decoded); 
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ User not found with this token");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    // console.log("✅ Authenticated User:", req.user._id);

    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default protect;
