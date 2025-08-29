import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    console.log('Admin user making request:', req.user);
    console.log('Token from request:', req.headers.authorization);
    
    const query = req.query.unit ? { unit: req.query.unit } : {};
    console.log('Database query:', query);
    
    const users = await User.find(query).select('-password');
    console.log('Found users data:', JSON.stringify(users, null, 2));
    console.log('Found users count:', users.length);
    
    if (users.length === 0) {
      // Check if there are any users in the database at all
      const totalCount = await User.countDocuments();
      console.log('Total users in database:', totalCount);
      
      // Let's see what users we have in the database
      const allUsers = await User.find({}).select('email role unit');
      console.log('All users in database:', JSON.stringify(allUsers, null, 2));
    }
    
    // Send response in a consistent format
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error fetching users',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;