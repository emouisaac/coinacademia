// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, './'))); // Serves files from paytest/

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Parse JSON bodies for API
app.use(express.json());

// Parse raw body for webhook verification
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Endpoint to create a Coinbase Commerce checkout
app.post('/api/create-checkout', async (req, res) => {
  try {
    // Create a charge for the discounted course
    const response = await axios.post(
      'https://api.commerce.coinbase.com/charges',
      {
        name: 'STARTER PARK',
        description: 'Crypto course package at 10% off! (Original: $100, Now: $90)',
        pricing_type: 'fixed_price',
        local_price: { amount: '90.00', currency: 'USD' },
        redirect_url: `${process.env.DOMAIN_URL || 'http://localhost:' + PORT}/course-unlocked.html`,
        cancel_url: `${process.env.DOMAIN_URL || 'http://localhost:' + PORT}/index.html`
      },
      {
        headers: {
          'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY,
          'X-CC-Version': '2018-03-22',
          'Content-Type': 'application/json'
        }
      }
    );
    // Respond with the Coinbase hosted checkout URL
    res.json({ hosted_url: response.data.data.hosted_url });
  } catch (err) {
    // Log and return error
    console.error('Error creating checkout:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

// Webhook endpoint to verify payment status
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-cc-webhook-signature'];
  const payload = req.body;

  // Verify webhook signature using your Coinbase Commerce webhook secret
  const computedSignature = crypto
    .createHmac('sha256', process.env.COINBASE_COMMERCE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== computedSignature) {
    // Invalid signature, possible spoofed request
    console.warn('Invalid webhook signature');
    return res.status(400).send('Invalid signature');
  }

  const event = JSON.parse(payload);

  // Check if payment is confirmed and for the correct amount
  if (
    event.type === 'charge:confirmed' &&
    event.data &&
    event.data.pricing &&
    event.data.pricing.local.amount === '90.00'
  ) {
    // Grant access to course (e.g., update DB, send email, etc.)
    // For demo, just log success
    console.log('Payment confirmed for STARTER PARK! Access granted.');
    // You could trigger an email or database update here
  }

  res.status(200).send('Webhook received');
});

// Security tip: In production, restrict webhook endpoint to Coinbase IPs or use a secret path
// Security tip: Never expose your API keys or webhook secret in frontend code or public repos

// Simple homepage route (optional)
app.get('/api/health', (req, res) => {
  res.send('🚀 Server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
