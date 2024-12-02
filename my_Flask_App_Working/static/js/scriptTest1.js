let trackingInterval;
let locations = [];

// Switch between Sign-Up and Login forms
function switchToSignUp() {
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

function switchToLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// Handle Sign-Up
function handleSignUp(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) switchToLogin();
        });
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                document.getElementById('signup-form').style.display = 'none';
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('tracking-buttons').style.display = 'block';
            }
        });
}

// Start tracking geolocation
function startTracking() {
    alert("Tracking started!");
    trackingInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const timestamp = new Date().toISOString();
            locations.push({ latitude, longitude, timestamp });

            fetch('/save_location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude, timestamp }),
            });
        });
    }, 60000); // Capture location every minute
}

// Stop tracking
function stop
