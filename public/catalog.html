<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Catalog — Babutheni</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="toast-box" id="toastBox"></div>

<nav>
  <div class="container nav-inner">
    <a class="logo" href="index.html" style="text-decoration:none">
      <div class="logo-icon">B</div>
      Babutheni
    </a>
    <ul class="nav-links" id="navLinks">
      <li><a href="catalog.html" style="color:var(--text2);text-decoration:none;font-size:0.875rem;font-weight:500">Catalog</a></li>
      <li id="navDash" class="hid"><a href="dashboard.html" style="color:var(--text2);text-decoration:none;font-size:0.875rem;font-weight:500">Dashboard</a></li>
      <li id="navBuild" class="hid"><a href="builder.html" style="color:var(--text2);text-decoration:none;font-size:0.875rem;font-weight:500">Builder</a></li>
    </ul>
    <div class="nav-actions">
      <button class="btn btn-ghost hid" id="navOut" onclick="doLogout()">Sign out</button>
      <a class="btn btn-sec btn-sm" id="navIn" href="auth.html">Sign In</a>
      <a class="btn btn-prim btn-sm" id="navUp" href="auth.html?mode=signup">Get Started</a>
      <button class="mobile-btn" onclick="toggleMenu()">Menu</button>
    </div>
  </div>
</nav>

<main style="padding-top:64px">
  <div class="catalog-top">
    <div class="hero-bg">
      <div class="hero-sunset"></div>
      <svg class="hero-waves" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path class="wave wave1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z"></path>
        <path class="wave wave2" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L0,320Z"></path>
        <path class="wave wave3" d="M0,288L60,272C120,256,240,224,360,224C480,224,600,256,720,266.7C840,277,960,267,1080,245.3C1200,224,1320,192,1380,176L1440,160L1440,320L0,320Z"></path>
      </svg>
      <canvas class="hero-particles" id="catalogParticles"></canvas>
    </div>

    <div class="container" style="position:relative;z-index:1;padding-top:4rem;padding-bottom:4rem">
      <div class="sec-head">
        <h2>Portfolio Catalog</h2>
        <p>Discover professionals and their work.</p>
      </div>
      <div class="search-box mb4">
        <input type="text" id="catSearch" placeholder="Search by name, skill, or location..." oninput="doSearch(this.value)">
      </div>
    </div>
  </div>

  <div class="catalog">
    <svg class="catalog-shore" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,64L80,80C160,96,320,128,480,122.7C640,117,800,75,960,69.3C1120,64,1280,96,1360,112L1440,128L1440,0L0,0Z"></path>
    </svg>
    <div class="container">
      <div class="cat-grid" id="catGrid"></div>
    </div>
  </div>
</main>

<footer>
  <div class="container">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="logo" href="index.html" style="text-decoration:none"><div class="logo-icon">B</div>Babutheni</a>
        <p>Professional portfolio builder. Showcase your work. Make an impression.</p>
      </div>
      <div class="foot-links"><h4>Product</h4><ul><li><a href="catalog.html">Catalog</a></li><li><a href="auth.html?mode=signup">Get Started</a></li><li><a href="auth.html">Sign In</a></li></ul></div>
      <div class="foot-links"><h4>Legal</h4><ul><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
    </div>
    <div class="foot-bot"><span>&copy; 2026 Babutheni. All rights reserved.</span><span>Built for final year students.</span></div>
  </div>
</footer>

<script src="common.js"></script>
<script>
let searchTimer = null;

async function renderCatalog() {
  try {
    const data = await api('GET', '/api/portfolios');
    document.getElementById('catGrid').innerHTML = data.portfolios.map(portCard).join('') ||
      '<p style="grid-column:1/-1;text-align:center;color:var(--text3);padding:3rem">No portfolios yet. Be the first to create one!</p>';
  } catch (e) { toast(e.message, 'no'); }
}

function doSearch(query) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    try {
      const data = await api('GET', '/api/portfolios?q=' + encodeURIComponent(query));
      document.getElementById('catGrid').innerHTML = data.portfolios.map(portCard).join('') ||
        '<p style="grid-column:1/-1;text-align:center;color:var(--text3);padding:3rem">No results found.</p>';
    } catch (e) { toast(e.message, 'no'); }
  }, 250);
}

// Particle field — confined to the catalog header background only
(function(){
  const canvas = document.getElementById('catalogParticles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = document.querySelector('.catalog-top');
  let particles = [];

  function resize(){
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  function createParticles(){
    const count = Math.max(24, Math.floor((canvas.width * canvas.height) / 9000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      speedY: Math.random() * 0.3 + 0.06,
      speedX: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.6 + 0.2,
      twinkle: Math.random() * 0.015 + 0.004,
      dir: Math.random() > 0.5 ? 1 : -1
    }));
  }

  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.alpha += p.twinkle * p.dir;
      if (p.alpha <= 0.15 || p.alpha >= 0.85) p.dir *= -1;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,225,255,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

(async () => {
  const user = await getSession();
  updateNav(user);
  renderCatalog();
})();
</script>
</body>
</html>
