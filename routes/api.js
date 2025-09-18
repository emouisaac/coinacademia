const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token provided.' });
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', async (err, decoded) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid token.' });
    req.userId = decoded.id;
    next();
  });
}

router.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    res.json({ success: true, user: {
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      referralCode: user.referralCode,
      referralLink: user.referralLink
    }});
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// Example: API test route
router.get('/test', (req, res) => {
  res.json({ message: 'API route working!' });
});

module.exports = router;
