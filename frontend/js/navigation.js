(function () {
  const themeKey = 'manakai-theme';
  const themeStyles = `
    html, body, body * { transition: background-color .18s ease, border-color .18s ease, color .18s ease; }
    html.dark body { background: #0b0d10 !important; color: #f8fafc !important; }
    html.dark .bg-background, html.dark .bg-surface, html.dark .bg-surface-bright { background: #0b0d10 !important; }
    html.dark .bg-surface-container-low { background: #15191f !important; }
    html.dark .bg-surface-container-lowest, html.dark .bg-surface-container { background: #15191f !important; }
    html.dark .bg-surface-container-high, html.dark .bg-surface-container-highest, html.dark .bg-surface-variant { background: #20252d !important; }
    html.dark .text-on-background, html.dark .text-text-primary, html.dark .text-on-surface { color: #f8fafc !important; }
    html.dark .text-on-surface-variant, html.dark .text-text-secondary { color: #b8c0cc !important; }
    html.dark .border-outline, html.dark .border-outline-variant, html.dark .border-border-subtle { border-color: #343b46 !important; }
    html.dark input, html.dark textarea, html.dark select { background: #15191f !important; color: #f8fafc !important; border-color: #343b46 !important; }
    html.dark input::placeholder, html.dark textarea::placeholder { color: #8993a1 !important; }
  `;
  const routes = {
    home: 'home.html',
    'ask ai': 'ask-ai.html',
    'ask manakai': 'ask-ai.html',
    verify: 'verify.html',
    standards: 'standards-search.html',
    complaints: 'complaint.html',
    research: 'research-dashboard.html',
    certificates: 'certification-roadmap.html',
    compliance: 'msme-dashboard.html',
    support: 'complaint.html',
    settings: 'settings.html',
    dashboard: 'msme-dashboard.html',
    'new inquiry': 'ask-ai.html',
    'evidence viewer': 'evidence-viewer.html',
    'find a laboratory': 'laboratory-finder.html',
    'find a testing laboratory': 'laboratory-finder.html',
    'verification history': 'verification-history.html',
    'certification roadmap': 'certification-roadmap.html',
    'my grievances': 'grievances.html',
    'saved items': 'saved-items.html',
    consultations: 'consultations.html',
    profile: 'profile.html'
  };

  function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    document.documentElement.classList.toggle('dark-mode', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    document.querySelectorAll('[data-icon="dark_mode"], [data-icon="light_mode"]').forEach(icon => {
      icon.textContent = dark ? 'light_mode' : 'dark_mode';
      icon.dataset.icon = dark ? 'light_mode' : 'dark_mode';
    });
    document.querySelectorAll('button').forEach(button => {
      if (button.textContent.toLowerCase().includes('switch mode')) {
        button.setAttribute('aria-pressed', String(dark));
      }
    });
  }

  const style = document.createElement('style');
  style.textContent = themeStyles;
  document.head.appendChild(style);
  applyTheme(localStorage.getItem(themeKey) || 'light');

  document.addEventListener('click', function (event) {
    const link = event.target.closest('a, button');
    if (!link) return;

    const label = link.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
    if (label.includes('switch mode')) {
      event.preventDefault();
      const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem(themeKey, nextTheme);
      applyTheme(nextTheme);
      return;
    }
    const routeKey = Object.keys(routes).find(function (key) {
      return label === key || label.includes(key);
    });
    const route = routeKey ? routes[routeKey] : null;
    if (link.tagName === 'A' && link.getAttribute('href') !== '#') return;
    if (route) {
      event.preventDefault();
      window.location.href = route;
      return;
    }

    if (label === 'language' || label === 'switch mode' || label === 'logout') {
      event.preventDefault();
      window.alert(label === 'logout' ? 'You have been signed out.' : label + ' preferences are ready to configure.');
    }
  });
}());