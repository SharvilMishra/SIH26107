(function () {
  const themeKey = 'manakai-theme';
  const themeStyles = `
    html, body, body * { transition: background-color .18s ease, border-color .18s ease, color .18s ease; }

    /* --- Page background + base surfaces: near-black paper, raised panels --- */
    html.dark body { background: #0a0c10 !important; color: #e9edf5 !important; }
    html.dark .bg-background, html.dark .bg-surface, html.dark .bg-surface-bright { background: #0a0c10 !important; }
    html.dark .bg-surface-container-low { background: #14171d !important; }
    html.dark .bg-surface-container-lowest, html.dark .bg-surface-container { background: #181c23 !important; }
    html.dark .bg-surface-container-high, html.dark .bg-surface-container-highest, html.dark .bg-surface-variant { background: #22262f !important; }
    html.dark .bg-surface-dim { background: #14171d !important; }

    /* --- Body / muted text --- */
    html.dark .text-on-background, html.dark .text-text-primary, html.dark .text-on-surface { color: #e9edf5 !important; }
    html.dark .text-on-surface-variant, html.dark .text-text-secondary { color: #a3acbd !important; }
    html.dark .text-outline { color: #7d879c !important; }

    /* --- Brand / headline color: the dark navy #000666 is invisible on a dark
       page, so headlines and accent text switch to a soft periwinkle instead
       of staying near-black. This is the fix for the unreadable "simple hai"
       style headlines. --- */
    html.dark .text-primary { color: #aab4ff !important; }
    html.dark .text-secondary { color: #8fb3ff !important; }
    html.dark .border-primary { border-color: #5b66c9 !important; }
    html.dark .border-secondary { border-color: #4a72c9 !important; }

    /* --- Solid brand buttons/badges: keep them solid and saturated (this is
       the "accent-solid" pattern -- fills don't flip with the theme, only
       get slightly brighter for legibility), text stays white on top --- */
    html.dark .bg-primary { background: #2530a8 !important; }
    html.dark .bg-primary:hover { background: #313fc2 !important; }
    html.dark .bg-secondary { background: #2b5bb5 !important; }
    html.dark .bg-secondary:hover { background: #3768cc !important; }
    html.dark .bg-bis-gold { background: #c99a2e !important; }

    /* --- Container/pill badges (e.g. "IS 302-2-3" chips) --- */
    html.dark .bg-primary-container { background: #232f8f !important; }
    html.dark .text-on-primary-container { color: #b7c0ff !important; }
    html.dark .bg-secondary-container { background: #3a5fc4 !important; }
    html.dark .text-on-secondary-container { color: #e3ebff !important; }

    /* --- Status colors: brighten just enough to read clearly on near-black
       without turning neon --- */
    html.dark .text-success-green { color: #6fd68a !important; }
    html.dark .bg-success-green { background: #2f8f4f !important; }
    html.dark .text-alert-red { color: #ff8a80 !important; }
    html.dark .bg-alert-red { background: #b3453d !important; }

    /* --- Borders, inputs, dividers --- */
    html.dark .border-outline, html.dark .border-outline-variant, html.dark .border-border-subtle { border-color: #2e333d !important; }
    html.dark input, html.dark textarea, html.dark select {
      background: #14171d !important;
      color: #e9edf5 !important;
      border-color: #2e333d !important;
    }
    html.dark input::placeholder, html.dark textarea::placeholder { color: #7d879c !important; }

    /* --- Icons inherit currentColor via the text-* overrides above --- */
    html.dark .material-symbols-outlined { color: inherit; }

    /* --- Error containers (e.g. "Deactivate Account" danger zones): the
       light-pink error-container background at low opacity looked like a
       stray muddy patch on a dark page. Darken it and brighten the text
       so it still reads as "danger" without clashing with the theme. --- */
    html.dark [class*="bg-error-container"] { background-color: #4a2020 !important; }
    html.dark [class*="border-error-container"] { border-color: #7a3a3a !important; }
    html.dark .text-error { color: #ff8a80 !important; }
    html.dark .text-on-error-container { color: #ffd9d4 !important; }

    /* --- Inverse-surface elements (floating toasts/snackbars): give them a
       touch more separation from an already-dark page so they still "pop". --- */
    html.dark .bg-inverse-surface { background: #3a3f47 !important; }
    html.dark .text-inverse-on-surface { color: #f5f6f8 !important; }

    /* --- "Pending"/incomplete sections use opacity-50 as a dimming cue;
       50% opacity reads as near-invisible once the underlying colors are
       already dark, so ease it up specifically in dark mode. --- */
    html.dark .opacity-50 { opacity: 0.75 !important; }

    /* --- Material "Fixed" role chips/badges (primary-fixed, secondary-fixed,
       tertiary-fixed, and their -dim variants) are DELIBERATELY the same
       light color in both themes -- but text/icons inside them were
       inheriting our global dark-mode text overrides meant for the rest of
       the page, going light-on-light. Force dark, legible text back inside
       these specific chips regardless of theme. Handles the always-visible
       cases (icon badges, decorative panels) directly; hover/group-hover/
       peer-checked variants are gated to only apply when actually active,
       matching Tailwind's own conditional classes. --- */
    html.dark [class*="bg-primary-fixed"]:not([class*="hover:"]):not([class*="group-hover:"]),
    html.dark [class*="bg-secondary-fixed"]:not([class*="hover:"]):not([class*="group-hover:"]),
    html.dark [class*="bg-tertiary-fixed"]:not([class*="hover:"]):not([class*="group-hover:"]) {
      color: #1a1c1e !important;
    }
    html.dark [class*="bg-primary-fixed"]:not([class*="hover:"]):not([class*="group-hover:"]) *,
    html.dark [class*="bg-secondary-fixed"]:not([class*="hover:"]):not([class*="group-hover:"]) *,
    html.dark [class*="bg-tertiary-fixed"]:not([class*="hover:"]):not([class*="group-hover:"]) * {
      color: inherit !important;
    }
    html.dark [class*="hover\:bg-primary-fixed"]:hover,
    html.dark [class*="hover\:bg-secondary-fixed"]:hover,
    html.dark [class*="hover\:bg-tertiary-fixed"]:hover {
      color: #1a1c1e !important;
    }
    html.dark [class*="hover\:bg-primary-fixed"]:hover *,
    html.dark [class*="hover\:bg-secondary-fixed"]:hover *,
    html.dark [class*="hover\:bg-tertiary-fixed"]:hover * {
      color: inherit !important;
    }
    html.dark .group:hover [class*="group-hover\:bg-primary-fixed"],
    html.dark .group:hover [class*="group-hover\:bg-secondary-fixed"],
    html.dark .group:hover [class*="group-hover\:bg-tertiary-fixed"] {
      color: #1a1c1e !important;
    }
    html.dark .group:hover [class*="group-hover\:bg-primary-fixed"] *,
    html.dark .group:hover [class*="group-hover\:bg-secondary-fixed"] *,
    html.dark .group:hover [class*="group-hover\:bg-tertiary-fixed"] * {
      color: inherit !important;
    }

    /* --- Radio/checkbox "selected card" pattern (peer-checked:bg-*-fixed),
       e.g. the grievance-type picker on complaint.html: when checked, the
       card goes light per the Fixed-role spec, so its text needs to stay
       dark too, only while actually checked. --- */
    html.dark .peer:checked ~ [class*="peer-checked\:bg-primary-fixed"],
    html.dark .peer:checked ~ [class*="peer-checked\:bg-secondary-fixed"],
    html.dark .peer:checked ~ [class*="peer-checked\:bg-tertiary-fixed"] {
      color: #1a1c1e !important;
    }
    html.dark .peer:checked ~ [class*="peer-checked\:bg-primary-fixed"] *,
    html.dark .peer:checked ~ [class*="peer-checked\:bg-secondary-fixed"] *,
    html.dark .peer:checked ~ [class*="peer-checked\:bg-tertiary-fixed"] * {
      color: inherit !important;
    }
  `;
  const routes = {
    home: 'home.html',
    'ask ai': 'ask-ai.html',
    'ask manakai': 'ask-ai.html',
    verify: 'verify.html',
    'start verification': 'verify.html',
    'check status': 'verify.html',
    'open camera': 'verify.html',
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

    if (label === 'logout') {
      event.preventDefault();
      if (window.ManakAIAuth) {
        window.ManakAIAuth.signOutUser().then(function () {
          const inScreensDir = window.location.pathname.includes('/screens/');
          window.location.href = inScreensDir ? 'login.html' : 'screens/login.html';
        });
      } else {
        window.alert('Logout is not available on this page.');
      }
      return;
    }

    if (label === 'language' || label === 'switch mode') {
      event.preventDefault();
      window.alert(label + ' preferences are ready to configure.');
    }
  });
}());