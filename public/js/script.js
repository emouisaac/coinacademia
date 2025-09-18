/**
 * Cryptocurrency Market Dashboard
 * Displays:
 * - Scrolling ticker of top 100 cryptocurrencies
 * - Market statistics (without top coins table)
 */

// Configuration
const config = {
  apiUrl: 'https://api.coingecko.com/api/v3/coins/markets',
  currency: 'usd',
  coinsToFetch: 100,
  refreshInterval: 30000, // 30 seconds
  studentCountTarget: 5000,
  countUpDuration: 3000
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Payment button login check
  setTimeout(() => {
    const paymentSelectors = [
      'a[href*="payments/pay.html"]',
      'a.enroll-btn',
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
  // First load
  fetchMarketData();

  // Set up periodic refresh
  setInterval(fetchMarketData, config.refreshInterval);

  // Animate student count
  countUp("student-count", config.studentCountTarget, config.countUpDuration);

  // Persistent login: check localStorage or URL param
  const params = new URLSearchParams(window.location.search);
  let userName = params.get('googleUser');
  if (userName) {
    // Store in localStorage for persistence
    localStorage.setItem('loggedInUser', decodeURIComponent(userName));
    // Example: Set additional profile/referral data
    localStorage.setItem('userEmail', params.get('email') || '');
    localStorage.setItem('userUsername', params.get('username') || '');
    // Generate unique referral code/link if not already set for this user
    let referralCode = localStorage.getItem('referralCode_' + userName);
    if (!referralCode) {
      referralCode = 'CA' + Math.random().toString(36).substr(2, 8).toUpperCase();
      localStorage.setItem('referralCode_' + userName, referralCode);
      localStorage.setItem('referralLink_' + userName, 'https://www.coinacademia.in/?ref=' + referralCode);
    }
    // Store for easy access
    localStorage.setItem('referralCode', referralCode);
    localStorage.setItem('referralLink', localStorage.getItem('referralLink_' + userName));
  } else {
    userName = localStorage.getItem('loggedInUser');
  }
  const profileNameContainer = document.getElementById('profile-name-container');
  if (userName && profileNameContainer) {
    profileNameContainer.style.display = 'inline-block';
    profileNameContainer.textContent = userName;
    profileNameContainer.style.fontWeight = 'bold';
    profileNameContainer.style.marginLeft = '8px';
    profileNameContainer.style.color = '#3a8ee6'; // Light blue to match nav link
    // Add logout on click
    profileNameContainer.style.cursor = 'pointer';
    profileNameContainer.title = 'Click to log out';
    profileNameContainer.onclick = function() {
      if (confirm('Do you want to log out?')) {
        // Call logout endpoint and redirect to home
        fetch('/logout', { method: 'POST' })
          .finally(() => {
            localStorage.removeItem('loggedInUser');
            window.location.href = '/';
          });
      }
    };
    // Hide login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.style.display = 'none';
  } else {
    // Show popup notification to login
    showLoginPopup();
  }
// Popup notification for login
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
  popup.innerHTML = '<h3>Please log in to access your dashboard.</h3><p style="margin:12px 0 0 0;color:#d9534f;font-size:15px;">You are not logged in.</p><button id="login-popup-btn" style="margin-top:16px;padding:8px 24px;background:#3a8ee6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px;">Log In</button>';

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
}
});

/**
 * Fetches market data from CoinGecko API
 */
async function fetchMarketData() {
  try {
    const url = `${config.apiUrl}?vs_currency=${config.currency}&per_page=${config.coinsToFetch}`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
    
    const data = await res.json();
    updateDashboard(data);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Updates all dashboard components
 * @param {Array} coins - Array of coin data
 */
function updateDashboard(coins) {
  if (!coins || !coins.length) {
    throw new Error('No coin data received');
  }

  updateTicker(coins);
  updateMarketStats(coins);
}

/**
 * Updates scrolling ticker with all coins
 * @param {Array} coins - All coins data
 */
function updateTicker(coins) {
  const tickerElement = document.getElementById('coin-ticker');
  if (!tickerElement) return;
  
  tickerElement.innerHTML = coins.map(coin => {
    const change = coin.price_change_percentage_24h || 0;
    const changeClass = change >= 0 ? 'green' : 'red';
    return `
      <span class="orange">${coin.name}</span>: 
      <span class="${changeClass}">$${formatNumber(coin.current_price)}</span>
    `;
  }).join(' <span class="divider">|</span> ');
}

/**
 * Updates market statistics
 * @param {Array} coins - All coins data
 */
function updateMarketStats(coins) {
  // BTC Dominance
  const btc = coins.find(coin => coin.symbol === 'btc');
  const totalMarketCap = coins.reduce((acc, coin) => acc + (coin.market_cap || 0), 0);
  const btcDominance = btc && totalMarketCap ? (btc.market_cap / totalMarketCap) * 100 : 0;
  
  // Total volume
  const totalVolume = coins.reduce((acc, coin) => acc + (coin.total_volume || 0), 0);
  
  // Update DOM elements
  updateElementText('marketCap', formatBillions(totalMarketCap));
  updateElementText('volume', formatBillions(totalVolume));
  updateElementText('activeCryptos', coins.length);
  updateElementText('btcDominance', `${btcDominance.toFixed(2)}%`);
}

/**
 * Formats number with commas
 * @param {number} num - Number to format
 */
function formatNumber(num) {
  return num ? num.toLocaleString('en-US') : 'N/A';
}

/**
 * Formats large numbers as billions
 * @param {number} value - Value to format
 */
function formatBillions(value) {
  return '$' + (value / 1e9).toFixed(2) + 'B';
}

/**
 * Updates element text if element exists
 * @param {string} id - Element ID
 * @param {string} text - Text to display
 */
function updateElementText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

/**
 * Animates counting up to target number
 * @param {string} id - Element ID
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms
 */
function countUp(id, end, duration) {
  const element = document.getElementById(id);
  if (!element) return;
  
  let start = 0;
  const increment = end / (duration / 50);
  
  const counter = setInterval(() => {
    start += increment;
    if (start >= end) {
      start = end;
      clearInterval(counter);
    }
    element.textContent = Math.floor(start);
  }, 50);
}

/**
 * Handles and displays errors
 * @param {Error} error - Error object
 */
function handleError(error) {
  console.error('Failed to fetch market data:', error);
  
  const tickerElement = document.getElementById('coin-ticker');
  if (tickerElement) {
    tickerElement.innerHTML = 'Failed to load market data. Please try again later.';
  }
  
  const errorElement = document.getElementById('error-display');
  if (errorElement) {
    errorElement.textContent = `Error: ${error.message}`;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}


/**
 * Initializes the application
 */
function toggleMenu() {
   var navLinks = document.querySelector('.nav-links');
   if (navLinks.style.right === "0px") {
       navLinks.style.right = "-200px";
   } else {
       navLinks.style.right = "0px";
   }
// Optional: Hide menu when clicking a link (for mobile UX)
document.addEventListener('DOMContentLoaded', function() {
    var navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth < 992) {
          document.querySelector('.nav-links').style.right = "-200px";
        }
      });
    });
  });
};

// Hide nav on link click (for mobile)
document.addEventListener('DOMContentLoaded', function() {
    var navLinks = document.querySelectorAll('.nav-links a');
    var navMenu = document.querySelector('.nav-links');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 900 && navMenu) {
                navMenu.style.right = '-200px';
            }
        });
    });
});
  
