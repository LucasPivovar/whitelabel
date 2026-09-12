(function () {
  'use strict';

  const STORAGE_KEY = 'whitelabel_tenant_branding';
  const CHANNEL_NAME = 'whitelabel_branding';

  // Helper to lighten/darken hex colors
  function adjustColor(hex, factor) {
    if (!hex || typeof hex !== 'string') return '#79ae00';
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length !== 6) return hex;
    const num = parseInt(clean, 16);
    let r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 255) * factor)));
    let g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 255) * factor)));
    let b = Math.min(255, Math.max(0, Math.round((num & 255) * factor)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return { r: 150, g: 214, b: 0 };
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length !== 6) return { r: 150, g: 214, b: 0 };
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  function isLightColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    // HSP equation
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 165;
  }

  let currentBranding = {
    name: 'TradingPro',
    color: '#96d600',
    secondaryColor: '#ffffff',
    logo: '',
    font: 'Inter',
  };

  function applyColors(branding) {
    const color = branding.color || '#96d600';
    const dim = adjustColor(color, 0.82);
    const lightDim = adjustColor(color, 1.15);
    const secondary = branding.secondaryColor || '#ffffff';
    const { r, g, b } = hexToRgb(color);
    const textColor = isLightColor(color) ? '#070a07' : '#ffffff';

    // Root CSS variables
    const root = document.documentElement;
    root.style.setProperty('--lime', color);
    root.style.setProperty('--lime-dim', dim);
    root.style.setProperty('--buy', color);
    root.style.setProperty('--brand-primary', color);
    root.style.setProperty('--brand-secondary', secondary);

    if (branding.font && branding.font !== 'Inter') {
      root.style.setProperty('--font-body', `"${branding.font}", system-ui, sans-serif`);
      root.style.setProperty('--font-display', `"${branding.font}", system-ui, sans-serif`);

      // Ensure Google font link exists
      const fontId = `wl-font-${branding.font.toLowerCase().replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${branding.font.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
    }

    // Dynamic stylesheet for overriding hardcoded prototype rules
    let styleTag = document.getElementById('whitelabel-brand-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'whitelabel-brand-styles';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --lime: ${color} !important;
        --lime-dim: ${dim} !important;
        --buy: ${color} !important;
        --brand-primary: ${color} !important;
        --brand-secondary: ${secondary} !important;
      }

      /* Buttons & CTAs */
      .btn-lime, .hero-primary, .tour-button, .auth-card .btn-lime, .lp-nav-links .nav-cta, a.btn-lime {
        background: ${color} !important;
        color: ${textColor} !important;
        box-shadow: 0 4px 18px rgba(${r}, ${g}, ${b}, 0.42) !important;
      }
      .btn-lime:hover, .hero-primary:hover, .tour-button:hover, .auth-card .btn-lime:hover, .lp-nav-links .nav-cta:hover, a.btn-lime:hover {
        background: ${dim} !important;
        box-shadow: 0 6px 24px rgba(${r}, ${g}, ${b}, 0.58) !important;
      }
      .btn-buy {
        background: ${color} !important;
        color: ${textColor} !important;
      }

      /* Glowing / Colored Text */
      .lime, .pos, .brand-accent, .splash-word span, .history-eyebrow,
      .history-session-meta small, .legal-eyebrow, .legal h2, .market-card-tag {
        color: ${color} !important;
      }

      /* Navigation active states */
      .lp-nav-links a.active, .lp-mobile-link.active, .tabbar a.active, .lp-burger-btn:hover {
        color: ${color} !important;
        text-shadow: 0 0 14px rgba(${r}, ${g}, ${b}, 0.5) !important;
      }
      .tabbar a.active {
        background: rgba(${r}, ${g}, ${b}, 0.12) !important;
      }
      .lp-mobile-drawer-dot {
        background: ${color} !important;
        box-shadow: 0 0 12px rgba(${r}, ${g}, ${b}, 0.65) !important;
      }

      /* Inputs and focus outlines */
      input:focus, select:focus, textarea:focus, input:active, select:active, textarea:active {
        border-color: ${color} !important;
        box-shadow: 0 0 0 1px #000000e6, 0 0 0 3.5px rgba(${r}, ${g}, ${b}, 0.24), inset 0 0 0 1px rgba(${r}, ${g}, ${b}, 0.35) !important;
      }
      .auth-remember input {
        accent-color: ${color} !important;
      }

      /* Badges & Chips */
      .badge-demo, .mode-chip-entry, .tour-cta-icon {
        background: rgba(${r}, ${g}, ${b}, 0.14) !important;
        color: ${color} !important;
        border-color: rgba(${r}, ${g}, ${b}, 0.32) !important;
      }

      /* Charts & SVG Lines */
      .history-chart-wrap polyline {
        stroke: ${color} !important;
        filter: drop-shadow(0 0 12px rgba(${r}, ${g}, ${b}, 0.35)) !important;
      }
      .history-chart-wrap circle {
        fill: ${color} !important;
      }

      /* Channels and Support */
      .channel-ticket:after {
        background: linear-gradient(90deg, ${color}, ${lightDim}) !important;
      }
      .channel-icon-ticket {
        background: rgba(${r}, ${g}, ${b}, 0.14) !important;
        border-color: rgba(${r}, ${g}, ${b}, 0.35) !important;
        color: ${color} !important;
      }
      .channel-ticket .channel-cta, .channel-ticket:hover {
        color: ${color} !important;
        border-color: ${color} !important;
      }

      /* Tour CTA banner */
      .tour-cta {
        border-color: rgba(${r}, ${g}, ${b}, 0.35) !important;
        background: linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.08) 0%, rgba(15, 18, 15, 0.95) 100%) !important;
      }

      /* Custom Brand Logo */
      .whitelabel-logo-img {
        max-height: 34px;
        max-width: 140px;
        object-fit: contain;
        display: inline-block;
        vertical-align: middle;
      }
      .whitelabel-brand-name {
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #ffffff;
      }
      .whitelabel-brand-name .brand-highlight {
        color: ${color};
      }
    `;
  }

  function isSameBranding(a, b) {
    if (!a || !b) return false;
    return (
      a.name === b.name &&
      a.color === b.color &&
      a.secondaryColor === b.secondaryColor &&
      a.logo === b.logo &&
      a.favicon === b.favicon &&
      a.font === b.font &&
      a.darkMode === b.darkMode
    );
  }

  let lastAppliedFavicon = '';

  function updateFavicons(favIcon, color) {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;
    const oldIcons = head.querySelectorAll("link[rel*='icon']");
    oldIcons.forEach((el) => el.remove());

    const iconUrl = favIcon
      ? favIcon
      : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32'%3E%3Crect width='32' height='32' rx='8' fill='${encodeURIComponent(color)}'/%3E%3Cpath d='M6 21 L13 14 L18 18 L26 9' stroke='%23191919' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Ccircle cx='26' cy='9' r='2.4' fill='%23191919'/%3E%3C/svg%3E`;

    const iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = iconUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png';
    iconLink.href = iconUrl;
    head.appendChild(iconLink);

    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = iconUrl;
    head.appendChild(appleIcon);
  }

  function applyBrandTextAndLogo(branding) {
    const name = (branding.name || 'TradingPro').trim();
    const color = branding.color || '#96d600';
    const favIcon = branding.favicon || branding.logo || '';

    // 1. Document Title
    const newTitle = `${name} | Plataforma de Trading`;
    if (document.title !== newTitle) {
      document.title = newTitle;
    }

    // 2. Favicon & Tab Icon (only if changed)
    const targetFavicon = favIcon || `svg:${color}`;
    if (lastAppliedFavicon !== targetFavicon) {
      lastAppliedFavicon = targetFavicon;
      updateFavicons(favIcon, color);
    }

    // 3. Update non-React static labels if present
    const drawerTitle = document.querySelector('.lp-mobile-drawer-title');
    if (drawerTitle && drawerTitle.textContent !== name) {
      const dot = drawerTitle.querySelector('.lp-mobile-drawer-dot');
      drawerTitle.textContent = name;
      if (dot) drawerTitle.appendChild(dot);
    }

    const videoHead = document.querySelector('.capability-title h3, .tour-cta h3');
    if (videoHead && videoHead.textContent.includes('TradingPro')) {
      videoHead.textContent = videoHead.textContent.replace(/TradingPro/g, name);
    }
  }

  function applyAll(branding) {
    if (!branding) return;
    const next = { ...currentBranding, ...branding };
    if (isSameBranding(currentBranding, next) && window.__WHITELABEL_BRANDING__) {
      return;
    }
    currentBranding = next;
    window.__WHITELABEL_BRANDING__ = currentBranding;
    applyColors(currentBranding);
    applyBrandTextAndLogo(currentBranding);
    try {
      window.dispatchEvent(new CustomEvent('whitelabel:update', { detail: currentBranding }));
    } catch {}
  }

  // Load branding from localStorage or URL params
  function initFromStorageOrParams() {
    try {
      // 1. URL params override
      const params = new URLSearchParams(window.location.search);
      const urlBranding = {};
      if (params.get('name')) urlBranding.name = params.get('name');
      if (params.get('color')) urlBranding.color = params.get('color');
      if (params.get('secondaryColor')) urlBranding.secondaryColor = params.get('secondaryColor');
      if (params.get('logo')) urlBranding.logo = params.get('logo');
      if (params.get('favicon')) urlBranding.favicon = params.get('favicon');
      if (params.get('font')) urlBranding.font = params.get('font');

      // 2. Storage
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

      const merged = { ...currentBranding, ...(stored || {}), ...urlBranding };
      applyAll(merged);

      if (Object.keys(urlBranding).length > 0) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      }

      // 3. Try to fetch fresh from API (/api/branding) if no URL name
      if (!urlBranding.name) {
        fetchBrandingApi();
      }

      // 4. Preview mode: disable heavy video autoplay
      if (params.get('preview') === '1') {
        window.__WHITELABEL_PREVIEW_MODE__ = true;
        // Pause all videos immediately (current + future via interval)
        function pauseAllVideos() {
          document.querySelectorAll('video').forEach(function(v) {
            v.pause();
            v.removeAttribute('autoplay');
            v.preload = 'none';
            // Replace src to prevent download
            if (v.currentSrc && !v._brandingPaused) {
              v._brandingPaused = true;
              v.pause();
            }
          });
        }
        pauseAllVideos();
        // Also catch videos added dynamically by React
        const videoObserver = new MutationObserver(function() {
          pauseAllVideos();
        });
        if (document.body) {
          videoObserver.observe(document.body, { childList: true, subtree: true });
        } else {
          document.addEventListener('DOMContentLoaded', function() {
            videoObserver.observe(document.body, { childList: true, subtree: true });
          });
        }
      }
    } catch (e) {
      console.warn('[Branding] Init error', e);
    }
  }


  async function fetchBrandingApi() {
    try {
      const origin = window.location.origin;
      // In standalone port 4173, Next.js is typically at 5173
      const apiUrl = origin.includes('4173')
        ? 'http://127.0.0.1:5173/api/branding'
        : '/api/branding';

      const res = await fetch(apiUrl, { mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.name || data.color)) {
          applyAll(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      }
    } catch {
      // Standalone mode without backend running is totally fine
    }
  }

  // Real-time synchronization listeners
  // 1. BroadcastChannel
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = function (event) {
        if (event.data && event.data.type === 'WHITELABEL_BRANDING_UPDATE') {
          applyAll(event.data.branding);
        }
      };
    } catch {}
  }

  // 2. postMessage (from iframe parent)
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'WHITELABEL_BRANDING_UPDATE') {
      applyAll(event.data.branding);
    }
  });

  // 3. Storage event (across tabs)
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        applyAll(parsed);
      } catch {}
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initFromStorageOrParams();
    });
  } else {
    initFromStorageOrParams();
  }

  // Expose global controller
  window.__WHITELABEL_BRANDING_CONTROLLER__ = {
    setBranding: applyAll,
    getBranding: () => currentBranding,
  };

  // Automatic redirect: completely bypass old landing page and internal prototype login
  try {
    const path = window.location.pathname;
    const search = window.location.search || '';
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tradingpro_token') : null;

    if (path === '/' || path === '/login' || path === '/index.html' || path === '/prototipo' || path === '/prototipo/') {
      if (token) {
        window.location.replace('/app' + search);
      } else {
        const query = search ? '&' + search.replace(/^\?/, '') : '';
        window.location.replace('/login?redirect=/app' + query);
      }
    } else if (path.startsWith('/app') && !token) {
      const query = search ? '&' + search.replace(/^\?/, '') : '';
      window.location.replace('/login?redirect=/app' + query);
    }
  } catch {}
})();
