import { validateDesign, type CheckoutDesign } from './checkout-design';
export type Tenant = {
  id: string;
  name: string;
  slug: string;
  admin: string;
  email: string;
  color: string;
  logo: string;
  status: 'active' | 'suspended';
  domain: string;
  connections: string[];
  created: string;
};
export type Review = { id: string; name: string; text: string; rating: number };
export type Checkout = {
  id: string;
  tenantId: string;
  name: string;
  title: string;
  subtitle: string;
  price: number;
  color: string;
  background: string;
  button: string;
  banner: string;
  mobileBanner: string;
  benefits: string;
  metaTitle: string;
  metaDescription: string;
  pixel: string;
  analytics: string;
  upsell: boolean;
  upsellTitle: string;
  upsellPrice: number;
  bump: boolean;
  bumpTitle: string;
  bumpPrice: number;
  reviews: Review[];
  showReviews: boolean;
  notifications: boolean;
  notificationEmail: string;
  published: boolean;
  publishedData?: string;
  updated: string;
  sections: string[];
  design?: CheckoutDesign;
};
export type State = {
  tenants: Tenant[];
  checkouts: Checkout[];
  activity: { id: string; text: string; time: string }[];
};
export type Session = {
  role: 'admin' | 'tenant';
  tenantId?: string;
  email: string;
  revision: number;
  state: State;
};
export const providers = ['XGlobal', 'Bybit', 'Admiral', 'XR'];
function requireStrings(value: unknown, keys: string[]) {
  if (!value || typeof value !== 'object') throw Error('Formulário inválido.');
  for (const key of keys) {
    const item = (value as Record<string, unknown>)[key];
    if (typeof item !== 'string' || item.length > 5000)
      throw Error(`Campo inválido: ${key}`);
  }
}
export const money = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    n,
  );
export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
export function newCheckout(tenant: Tenant): Checkout {
  return {
    id: crypto.randomUUID(),
    tenantId: tenant.id,
    name: 'Plano Pro',
    title: 'Dê o próximo passo nas suas operações',
    subtitle: 'Tecnologia e controle para a sua jornada no mercado.',
    price: 197,
    color: tenant.color,
    background: '#ffffff',
    button: 'Continuar para pagamento',
    banner: '',
    mobileBanner: '',
    benefits: 'Acesso à plataforma\nConexões habilitadas\nSuporte da operação',
    metaTitle: `Plano Pro | ${tenant.name}`,
    metaDescription: '',
    pixel: '',
    analytics: '',
    upsell: false,
    upsellTitle: 'Mentoria individual',
    upsellPrice: 97,
    bump: false,
    bumpTitle: 'Material complementar',
    bumpPrice: 29,
    showReviews: false,
    reviews: [],
    notifications: false,
    notificationEmail: tenant.email,
    published: false,
    updated: new Date().toISOString(),
    sections: ['benefits', 'reviews', 'bump'],
  };
}
export function initialState(email: string): State {
  const t: Tenant = {
    id: crypto.randomUUID(),
    name: 'TradingPro',
    slug: 'tradingpro',
    admin: 'Administrador',
    email,
    color: '#96d600',
    logo: '',
    status: 'active',
    domain: '',
    connections: ['XGlobal'],
    created: new Date().toISOString(),
  };
  return { tenants: [t], checkouts: [newCheckout(t)], activity: [] };
}
export function validImage(url: string) {
  return (
    typeof url === 'string' &&
    (!url ||
      /^https:\/\//i.test(url) ||
      /^\/api\/media\/[a-f0-9-]{36}$/.test(url))
  );
}
export function validateTenant(t: Tenant) {
  requireStrings(t, [
    'id',
    'name',
    'slug',
    'admin',
    'email',
    'color',
    'logo',
    'domain',
  ]);
  if (!/^[a-f0-9-]{36}$/.test(t.id) || !t.admin.trim())
    throw Error('Administrador ou identificação inválida.');
  if (
    !t ||
    !t.name?.trim() ||
    t.name.length > 100 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.slug) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email) ||
    !/^#[0-9a-f]{6}$/i.test(t.color) ||
    !validImage(t.logo) ||
    !['active', 'suspended'].includes(t.status) ||
    !Array.isArray(t.connections) ||
    t.connections.some((p) => !providers.includes(p))
  )
    throw Error('Revise nome, slug, e-mail e identidade da operação.');
  if (
    t.domain &&
    !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(t.domain)
  )
    throw Error('Informe um domínio válido, sem https://.');
}
export function validateCheckout(c: Checkout) {
  if (c?.design) validateDesign(c.design);
  requireStrings(c, [
    'id',
    'tenantId',
    'name',
    'title',
    'subtitle',
    'color',
    'background',
    'button',
    'banner',
    'mobileBanner',
    'benefits',
    'metaTitle',
    'metaDescription',
    'pixel',
    'analytics',
    'upsellTitle',
    'bumpTitle',
    'notificationEmail',
  ]);
  if (
    !/^[a-f0-9-]{36}$/.test(c.id) ||
    !/^[a-f0-9-]{36}$/.test(c.tenantId) ||
    !c.button.trim()
  )
    throw Error('Identificação ou botão inválido.');
  for (const k of ['upsell', 'bump', 'showReviews', 'notifications'] as const)
    if (typeof c[k] !== 'boolean') throw Error('Configuração inválida.');
  if (
    !c ||
    !c.name?.trim() ||
    !c.title?.trim() ||
    !Number.isFinite(c.price) ||
    c.price <= 0 ||
    c.price > 1000000 ||
    !/^#[0-9a-f]{6}$/i.test(c.color) ||
    !/^#[0-9a-f]{6}$/i.test(c.background) ||
    !validImage(c.banner) ||
    !validImage(c.mobileBanner)
  )
    throw Error('Revise título, preço e imagens do checkout.');
  if (c.pixel && !/^\d{5,30}$/.test(c.pixel))
    throw Error('O Meta Pixel deve conter apenas números (5 a 30 dígitos).');
  if (c.analytics && !/^G-[A-Z0-9]+$/.test(c.analytics))
    throw Error('Informe um ID GA4 no formato G-XXXXXXXX.');
  if (
    !Array.isArray(c.reviews) ||
    c.reviews.length > 20 ||
    c.reviews.some(
      (r) =>
        !r.name?.trim() ||
        !r.text?.trim() ||
        !Number.isInteger(r.rating) ||
        r.rating < 1 ||
        r.rating > 5,
    )
  )
    throw Error('Revise as avaliações.');
  for (const k of ['upsellPrice', 'bumpPrice'] as const)
    if (!Number.isFinite(c[k]) || c[k] < 0)
      throw Error('Preço adicional inválido.');
  if (
    c.notifications &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.notificationEmail)
  )
    throw Error('Informe o e-mail das notificações.');
  if (
    !Array.isArray(c.sections) ||
    c.sections.length !== 3 ||
    new Set(c.sections).size !== 3 ||
    c.sections.some((s) => !['benefits', 'reviews', 'bump'].includes(s))
  )
    throw Error('Ordem de blocos inválida.');
}
