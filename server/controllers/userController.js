import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ Extracted from verified token

        const user = await userModel.findById(userId).select('-password -verifyOtp -resetOtp');

        
    const user = await userModel.findById(userId).select('-password -verifyOtp -resetOtp');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
