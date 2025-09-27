
const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'coinacademia';
let db, affiliatesCollection;

MongoClient.connect(MONGO_URL)
  .then(client => {
    db = client.db(DB_NAME);
    affiliatesCollection = db.collection('affiliates');
    console.log('Connected to MongoDB for affiliates');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });


// Register affiliate
router.post('/register', async (req, res) => {
  const { username } = req.body;
  if (!affiliatesCollection) return res.status(500).json({ message: 'DB not ready' });
  const existing = await affiliatesCollection.findOne({ username });
  if (existing) {
    return res.status(400).json({ message: 'Affiliate already exists' });
  }
  await affiliatesCollection.insertOne({ username, referrals: 0, commission: 0, pendingPayout: 0, referralsList: [], payouts: [] });
  res.json({ message: 'Affiliate registered' });
});


// Get affiliate dashboard

// Get affiliate dashboard
router.get('/dashboard', async (req, res) => {
  const { username } = req.query;
  if (!affiliatesCollection) return res.status(500).json({ message: 'DB not ready' });
  const affiliate = await affiliatesCollection.findOne({ username });
  if (!affiliate) {
    return res.status(404).json({ message: 'Affiliate not found' });
  }
  res.json(affiliate);
});

// Get referrals list for affiliate
router.get('/referrals', async (req, res) => {
  const { username } = req.query;
  if (!affiliatesCollection) return res.status(500).json({ message: 'DB not ready' });
  const affiliate = await affiliatesCollection.findOne({ username });
  if (!affiliate) {
    return res.status(404).json({ message: 'Affiliate not found' });
  }
  res.json({ referrals: affiliate.referralsList || [] });
});


// Add referral (simulate)

// Add referral (simulate)
router.post('/referral', async (req, res) => {
  const { username, referralName, paid } = req.body;
  if (!affiliatesCollection) return res.status(500).json({ message: 'DB not ready' });
  const affiliate = await affiliatesCollection.findOne({ username });
  if (!affiliate) {
    return res.status(404).json({ message: 'Affiliate not found' });
  }
  const joinDate = new Date().toISOString().split('T')[0];
  const status = paid ? 'Active' : 'Inactive';
  const commission = paid ? 10 : 0;
  const newReferral = {
    name: referralName,
    joinDate,
    status,
    commission
  };
  await affiliatesCollection.updateOne(
    { username },
    {
      $inc: { referrals: 1, commission },
      $push: { referralsList: newReferral }
    }
  );
  const updated = await affiliatesCollection.findOne({ username });
  res.json({ message: 'Referral added', affiliate: updated });
});

// Add payout (simulate)
router.post('/payout', async (req, res) => {
  const { username, amount } = req.body;
  if (!affiliatesCollection) return res.status(500).json({ message: 'DB not ready' });
  const affiliate = await affiliatesCollection.findOne({ username });
  if (!affiliate) {
    return res.status(404).json({ message: 'Affiliate not found' });
  }
  // Validate amount
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid withdrawal amount.' });
  }
  if ((affiliate.pendingPayout || 0) < amount) {
    return res.status(400).json({ message: 'Insufficient funds for withdrawal.' });
  }
  // Minimum withdrawal amount (e.g. $10)
  if (amount < 10) {
    return res.status(400).json({ message: 'Minimum withdrawal is $10.' });
  }
  const payoutDate = new Date().toISOString().split('T')[0];
  const payout = {
    date: payoutDate,
    amount,
    status: 'Pending'
  };
  await affiliatesCollection.updateOne(
    { username },
    {
      $push: { payouts: payout },
      $inc: { pendingPayout: -amount }
    }
  );
  const updated = await affiliatesCollection.findOne({ username });
  res.json({ message: 'Withdrawal request submitted.', affiliate: updated });
});

// Get payout history for affiliate
router.get('/payouts', async (req, res) => {
  const { username } = req.query;
  if (!affiliatesCollection) return res.status(500).json({ message: 'DB not ready' });
  const affiliate = await affiliatesCollection.findOne({ username });
  if (!affiliate) {
    return res.status(404).json({ message: 'Affiliate not found' });
  }
  res.json({ payouts: affiliate.payouts || [] });
});

module.exports = router;
