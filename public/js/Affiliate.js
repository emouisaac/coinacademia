// Affiliate.js - Handles referral and profile data display

document.addEventListener('DOMContentLoaded', function() {
  // Fetch user profile and referral data from backend
  fetch('/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.user) {
        const user = data.user;
        document.querySelector('.user-name').textContent = user.fullname || user.username || '';
        document.querySelector('.user-email').textContent = user.email || '';
        document.querySelector('.user-username').textContent = user.username || '';
        document.getElementById('ref-code').textContent = user.referralCode || '';
        document.getElementById('ref-link-input').value = user.referralLink || '';
        document.querySelector('.profile-card').style.display = 'block';
      } else {
        document.querySelector('.profile-card').style.display = 'none';
      }
    })
    .catch(() => {
      document.querySelector('.profile-card').style.display = 'none';
    });
});

function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text);
}

function copyReferralLink() {
  const input = document.getElementById('ref-link-input');
  input.select();
  document.execCommand('copy');
}



// Payment button login check for affiliate page
setTimeout(() => {
    const paymentSelectors = [
      'a[href*="payments/pay.html"]',
      'button.enroll-btn',
      'button.pay-btn',
      'button.payment-btn',
      'button.buy-btn',
      'button.purchase-btn',
      'button.cta-btn'
    ];
    paymentSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(btn => {
        btn.addEventListener('click', function(e) {
          const userName = localStorage.getItem('loggedInUser');
          if (!userName) {
            e.preventDefault();
            showLoginPopup();
          }
        });
      });
    });
}, 500);
// Popup notification for login (same as main dashboard)
function showLoginPopup() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.4)';
  overlay.style.zIndex = 9999;

  // Create popup box
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#fff';
  popup.style.padding = '32px 24px';
  popup.style.borderRadius = '12px';
  popup.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
  popup.style.textAlign = 'center';
  popup.innerHTML = '<h3>Please log in to access your dashboard.</h3><p style="margin:12px 0 0 0;color:#d9534f;font-size:15px;">Make sure you are logged in before making any payment.</p><button id="login-popup-btn" style="margin-top:16px;padding:8px 24px;background:#3a8ee6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px;">Log In</button>';

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  document.getElementById('login-popup-btn').onclick = function() {
    overlay.remove();
    document.getElementById('login-btn').click();
  };
  // Remove popup if overlay is clicked
  overlay.onclick = function(e) {
    if (e.target === overlay) overlay.remove();
  };
  // Redirect to index.html and open login/registration form
  window.location.href = 'index.html#login';
};