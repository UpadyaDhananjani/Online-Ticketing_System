// import jwt from "jsonwebtoken";
// import userModel from "../models/userModel.js";


const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token; // Read token from cookie
  console.log("Token from cookie:", token);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();

    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
     console.log("Token verification failed:", err.message)
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;

