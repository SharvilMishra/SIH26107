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

    /* --- Mobile navigation (drawer built up by buildMobileNav below).
       Every screen hides its real nav -- top links, action buttons, or a
       whole sidebar -- behind "hidden md:flex"/"hidden lg:flex" with no
       working way to reveal it below that breakpoint. This drawer clones
       whatever is hidden and reveals it as a slide-in panel instead. --- */
    .manakai-mobile-nav-backdrop {
      position: fixed; inset: 0; background: rgba(10, 12, 16, 0.5);
      opacity: 0; pointer-events: none; transition: opacity .2s ease; z-index: 9998;
    }
    .manakai-mobile-nav-backdrop.open { opacity: 1; pointer-events: auto; }
    .manakai-mobile-nav {
      position: fixed; top: 0; left: 0; height: 100%; width: min(320px, 86vw);
      background: #ffffff; color: #1a1c1e; box-shadow: 8px 0 30px rgba(0,0,0,.2);
      transform: translateX(-100%); transition: transform .25s ease;
      z-index: 9999; overflow-y: auto; -webkit-overflow-scrolling: touch;
    }
    .manakai-mobile-nav.open { transform: translateX(0); }
    html.dark .manakai-mobile-nav { background: #14171d; color: #e9edf5; }
    .manakai-mobile-nav-inner { display: flex; flex-direction: column; gap: 4px; padding: 68px 18px 28px; }
    .manakai-mobile-nav-section + .manakai-mobile-nav-section {
      margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(0,0,0,.08);
    }
    html.dark .manakai-mobile-nav-section + .manakai-mobile-nav-section { border-top-color: rgba(255,255,255,.1); }
    .manakai-mobile-nav-close {
      position: absolute; top: 14px; right: 14px; width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center; border-radius: 999px;
      background: transparent; border: 0; cursor: pointer; color: inherit;
    }
    .manakai-mobile-nav-close:hover { background: rgba(0,0,0,.06); }
    html.dark .manakai-mobile-nav-close:hover { background: rgba(255,255,255,.1); }
    .manakai-mobile-nav-fab {
      position: fixed; bottom: 20px; right: 20px; width: 48px; height: 48px;
      border-radius: 999px; background: #ffffff; color: #1a1c1e;
      border: 1px solid rgba(0,0,0,.08); box-shadow: 0 4px 16px rgba(0,0,0,.2);
      display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9997;
    }
    html.dark .manakai-mobile-nav-fab { background: #22262f; color: #e9edf5; border-color: rgba(255,255,255,.1); }
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
    profile: 'profile.html',
    notifications: 'notifications.html'
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

  // ------------------------------------------------------------------
  // Mobile navigation: every screen hides its real nav (top links,
  // action buttons, or a full sidebar) behind "hidden md:flex" /
  // "hidden lg:flex" with no working way to reveal it on a phone --
  // a few screens even have a "menu" icon button already sitting there
  // with no click handler. Rather than hand-fixing each screen's own
  // (inconsistent) markup, this finds whatever the page already hides
  // behind a breakpoint, clones it into one slide-in drawer, and wires
  // whichever toggle exists (or adds one). Clicks inside the clone
  // still go through the click listener below unchanged, since it's
  // the *same* elements/labels/hrefs as the original -- just visible.
  function buildMobileNav() {
    if (document.getElementById('manakai-mobile-nav')) return;

    const RESPONSIVE_DISPLAY_TOKENS = new Set(
      ['sm', 'md', 'lg', 'xl'].flatMap(function (bp) {
        return ['flex', 'inline-flex', 'block', 'grid'].map(function (d) { return bp + ':' + d; });
      })
    );

    const allHidden = Array.prototype.filter.call(document.querySelectorAll('.hidden'), function (el) {
      const tokens = Array.prototype.slice.call(el.classList);
      if (tokens.indexOf('hidden') === -1) return false;
      if (!tokens.some(function (t) { return RESPONSIVE_DISPLAY_TOKENS.has(t); })) return false;
      // Only real navigation: the node itself is a link/button, or it
      // contains one -- this is what excludes headings, decorative
      // panels, and hidden-on-mobile search boxes that matched the
      // same "hidden md:flex" shape but aren't navigational.
      return el.tagName === 'A' || el.tagName === 'BUTTON' || !!el.querySelector('a, button');
    });

    // Drop nested duplicates (e.g. a hidden action button inside an
    // already-hidden nav container) so each piece of nav is cloned once.
    const topLevel = allHidden.filter(function (el) {
      return !allHidden.some(function (other) { return other !== el && other.contains(el); });
    });

    if (!topLevel.length) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'manakai-mobile-nav-backdrop';

    const panel = document.createElement('div');
    panel.id = 'manakai-mobile-nav';
    panel.className = 'manakai-mobile-nav';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Navigation menu');

    const inner = document.createElement('div');
    inner.className = 'manakai-mobile-nav-inner';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'manakai-mobile-nav-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
    panel.appendChild(closeBtn);

    topLevel.forEach(function (node) {
      const section = document.createElement('div');
      section.className = 'manakai-mobile-nav-section';
      const clone = node.cloneNode(true);
      // Strip ids so we never end up with duplicate ids on the page,
      // and reset the clone's own box so whatever fixed/absolute
      // positioning it used for its normal (desktop) placement can't
      // fight with its new spot inside our drawer -- inline styles
      // beat the plain utility classes doing that positioning, so
      // this is enough without having to strip those classes one by one.
      clone.removeAttribute('id');
      Array.prototype.forEach.call(clone.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
      clone.classList.remove('hidden');
      clone.style.cssText = 'position:static !important; display:flex !important; ' +
        'flex-direction:column !important; align-items:stretch !important; ' +
        'width:100% !important; height:auto !important; max-height:none !important; ' +
        'top:auto !important; left:auto !important; right:auto !important; bottom:auto !important; ' +
        'inset:auto !important; z-index:auto !important; border:0 !important; ' +
        'box-shadow:none !important; background:transparent !important; ' +
        'padding:0 !important; margin:0 !important; gap:6px !important;';
      section.appendChild(clone);
      inner.appendChild(section);
    });

    panel.appendChild(inner);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    function openMenu() {
      panel.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
    // Belt-and-suspenders: the shared click handler below already
    // navigates on a route match (which unloads the page anyway), but
    // this also closes the drawer for non-route actions inside it,
    // e.g. Language/Switch Mode/Logout, so it doesn't linger open.
    inner.addEventListener('click', function (event) {
      if (event.target.closest('a, button') && event.target.closest('button') !== closeBtn) closeMenu();
    });

    // Reuse an existing "menu" icon button if a screen already has one
    // (home, standards-search, standards-detail, verification-history
    // all do, just with no click handler) instead of adding a second,
    // redundant toggle. Its own responsive classes already show/hide
    // it at the right breakpoint, so no extra visibility logic needed.
    let reusedExisting = false;
    Array.prototype.forEach.call(document.querySelectorAll('button, a'), function (control) {
      // The icon can be the control itself (e.g. settings.html's button
      // carries the icon class directly, no nested span) or a descendant
      // (e.g. home.html wraps it in <span class="material-symbols-outlined">) --
      // check both, since querySelector alone only ever finds the latter.
      const iconSelector = '.material-symbols-outlined, [data-icon]';
      const icon = control.matches(iconSelector) ? control : control.querySelector(iconSelector);
      const iconText = icon ? icon.textContent.trim() : '';
      if (iconText === 'menu') {
        reusedExisting = true;
        control.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          openMenu();
        });
      }
    });

    // No existing hamburger anywhere on the page (most screens: verify,
    // ask-ai, complaint, laboratory-finder, evidence-viewer, grievances,
    // certification-roadmap, msme-dashboard, research-dashboard,
    // settings) -- add a floating toggle, and only show it once we've
    // confirmed the page's own CSS is actually hiding the real nav
    // right now, so it doesn't sit on top of a desktop layout that
    // already shows everything.
    if (!reusedExisting) {
      const fab = document.createElement('button');
      fab.type = 'button';
      fab.className = 'manakai-mobile-nav-fab';
      fab.setAttribute('aria-label', 'Open menu');
      fab.innerHTML = '<span class="material-symbols-outlined">menu</span>';
      fab.addEventListener('click', openMenu);
      document.body.appendChild(fab);

      function syncFabVisibility() {
        const stillHidden = topLevel.some(function (node) {
          return window.getComputedStyle(node).display === 'none';
        });
        fab.style.display = stillHidden ? 'flex' : 'none';
      }
      syncFabVisibility();
      let resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(syncFabVisibility, 100);
      });
    }
  }

  buildMobileNav();

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

    if (label.includes('logout')) {
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

    if (label.includes('language')) {
      event.preventDefault();
      window.alert(label + ' preferences are ready to configure.');
    }
  });
}());