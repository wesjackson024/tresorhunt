// ── Waitlist Form ──
const form = document.getElementById('waitlist-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');
const successState = document.getElementById('success-state');
const errorMsg = document.getElementById('error-msg');
const formContainer = document.getElementById('form-container');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const city = document.getElementById('city').value.trim();

  if (!email || !city) {
    showError('Please fill in both your email and city.');
    return;
  }

  setLoading(true);
  hideError();

  try {
    const res = await fetch('/.netlify/functions/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, city }),
    });

    const data = await res.json();

    if (res.ok) {
      form.hidden = true;
      successState.hidden = false;
      addPulseDot(); // add a new dot to the map
    } else {
      showError(data.message || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    showError('Network error — please check your connection and try again.');
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.hidden = loading;
  btnLoading.hidden = !loading;
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
}

// ── Map Pulse Dots ──
const mapContainer = document.getElementById('map-dots');

// Seed a few dots to show existing interest
const seedDots = [
  { x: 22, y: 40 }, { x: 45, y: 30 }, { x: 60, y: 55 },
  { x: 75, y: 35 }, { x: 35, y: 65 }, { x: 82, y: 60 },
  { x: 15, y: 60 }, { x: 55, y: 75 }, { x: 90, y: 25 },
];

seedDots.forEach((dot, i) => {
  setTimeout(() => createDot(dot.x, dot.y), i * 200);
});

function createDot(xPct, yPct) {
  const dot = document.createElement('div');
  dot.className = 'pulse-dot';
  dot.style.left = xPct + '%';
  dot.style.top = yPct + '%';
  // stagger the ripple animation
  dot.style.animationDelay = (Math.random() * 2) + 's';
  mapContainer.appendChild(dot);
}

function addPulseDot() {
  // Add a new dot at a random position when someone signs up
  const x = 10 + Math.random() * 80;
  const y = 10 + Math.random() * 80;
  createDot(x, y);
}
