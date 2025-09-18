
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registration route
router.post('/register', async (req, res) => {
	const { username, email, password, fullname, referralCode, referralLink } = req.body;
	if (!username || !email || !password) {
		return res.status(400).json({ error: 'All fields are required.' });
	}
	try {
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		if (existingUser) {
			return res.status(409).json({ error: 'User already exists.' });
		}
		const user = new User({ username, email, password, fullname, referralCode, referralLink });
		await user.save();
		res.status(201).json({ message: 'Registered successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Server error.' });
	}
});

// Login route
router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password required.' });
	}
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials.' });
		}
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ error: 'Invalid credentials.' });
		}
		// Issue JWT
		const token = jwt.sign(
			{ id: user._id, username: user.username, email: user.email },
			process.env.JWT_SECRET || 'your_jwt_secret',
			{ expiresIn: '7d' }
		);
	res.json({ success: true, token, user: { username: user.username, email: user.email, fullname: user.fullname, referralCode: user.referralCode, referralLink: user.referralLink } });
	} catch (err) {
		res.status(500).json({ error: 'Server error.' });
	}
});

module.exports = router;
