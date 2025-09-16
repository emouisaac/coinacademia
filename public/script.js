console.log('Script loaded');
document.addEventListener('DOMContentLoaded', function() {
        // Footer hide/show logic
        const footer = document.querySelector('footer');
        function updateFooterVisibility() {
            const loginPage = document.getElementById('login');
            if (!footer || !loginPage) return;
            // If login page is active and either login or signup form is visible, hide footer
            const loginForm = document.querySelector('.login-form');
            const signupForm = document.querySelector('.signup-form');
            if (
                loginPage.classList.contains('active') &&
                ((loginForm && loginForm.style.display !== 'none') || (signupForm && signupForm.style.display !== 'none'))
            ) {
                footer.classList.add('hide-footer');
            } else {
                footer.classList.remove('hide-footer');
            }
        }

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-links a');
    const pages = document.querySelectorAll('.page');
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');

    // Set active nav link based on current URL/hash
    function setActiveNavLink() {
        let current = window.location.pathname.split('/').pop() || 'index.html';
        let hash = window.location.hash;
        navLinks.forEach(link => {
            link.classList.remove('active');
            // Match by href (ignoring domain)
            let linkHref = link.getAttribute('href');
            if (linkHref === current || linkHref === current + hash || (hash && linkHref.endsWith(hash))) {
                link.classList.add('active');
            }
            // Special case for home
            if ((current === '' || current === 'index.html') && linkHref === 'index.html') {
                link.classList.add('active');
            }
        });
    }

    setActiveNavLink();
    window.addEventListener('hashchange', setActiveNavLink);
    window.addEventListener('popstate', setActiveNavLink);

    // SPA-like page switching for # links only
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                // Scroll to section
                const section = document.querySelector(href);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
                // Update active state
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Burger menu toggle
    burger.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('toggle');
    });
    
    // Login/Signup toggle
    // Google Login/Signup button handlers
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            window.location.href = '/auth/google';
        });
    }
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', function() {
            window.location.href = '/auth/google';
        });
    }

    // If redirected from Google login, show username in nav
    // If on /main, handle Google login username
    const urlParams = new URLSearchParams(window.location.search);
    const googleUser = urlParams.get('googleUser');

    // Move this block after loginBtn is defined
    const loginBtn = document.getElementById('login-btn');
    if (googleUser && loginBtn) {
        loginBtn.textContent = googleUser;
        loginBtn.setAttribute('data-page', 'logout');
        // Redirect to home page view
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('home').classList.add('active');
        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
        });
        document.querySelector('.nav-links a[data-page="home"]').classList.add('active');
        // Remove query param from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Logout feature: clicking username when logged in logs out
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            if (loginBtn.getAttribute('data-page') === 'logout') {
                e.preventDefault();
                const confirmLogout = confirm('Do you want to log out?');
                if (!confirmLogout) return;
                // Reset nav to LOG IN
                loginBtn.textContent = 'LOG IN';
                loginBtn.setAttribute('data-page', 'login');
                // Show login page
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                document.getElementById('login').classList.add('active');
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                loginBtn.classList.add('active');
                // Optionally: clear Google login state (simulate logout)
                // If you store login state in localStorage/cookies, clear it here
            }
        });
    }
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');
    
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Show login page
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('login').classList.add('active');
        
        // Show login form by default
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        
        // Update nav active state
        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
        });
        this.classList.add('active');
    });
    
    showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
            updateFooterVisibility();
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
            updateFooterVisibility();
    });
    
    // Form submissions
    const loginFormEl = document.getElementById('loginForm');
    const signupFormEl = document.getElementById('signupForm');
    
    loginFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(result => {
            if (result.status === 200) {
                alert('Login successful!');
                // Show the registered username in nav, even if user logged in with email
                const displayName = result.body.username || username;
                loginBtn.textContent = displayName;
                loginBtn.setAttribute('data-page', 'logout');
                // Redirect to home page
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                document.getElementById('home').classList.add('active');
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                document.querySelector('.nav-links a[data-page="home"]').classList.add('active');
            } else {
                alert(result.body.message || 'Login failed.');
            }
        })
        .catch(() => alert('Network error.'));
    });
    
    signupFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(result => {
            if (result.status === 201) {
                alert('Account created successfully! Please log in.');
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else {
                alert(result.body.message || 'Registration failed.');
            }
        })
        .catch(() => alert('Network error.'));
    });
    
    // Simulate user login state (for demo purposes)
    const isLoggedIn = false; // Change to true to simulate logged in state
    
    if (isLoggedIn) {
        loginBtn.textContent = 'LOG OUT';
        loginBtn.setAttribute('data-page', 'logout');
    }
        // Initial check
        updateFooterVisibility();
});





// Render top 100 coins, remove image icons from coin-list
    document.addEventListener('DOMContentLoaded', function() {
      function renderCoinList(coins) {
        const tbody = document.getElementById('coin-list');
        // Clear previous rows to prevent flashing old/blank symbols
        tbody.innerHTML = '';
        coins.slice(0, 100).forEach(function(coin) {
          const symbol = coin.symbol.toUpperCase();
          // Use CoinGecko API image for the coin logo
          const img = coin.image ? `<img src="${coin.image}" alt="${symbol} logo" style="width:22px;height:22px;vertical-align:middle;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.07);margin-right:6px;">` : '';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${img}<span style="vertical-align:middle;">${symbol}</span></td>
            <td>$${Number(coin.current_price).toLocaleString()}</td>
            <td style="color:${coin.price_change_percentage_24h > 0 ? '#10b981' : '#ef4444'};font-weight:600;">
              ${coin.price_change_percentage_24h > 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td>$${Number(coin.market_cap).toLocaleString()}</td>
          `;
          tbody.appendChild(tr);
        });
      }
      // If using an API, replace this with your fetch logic
      if (window.top100Coins) {
        renderCoinList(window.top100Coins);
      } else if (typeof fetch === 'function') {
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false')
          .then(res => res.json())
          .then(data => renderCoinList(data));
      }
    });


    // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });