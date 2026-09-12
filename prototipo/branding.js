(function () {
  'use strict';
  const STORAGE_KEY = 'whitelabel_tenant_branding';
  const CHANNEL_NAME = 'whitelabel_branding';
  let currentBranding = { name: 'TradingPro', color: '#96d600', secondaryColor: '#ffffff', logo: '', favicon: '', font: 'Inter', loginTemplate: 'split' };
  let initialized = false;
  function isSameBranding(a, b) {
    return ['name', 'color', 'secondaryColor', 'logo', 'favicon', 'font', 'darkMode', 'loginTemplate'].every((key) => a[key] === b[key]);
  }
  function applyColors(branding) {
    const palette = window.TradingProPalette.create(branding.color, branding.secondaryColor);
    const variables = {
      '--lime': palette.primary, '--lime-dim': palette.hover, '--buy': palette.primary,
      '--brand-primary': palette.primary, '--brand-rgb': palette.rgb, '--brand-secondary': palette.secondary,
      '--brand-accent': palette.accent, '--brand-complement': palette.complement,
      '--brand-hover': palette.hover, '--brand-on-primary': palette.onPrimary, '--brand-on-hover': palette.onHover,
      '--brand-subtle': palette.subtle, '--dark': palette.background, '--bg': palette.background,
      '--panel': palette.surface, '--panel-2': palette.surfaceRaised, '--border': palette.border,
      '--text': palette.text, '--muted': palette.muted,
    };
    Object.entries(variables).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
    const font = ['Inter', 'Sora', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Nunito', 'DM Sans', 'Outfit', 'Plus Jakarta Sans', 'Manrope'].includes(branding.font) ? branding.font : 'Inter';
    document.documentElement.style.setProperty('--font-body', `"${font}", system-ui, sans-serif`);
    document.documentElement.style.setProperty('--font-display', `"${font}", system-ui, sans-serif`);
    let fontLink = document.getElementById('brand-font-stylesheet');
    if (!fontLink) { fontLink = document.createElement('link'); fontLink.id = 'brand-font-stylesheet'; fontLink.rel = 'stylesheet'; document.head.appendChild(fontLink); }
    const fontHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800&display=swap`;
    if (fontLink.getAttribute('href') !== fontHref) fontLink.href = fontHref;
    let style = document.getElementById('whitelabel-brand-styles');
    if (!style) { style = document.createElement('style'); style.id = 'whitelabel-brand-styles'; document.head.appendChild(style); }
    style.textContent = `
      .btn-lime,.btn-buy,.hero-primary,.tour-button{background:var(--brand-primary)!important;color:var(--brand-on-primary)!important}
      .btn-lime:hover,.btn-buy:hover{background:var(--brand-hover)!important;color:var(--brand-on-hover)!important}
      .lime,.pos,.brand-accent,.history-eyebrow,.badge-demo,.tabbar a.active{color:var(--brand-accent)!important}
      .badge-demo,.tabbar a.active,.mode-chip-entry{background:var(--brand-subtle)!important}
      .history-chart-wrap polyline{stroke:var(--brand-accent)!important}.history-chart-wrap circle{fill:var(--brand-accent)!important}
      input:focus,select:focus,textarea:focus{border-color:var(--brand-accent)!important}
      .tour-cta{background:var(--panel)!important;border-color:var(--border)!important}
      .channel-icon-ticket{background:var(--brand-subtle)!important;color:var(--brand-accent)!important;border-color:var(--border)!important}
      .channel-ticket:after{background:linear-gradient(90deg,var(--brand-primary),var(--brand-secondary))!important}
      .tp-auth-brand strong{color:var(--text)}
    `;
  }
  let lastAppliedFavicon = '';
  function updateFavicons(branding) {
    const palette = window.TradingProPalette.create(branding.color);
    const iconUrl = branding.favicon || branding.logo || 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${palette.primary}"/><path d="m6 21 7-7 5 4 8-9" fill="none" stroke="${palette.onPrimary}" stroke-width="3"/></svg>`);
    if (iconUrl === lastAppliedFavicon) return;
    lastAppliedFavicon = iconUrl;
    document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach((element) => element.remove());
    const link = document.createElement('link'); link.rel = 'icon'; link.href = iconUrl; document.head.appendChild(link);
  }
  function applyBrandTextAndLogo(branding) {
    document.title = `${branding.name || 'TradingPro'} | Plataforma de Trading`;
    updateFavicons(branding);
  }
  function applyAll(branding, persist = false) {
    if (!branding || typeof branding !== 'object') return;
    const next = { ...currentBranding, ...branding };
    if (initialized && isSameBranding(next, currentBranding)) return;
    initialized = true;
    currentBranding = next;
    window.__WHITELABEL_BRANDING__ = next;
    applyColors(next);
    applyBrandTextAndLogo(next);
    if (persist) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {} }
    window.dispatchEvent(new CustomEvent('whitelabel:update', { detail: next }));
  }
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch {}
  const params = new URLSearchParams(window.location.search);
  const query = {};
  ['name', 'color', 'secondaryColor', 'logo', 'favicon', 'font', 'loginTemplate'].forEach((key) => { if (params.has(key)) query[key] = params.get(key); });
  if (params.has('template')) query.loginTemplate = params.get('template');
  applyAll({ ...stored, ...query }, params.get('preview') !== '1');
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => { if (event.data?.type === 'WHITELABEL_BRANDING_UPDATE') applyAll(event.data.branding, params.get('preview') !== '1'); };
  }
  window.addEventListener('message', (event) => {
    if (event.origin === window.location.origin && event.data?.type === 'WHITELABEL_BRANDING_UPDATE') applyAll(event.data.branding, params.get('preview') !== '1');
  });
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) { try { applyAll(JSON.parse(event.newValue)); } catch {} }
  });
  window.__WHITELABEL_BRANDING_CONTROLLER__ = { setBranding: applyAll, getBranding: () => currentBranding };
  // Routing belongs to the SPA router; never redirect into the administrative login.
})();
