document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('manakai-theme') || 'light';
  setTheme(savedTheme);
  const current = location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav a').forEach(link => {
    if (link.getAttribute('href')?.endsWith(current)) link.classList.add('active');
  });
  document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.toast)));
  document.querySelectorAll('[data-drawer]').forEach(button => button.addEventListener('click', () => document.querySelector(button.dataset.drawer)?.classList.add('open')));
  document.querySelectorAll('[data-close-drawer]').forEach(button => button.addEventListener('click', () => button.closest('.drawer')?.classList.remove('open')));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const group = button.closest('[data-filter-group]');
    group?.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const value = button.dataset.filter.toLowerCase();
    document.querySelectorAll('[data-filter-item]').forEach(item => item.hidden = value !== 'all' && !item.textContent.toLowerCase().includes(value));
  }));
  document.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    if (!button.textContent.toLowerCase().includes('switch mode')) return;
    const nextTheme = document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem('manakai-theme', nextTheme);
    setTheme(nextTheme);
  }));
});

function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.classList.toggle('dark-mode', dark);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

const screenRoutes = {
  home: 'home.html', 'ask ai': 'ask-ai.html', 'ask manakai': 'ask-ai.html',
  verify: 'verify.html', standards: 'standards-search.html', complaints: 'complaint.html',
  research: 'research-dashboard.html', certificates: 'certification-roadmap.html',
  compliance: 'msme-dashboard.html', dashboard: 'msme-dashboard.html', support: 'complaint.html',
  settings: 'settings.html', 'new inquiry': 'ask-ai.html', 'evidence viewer': 'evidence-viewer.html',
  'find a laboratory': 'laboratory-finder.html', 'find a testing laboratory': 'laboratory-finder.html',
  'verification history': 'verification-history.html', 'certification roadmap': 'certification-roadmap.html',
  'my grievances': 'grievances.html', 'saved items': 'saved-items.html', consultations: 'consultations.html', profile: 'profile.html'
};
document.addEventListener('click', event => {
  const control = event.target.closest('a, button');
  if (!control) return;
  const label = control.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  const key = Object.keys(screenRoutes).find(route => label === route || label.includes(route));
  if (key && (control.tagName === 'BUTTON' || control.getAttribute('href') === '#')) {
    event.preventDefault();
    window.location.href = screenRoutes[key];
  }
});
function showToast(text) { const toast = document.querySelector('.toast'); if (!toast) return; toast.textContent = text; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2800); }
