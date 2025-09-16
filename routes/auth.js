const express = require('express');
const router = express.Router();

// Dummy user for demonstration (replace with DB lookup in production)
const users = [
	{ email: 'user@example.com', password: 'password123' }
];

// Password login route
router.post('/login', (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password required.' });
	}
	const user = users.find(u => u.email === email && u.password === password);
	if (user) {
		// In production, issue JWT or session
		return res.json({ success: true, message: 'Login successful.' });
	} else {
		return res.status(401).json({ error: 'Invalid credentials.' });
	}
});

module.exports = router;
