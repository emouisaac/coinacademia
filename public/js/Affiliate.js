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
