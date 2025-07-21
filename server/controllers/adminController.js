//adminController.jsx


import userModel from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    // Only allow admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only." });
    }
    const { unit } = req.query;
    const filter = unit ? { unit } : {};
    const users = await userModel.find(filter).select('_id name email unit');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only." });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }
    const deleted = await userModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};