// ==================== API HELPER ====================
async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

// ==================== UTILS ====================
function toast(msg, type) {
  const box = document.getElementById('toastBox');
  if (!box) return;
  const t = document.createElement('div');
  t.className = 'toast ' + (type || 'info');
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
function initials(name) {
  return (name || '').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substr(0, 2) || '?';
}
function esc(text) {
  const d = document.createElement('div');
  d.textContent = text == null ? '' : text;
  return d.innerHTML;
}

// ==================== SESSION ====================
// Every page calls this on load. It fetches who (if anyone) is logged in
// and updates the shared nav bar accordingly.
async function getSession() {
  try {
    const data = await api('GET', '/api/auth/me');
    return data.user;
  } catch (e) {
    return null;
  }
}

function updateNav(user) {
  const logged = !!user;
  const set = (id, hide) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hid', hide);
  };
  set('navIn', logged);
  set('navUp', logged);
  set('navOut', !logged);
  set('navDash', !logged);
  set('navBuild', !logged);
}

async function doLogout() {
  try { await api('POST', '/api/auth/logout'); } catch (e) {}
  toast('Signed out successfully.', 'info');
  window.location.href = 'index.html';
}

function toggleMenu() {
  const links = document.getElementById('navLinks');
  if (!links) return;
  const isOpen = links.style.display === 'flex' && links.style.position === 'absolute';
  if (isOpen) { links.style.display = 'none'; return; }
  links.style.display = 'flex';
  links.style.position = 'absolute';
  links.style.top = '64px';
  links.style.left = '0';
  links.style.right = '0';
  links.style.flexDirection = 'column';
  links.style.background = 'var(--bg)';
  links.style.padding = '1rem';
  links.style.borderBottom = '1px solid var(--border)';
}

function dlCV(id) {
  if (!id) { toast('No portfolio to download.', 'no'); return; }
  window.open('/api/portfolios/' + id + '/cv', '_blank');
}

function copyPortLink(id) {
  const url = window.location.origin + '/portfolio.html?id=' + id;
  navigator.clipboard.writeText(url)
    .then(() => toast('Profile link copied to clipboard!', 'ok'))
    .catch(() => toast('Link: ' + url, 'info'));
}

function portCard(p) {
  const skills = (p.skills || []).slice(0, 3).map(s => '<span class="skill-tag">' + esc(s) + '</span>').join('');
  const more = (p.skills || []).length > 3 ? '<span class="skill-tag">+' + (p.skills.length - 3) + '</span>' : '';
  return '<a class="port-card" href="portfolio.html?id=' + p.id + '" style="text-decoration:none;color:inherit;display:block">' +
    '<div class="port-head"><div class="port-av">' + initials(p.name) + '</div><h3>' + esc(p.name) + '</h3>' +
    '<p class="tit">' + esc(p.title || 'Professional') + '</p>' +
    '<div class="meta">' + esc(p.location || 'Remote') + '</div></div>' +
    '<div class="port-body"><div class="skills">' + skills + more + '</div></div>' +
    '<div class="port-foot"><span style="color:var(--text3);font-size:0.85rem">@' + p.id.slice(0, 8) + '</span><span class="arr">View Portfolio</span></div></a>';
}

// ==================== THEME TOGGLE ====================
// Applied site-wide. Reads/writes the saved preference and auto-creates
// the toggle button in the nav if a page doesn't already have one, so
// every page picks this up without needing to paste markup into each file.
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved === 'light') root.classList.add('light-mode');

  function buildToggle() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'themeToggle';
    btn.setAttribute('aria-label', 'Toggle light/dark mode');
    btn.innerHTML = `
      <span class="theme-toggle-track">
        <span class="theme-toggle-icon sun">☀</span>
        <span class="theme-toggle-icon moon">☾</span>
        <span class="theme-toggle-knob"></span>
      </span>`;
    return btn;
  }

  function wireToggle(btn) {
    btn.addEventListener('click', () => {
      root.classList.toggle('light-mode');
      localStorage.setItem('theme', root.classList.contains('light-mode') ? 'light' : 'dark');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    let btn = document.getElementById('themeToggle');
    if (!btn) {
      const navActions = document.querySelector('.nav-actions');
      if (navActions) {
        btn = buildToggle();
        navActions.insertBefore(btn, navActions.firstChild);
      }
    }
    if (btn) wireToggle(btn);
  });
})();
