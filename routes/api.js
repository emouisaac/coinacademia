const express = require('express');
const router = express.Router();

// Example: API test route
router.get('/test', (req, res) => {
  res.json({ message: 'API route working!' });
});

module.exports = router;
