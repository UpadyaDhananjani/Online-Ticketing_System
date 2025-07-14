import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    // Use authenticated user ID from token (more secure approach)
    const userId = req.user._id;

    const user = await userModel.findById(userId).select('-password -verifyOtp -resetOtp');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.json({
      success: true,
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        unit: user.unit, // <-- Add unit here
        isAccountVerified: user.isAccountVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getUsersByUnit = async (req, res) => {
  try {
    const { unit } = req.params;
    const users = await userModel.find({ unit }).select('_id name email');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
