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

    let updated = false;
    // Auto-generate referralCode if missing
    if (!user.referralCode) {
      user.referralCode = (user.username || user._id.toString()).slice(0, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
      updated = true;
    }
    // Auto-generate referralLink if missing
    if (!user.referralLink) {
      // You can customize the base URL as needed
      const baseUrl = req.protocol + '://' + req.get('host');
      user.referralLink = `${baseUrl}/register?ref=${user.referralCode}`;
      updated = true;
    }
    if (updated) {
      await user.save();
    }

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
