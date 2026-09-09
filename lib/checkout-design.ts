import type { Checkout } from './model';

export const fonts = [
  'Inter',
  'Sora',
  'Roboto',
  'Montserrat',
  'Poppins',
  'Georgia',
] as const;
export type FontName = (typeof fonts)[number];
export type Device = 'desktop' | 'mobile';
export const blockKinds = [
  'brand',
  'banner',
  'title',
  'description',
  'price',
  'benefits',
  'reviews',
  'bump',
  'form',
  'text',
  'image',
  'divider',
  'footer',
] as const;
export type BlockKind = (typeof blockKinds)[number];
export type Zone = 'header' | 'main' | 'aside' | 'footer';
export type BlockStyle = {
  font: FontName;
  size: number;
  weight: number;
  lineHeight: number;
  align: 'left' | 'center' | 'right';
  width: number;
  padding: number;
  space: number;
  radius: number;
  color: string;
  background: string;
  height: number;
  fit: 'cover' | 'contain';
};
export type Block = {
  id: string;
  kind: BlockKind;
  label: string;
  zone: Zone;
  visible: boolean;
  content: string;
  src: string;
  mobileSrc: string;
  desktop: BlockStyle;
  mobile: BlockStyle;
};
export type FormField = {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'tel';
  required: boolean;
  enabled: boolean;
  width: 50 | 100;
};
export type CheckoutDesign = {
  version: 2;
  layout: 'columns' | 'stacked';
  formSide: 'left' | 'right';
  font: FontName;
  maxWidth: number;
  padding: number;
  mobilePadding: number;
  gap: number;
  mobileGap: number;
  asideWidth: number;
  blocks: Block[];
  mobileOrder: string[];
  form: {
    title: string;
    fields: FormField[];
    inputHeight: number;
    mobileInputHeight: number;
    inputRadius: number;
    inputColor: string;
    inputBackground: string;
    inputBorder: string;
    button: BlockStyle;
    mobileButton: BlockStyle;
  };
};
export const labels: Record<BlockKind, string> = {
  brand: 'Marca',
  banner: 'Banner',
  title: 'Título',
  description: 'Descrição',
  price: 'Preço',
  benefits: 'Benefícios',
  reviews: 'Avaliações',
  bump: 'Order bump',
  form: 'Formulário',
  text: 'Texto livre',
  image: 'Imagem',
  divider: 'Divisor',
  footer: 'Rodapé',
};
export const zones: Record<Zone, string> = {
  header: 'Topo',
  main: 'Conteúdo',
  aside: 'Coluna lateral',
  footer: 'Rodapé',
};
export function baseStyle(size = 16): BlockStyle {
  return {
    font: 'Inter',
    size,
    weight: 400,
    lineHeight: 1.6,
    align: 'left',
    width: 100,
    padding: 0,
    space: 20,
    radius: 0,
    color: '#283022',
    background: 'transparent',
    height: 0,
    fit: 'contain',
  };
}
export function createBlock(kind: BlockKind, zone: Zone = 'main'): Block {
  const desktop = baseStyle(
    kind === 'title'
      ? 30
      : kind === 'price'
        ? 32
        : kind === 'brand'
          ? 20
          : kind === 'footer'
            ? 12
            : 16,
  );
  if (['title', 'price', 'brand'].includes(kind)) {
    desktop.font = 'Sora';
    desktop.weight = 600;
    desktop.lineHeight = 1.3;
  }
  if (['banner', 'image'].includes(kind)) {
    desktop.height = 200;
    desktop.radius = 6;
    desktop.fit = 'cover';
  }
  if (kind === 'form') {
    desktop.padding = 24;
    desktop.radius = 8;
    desktop.background = '#f7f9f4';
    desktop.size = 14;
  }
  if (kind === 'divider') {
    desktop.height = 1;
    desktop.background = '#dde3d7';
  }
  const mobile = {
    ...desktop,
    size: kind === 'title' ? 26 : desktop.size,
    padding: kind === 'form' ? 18 : desktop.padding,
    height: ['banner', 'image'].includes(kind) ? 160 : desktop.height,
  };
  return {
    id: crypto.randomUUID(),
    kind,
    label: labels[kind],
    zone,
    visible: true,
    content: kind === 'text' ? 'Seu texto aqui' : '',
    src: '',
    mobileSrc: '',
    desktop,
    mobile,
  };
}
export function defaultDesign(c: Checkout): CheckoutDesign {
  const specs: [BlockKind, Zone][] = [
    ['brand', 'header'],
    ['banner', 'header'],
    ['title', 'main'],
    ['description', 'main'],
    ['price', 'main'],
    ...c.sections.map((k) => [k as BlockKind, 'main'] as [BlockKind, Zone]),
    ['form', 'aside'],
    ['footer', 'footer'],
  ];
  const blocks = specs.map(([kind, zone], index) => ({
    ...createBlock(kind, zone),
    id: c.id.slice(0, 24) + (index + 1).toString(16).padStart(12, '0'),
  }));
  const button = {
    ...baseStyle(14),
    weight: 600,
    height: 48,
    padding: 12,
    radius: 5,
    background: c.color,
    color: contrast(c.color),
    align: 'center' as const,
    space: 0,
  };
  return {
    version: 2,
    layout: 'columns',
    formSide: 'right',
    font: 'Inter',
    maxWidth: 1080,
    padding: 32,
    mobilePadding: 18,
    gap: 32,
    mobileGap: 18,
    asideWidth: 46,
    blocks,
    mobileOrder: blocks.map((b) => b.id),
    form: {
      title: 'Seus dados',
      fields: [
        {
          id: 'name',
          label: 'Nome completo',
          placeholder: 'Seu nome',
          type: 'text',
          required: true,
          enabled: true,
          width: 100,
        },
        {
          id: 'email',
          label: 'E-mail',
          placeholder: 'voce@email.com',
          type: 'email',
          required: true,
          enabled: true,
          width: 100,
        },
        {
          id: 'phone',
          label: 'Celular',
          placeholder: '(00) 00000-0000',
          type: 'tel',
          required: false,
          enabled: true,
          width: 100,
        },
      ],
      inputHeight: 44,
      mobileInputHeight: 48,
      inputRadius: 5,
      inputColor: '#283022',
      inputBackground: '#ffffff',
      inputBorder: '#dce3d5',
      button,
      mobileButton: { ...button },
    },
  };
}
export function withDesign(c: Checkout): Checkout & { design: CheckoutDesign } {
  return { ...c, design: c.design || defaultDesign(c) };
}
export function contrast(color: string) {
  const value = color.replace('#', '');
  return parseInt(value.slice(0, 2), 16) * 0.299 +
    parseInt(value.slice(2, 4), 16) * 0.587 +
    parseInt(value.slice(4, 6), 16) * 0.114 >
    155
    ? '#172006'
    : '#ffffff';
}
export function reorder<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length)
    return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
const color = (v: unknown) =>
  typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
const number = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const text = (v: unknown, max = 5000) =>
  typeof v === 'string' && v.length <= max;
const media = (v: unknown) =>
  typeof v === 'string' &&
  (!v || /^\/api\/media\/[a-f0-9-]{36}$/.test(v) || /^https:\/\//i.test(v));
export function validateStyle(s: BlockStyle) {
  if (
    !s ||
    !fonts.includes(s.font) ||
    !number(s.size, 12, 96) ||
    ![400, 500, 600, 700, 800].includes(s.weight) ||
    !number(s.lineHeight, 1, 2.5) ||
    !['left', 'center', 'right'].includes(s.align) ||
    !number(s.width, 20, 100) ||
    !number(s.padding, 0, 80) ||
    !number(s.space, 0, 100) ||
    !number(s.radius, 0, 40) ||
    !color(s.color) ||
    (s.background !== 'transparent' && !color(s.background)) ||
    !number(s.height, 0, 600) ||
    !['cover', 'contain'].includes(s.fit)
  )
    throw Error('Estilo de bloco inválido.');
}
export function validateDesign(d: CheckoutDesign) {
  if (
    !d ||
    d.version !== 2 ||
    !['columns', 'stacked'].includes(d.layout) ||
    !['left', 'right'].includes(d.formSide) ||
    !fonts.includes(d.font) ||
    !number(d.maxWidth, 360, 1440) ||
    !number(d.padding, 0, 80) ||
    !number(d.mobilePadding, 0, 40) ||
    !number(d.gap, 0, 80) ||
    !number(d.mobileGap, 0, 48) ||
    !number(d.asideWidth, 30, 65) ||
    !Array.isArray(d.blocks) ||
    d.blocks.length > 40 ||
    d.blocks.length < 1
  )
    throw Error('Layout de checkout inválido.');
  const ids = new Set<string>();
  let forms = 0;
  for (const b of d.blocks) {
    if (
      !b ||
      !text(b.id, 60) ||
      !/^[a-f0-9-]{36}$/.test(b.id) ||
      ids.has(b.id) ||
      !blockKinds.includes(b.kind) ||
      !Object.keys(zones).includes(b.zone) ||
      typeof b.visible !== 'boolean' ||
      !text(b.label, 100) ||
      !text(b.content) ||
      !media(b.src) ||
      !media(b.mobileSrc)
    )
      throw Error('Bloco inválido.');
    ids.add(b.id);
    if (b.kind === 'form') {
      forms++;
      if (!b.visible) throw Error('O formulário precisa estar visível.');
    }
    validateStyle(b.desktop);
    validateStyle(b.mobile);
  }
  if (
    forms !== 1 ||
    !Array.isArray(d.mobileOrder) ||
    d.mobileOrder.length !== ids.size ||
    new Set(d.mobileOrder).size !== ids.size ||
    d.mobileOrder.some((id) => !ids.has(id))
  )
    throw Error('Ordem de blocos inválida.');
  const f = d.form;
  if (
    !f ||
    !text(f.title, 100) ||
    !Array.isArray(f.fields) ||
    f.fields.length < 2 ||
    f.fields.length > 12 ||
    new Set(f.fields.map((x) => x.id)).size !== f.fields.length ||
    !number(f.inputHeight, 32, 80) ||
    !number(f.mobileInputHeight, 32, 80) ||
    !number(f.inputRadius, 0, 24) ||
    !color(f.inputColor) ||
    !color(f.inputBackground) ||
    !color(f.inputBorder)
  )
    throw Error('Formulário inválido.');
  for (const field of f.fields) {
    if (
      !field ||
      !text(field.id, 60) ||
      !/^[a-zA-Z0-9-]+$/.test(field.id) ||
      !text(field.label, 80) ||
      !field.label.trim() ||
      !text(field.placeholder, 160) ||
      !['text', 'email', 'tel'].includes(field.type) ||
      typeof field.required !== 'boolean' ||
      typeof field.enabled !== 'boolean' ||
      ![50, 100].includes(field.width)
    )
      throw Error('Campo de formulário inválido.');
  }
  if (
    !f.fields.some(
      (x) => x.id === 'email' && x.type === 'email' && x.enabled && x.required,
    )
  )
    throw Error('O campo de e-mail é obrigatório.');
  validateStyle(f.button);
  validateStyle(f.mobileButton);
}
