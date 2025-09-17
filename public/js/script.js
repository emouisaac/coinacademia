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
    localStorage.setItem('referralCode', params.get('ref') || 'CA12345');
    localStorage.setItem('referralLink', params.get('reflink') || 'https://www.coinacademia.in/?ref=CA12345');
  } else {
    userName = localStorage.getItem('loggedInUser');
  }
  if (userName) {
    const profileNameContainer = document.getElementById('profile-name-container');
    if (profileNameContainer) {
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
    }
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
  
