import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateTenant, initialState, type Tenant } from '../lib/model';

void test('tenant validation supports custom branding properties', () => {
  const base = initialState('test@example.test').tenants[0];
  const tenant: Tenant = {
    ...base,
    name: 'Nexus Trading',
    color: '#00b4d8',
    secondaryColor: '#caf0f8',
    font: 'Montserrat',
    darkMode: true,
  };

  // Should validate without throwing
  validateTenant(tenant);

  // Invalid hex color should throw
  assert.throws(() => validateTenant({ ...tenant, color: 'not-a-color' }));
  // Missing name should throw
  assert.throws(() => validateTenant({ ...tenant, name: '' }));
});

void test('prototype index.html loads branding.js before other scripts', () => {
  const indexPath = join(process.cwd(), 'prototipo', 'index.html');
  assert.ok(existsSync(indexPath), 'prototipo/index.html should exist');

  const content = readFileSync(indexPath, 'utf-8');
  assert.ok(content.includes('<script src="/branding.js"></script>'), 'must include branding.js');
  
  const brandingIdx = content.indexOf('/branding.js');
  const mockApiIdx = content.indexOf('/mock-api.js');
  assert.ok(brandingIdx < mockApiIdx, 'branding.js must load before mock-api.js');
});

void test('branding.js contains essential synchronization and styling mechanisms', () => {
  const brandingPath = join(process.cwd(), 'prototipo', 'branding.js');
  assert.ok(existsSync(brandingPath), 'prototipo/branding.js should exist');

  const content = readFileSync(brandingPath, 'utf-8');

  // Verify CSS variable overrides
  assert.ok(content.includes('--lime'), 'must update --lime CSS variable');
  assert.ok(content.includes('--buy'), 'must update --buy CSS variable');
  assert.ok(content.includes('--brand-primary'), 'must set --brand-primary');
  assert.ok(content.includes('whitelabel-brand-styles'), 'must inject dynamic style sheet');

  // Verify real-time listeners
  assert.ok(content.includes('BroadcastChannel'), 'must support BroadcastChannel');
  assert.ok(content.includes('whitelabel_branding'), 'must use whitelabel_branding channel name');
  assert.ok(content.includes('WHITELABEL_BRANDING_UPDATE'), 'must handle WHITELABEL_BRANDING_UPDATE message');
  assert.ok(content.includes('addEventListener(\'message\''), 'must support window postMessage for iframes');
  assert.ok(content.includes('addEventListener(\'storage\''), 'must support storage events across tabs');

  // Verify DOM updates
  assert.ok(content.includes('applyBrandTextAndLogo'), 'must update brand text and logo in DOM');
  assert.ok(content.includes('isSameBranding'), 'must deduplicate branding updates to prevent infinite loops');
  assert.ok(content.includes('document.title'), 'must update document title');
});

void test('public branding API route exists and supports CORS', () => {
  const routePath = join(process.cwd(), 'app', 'api', 'branding', 'route.ts');
  assert.ok(existsSync(routePath), 'app/api/branding/route.ts should exist');

  const content = readFileSync(routePath, 'utf-8');
  assert.ok(content.includes('Access-Control-Allow-Origin'), 'must specify Access-Control-Allow-Origin');
  assert.ok(content.includes('OPTIONS'), 'must provide OPTIONS handler for CORS preflight');
  assert.ok(content.includes('GET'), 'must provide GET handler');
});

void test('prototype bundle files contain reactive WlHeroBrand, ht and WlSplashWord components', () => {
  const prototipoBundle = join(process.cwd(), 'prototipo', 'assets', 'index-D08ZekFh.js');
  const publicBundle = join(process.cwd(), 'public', 'assets', 'index-D08ZekFh.js');

  assert.ok(existsSync(prototipoBundle), 'prototipo bundle must exist');
  assert.ok(existsSync(publicBundle), 'public bundle must exist');

  const protContent = readFileSync(prototipoBundle, 'utf-8');
  const pubContent = readFileSync(publicBundle, 'utf-8');

  for (const [name, c] of [['prototipo', protContent], ['public', pubContent]]) {
    assert.ok(c.includes('function WlHeroBrand()'), `${name} bundle must define WlHeroBrand`);
    assert.ok(c.includes('function WlSplashWord()'), `${name} bundle must define WlSplashWord`);
    assert.ok(c.includes('function ht({size:t=26})'), `${name} bundle must define ht`);
    assert.ok(c.includes('WlHeroBrand'), `${name} bundle must use WlHeroBrand`);
    assert.ok(c.includes('WlSplashWord'), `${name} bundle must use WlSplashWord`);
    assert.ok(c.includes('_b.favicon'), `${name} bundle must support fallback to favicon in ht`);
  }
});

void test('branding.js handles favicon and tab icon dynamic updates', () => {
  const brandingPath = join(process.cwd(), 'prototipo', 'branding.js');
  const content = readFileSync(brandingPath, 'utf-8');

  assert.ok(content.includes('updateFavicons'), 'must define updateFavicons helper');
  assert.ok(content.includes('apple-touch-icon'), 'must update apple-touch-icon');
  assert.ok(content.includes('branding.favicon'), 'must read branding.favicon');
});

void test('login templates are supported in model and branding API', () => {
  const base = initialState('test@example.test').tenants[0];
  const tenant: Tenant = {
    ...base,
    loginTemplate: 'centered',
  };
  validateTenant(tenant);
  assert.equal(tenant.loginTemplate, 'centered');

  const routePath = join(process.cwd(), 'app', 'api', 'branding', 'route.ts');
  const content = readFileSync(routePath, 'utf-8');
  assert.ok(content.includes('loginTemplate'), 'branding API must return loginTemplate');

  const protRoute = join(process.cwd(), 'app', 'prototipo', '[[...slug]]', 'route.ts');
  const protContent = readFileSync(protRoute, 'utf-8');
  assert.ok(protContent.includes("join(process.cwd(), 'prototipo')"), 'prototipo route must serve prototipo files');
});


