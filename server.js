const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');

const authRoutes = require('./back/auth');
const paymentRoutes = require('./back/payment');
const affiliateRoutes = require('./back/affiliate');


const app = express();
// Parse JSON and urlencoded bodies BEFORE any routes or middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const axios = require('axios');
require('dotenv').config();

const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'https://www.coinacademia.in'],
  credentials: true
}));

// Real integration for /api/create-checkout
app.post('/api/create-checkout', async (req, res) => {
  try {
    const response = await axios.post('https://api.nowpayments.io/v1/invoice', {
      price_amount: req.body.price_amount,
      price_currency: req.body.price_currency,
      order_id: req.body.order_id,
      order_description: req.body.order_description,
      success_url: req.body.success_url,
      cancel_url: req.body.cancel_url
    }, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    res.json({ hosted_url: response.data.invoice_url });
  } catch (error) {
    console.error('NOWPayments API error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Payment creation failed', details: error.message, np_response: error.response ? error.response.data : null });
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes);
app.use('/affiliate', affiliateRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
