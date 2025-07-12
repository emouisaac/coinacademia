// main.js - Handles Coinbase Commerce checkout from frontend

document.getElementById('buyBtn').onclick = async function() {
  const statusDiv = document.getElementById('error');
  statusDiv.textContent = '';
  try {
    // Call backend to create a Coinbase Commerce checkout
    const res = await fetch('/api/create-checkout', { method: 'POST' });
    const data = await res.json();
    if (data.hosted_url) {
      // Redirect user to Coinbase Commerce checkout page
      window.location.href = data.hosted_url;
    } else {
      statusDiv.textContent = 'Failed to start payment.';
    }
  } catch (e) {
    statusDiv.textContent = 'Error: ' + e.message;
  }
};
