// Affiliate.js - Handles referral and profile data display

document.addEventListener('DOMContentLoaded', function() {
  // Retrieve referral and profile data from localStorage
  const userName = localStorage.getItem('loggedInUser') || '';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userUsername = localStorage.getItem('userUsername') || '';
  const referralCode = localStorage.getItem('referralCode') || '';
  const referralLink = localStorage.getItem('referralLink') || '';

  // Display profile data
  document.querySelector('.user-name').textContent = userName;
  document.querySelector('.user-email').textContent = userEmail;
  document.querySelector('.user-username').textContent = userUsername;

  // Display referral code and link
  document.getElementById('ref-code').textContent = referralCode;
  document.getElementById('ref-link-input').value = referralLink;

  // Optionally, add logic to hide/show sections based on login status
  if (!userName) {
    document.querySelector('.profile-card').style.display = 'none';
  } else {
    document.querySelector('.profile-card').style.display = 'block';
  }
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
