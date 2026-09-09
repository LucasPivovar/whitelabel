'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Undo2,
  Redo2,
  Save,
  Globe,
  Eye,
  EyeOff,
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Monitor,
  Smartphone,
  Layers,
  Settings2,
  Type,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LayoutTemplate,
  PanelTop,
  FormInput,
  Tag,
  Star,
  Minus,
  Palette,
  MousePointer2,
  ChevronRight,
  Check,
  Mail,
  Megaphone,
  Activity,
  Link,
} from '@/components/icons';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import {
  Field,
  IconButton,
  Choice,
  Toggle,
  NumberControl,
  ColorControl,
  ImageControl,
} from './editor-controls';
import CheckoutDocument from './checkout-document';
import { type Checkout, type Tenant } from '@/lib/model';
import {
  withDesign,
  createBlock,
  reorder,
  fonts,
  labels,
  zones,
  type Block,
  type BlockKind,
  type BlockStyle,
  type CheckoutDesign,
  type Device,
  type Zone,
} from '@/lib/checkout-design';

const icons = {
  brand: Palette,
  banner: PanelTop,
  title: Type,
  description: AlignLeft,
  price: Tag,
  benefits: Check,
  reviews: Star,
  bump: Plus,
  form: FormInput,
  text: Type,
  image: ImageIcon,
  divider: Minus,
  footer: PanelTop,
};
const zoneOptions = Object.entries(zones).map(([value, label]) => ({
  value,
  label,
}));
const fontOptions = fonts.map((font) => ({ value: font, label: font }));
type Draft = Checkout & { design: CheckoutDesign };

function primitiveValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

export default function CheckoutBuilder({
  checkout,
  tenants,
  busy,
  onClose,
  onSave,
  onError,
}: {
  checkout: Checkout;
  tenants: Tenant[];
  busy: boolean;
  onClose: () => void;
  onSave: (c: Checkout, publish?: boolean) => Promise<Checkout | null>;
  onError: (s: string) => void;
}) {
  const [c, setC] = useState<Draft>(() => withDesign(checkout));
  const [saved, setSaved] = useState(() =>
    JSON.stringify(withDesign(checkout)),
  );
  const [history, setHistory] = useState<Draft[]>([]);
  const [future, setFuture] = useState<Draft[]>([]);
  const [device, setDevice] = useState<Device>('desktop');
  const [selected, setSelected] = useState('page');
  const [inspectorTab, setInspectorTab] = useState('content');
  const [leftTab, setLeftTab] = useState('layers');
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [mobilePanel, setMobilePanel] = useState('canvas');
  const [fieldId, setFieldId] = useState('name');
  const [zoom, setZoom] = useState('fit');
  const [availableWidth, setAvailableWidth] = useState(800);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragged = useRef<string | null>(null);
  const d = c.design;
  const tenant = tenants.find((t) => t.id === c.tenantId)!;
  const active = d.blocks.find((b) => b.id === selected);
  const dirty = JSON.stringify(c) !== saved;
  function commit(next: Draft) {
    setHistory((h) => [...h, c].slice(-60));
    setFuture([]);
    setC(next);
  }
  function update<K extends keyof Checkout>(key: K, value: Checkout[K]) {
    commit({ ...c, [key]: value });
  }
  function changeDesign(patch: Partial<CheckoutDesign>) {
    commit({ ...c, design: { ...d, ...patch } });
  }
  function changeBlock(patch: Partial<Block>) {
    if (active)
      changeDesign({
        blocks: d.blocks.map((b) =>
          b.id === active.id ? { ...b, ...patch } : b,
        ),
      });
  }
  function changeForm(patch: Partial<CheckoutDesign['form']>) {
    changeDesign({ form: { ...d.form, ...patch } });
  }
  function select(id: string) {
    setSelected(id);
    setInspectorTab('content');
    setMobilePanel('properties');
  }
  const undo = useCallback(() => {
    if (!history.length) return;
    setFuture((f) => [c, ...f]);
    setC(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  }, [history, c]);
  const redo = useCallback(() => {
    if (!future.length) return;
    setHistory((h) => [...h, c]);
    setC(future[0]);
    setFuture((f) => f.slice(1));
  }, [future, c]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z' ||
          (target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName)))) return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) =>
      setAvailableWidth(entries[0].contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  async function save(publish?: boolean) {
    const result = await onSave(c, publish);
    if (result) {
      const next = withDesign(result);
      setC(next);
      setSaved(JSON.stringify(next));
    }
  }
  function move(id: string, target: string) {
    if (id === target) return;
    if (device === 'mobile') {
      changeDesign({
        mobileOrder: reorder(
          d.mobileOrder,
          d.mobileOrder.indexOf(id),
          d.mobileOrder.indexOf(target),
        ),
      });
      return;
    }
    const source = d.blocks.find((b) => b.id === id),
      dest = d.blocks.find((b) => b.id === target);
    if (!source || !dest) return;
    const items = d.blocks.map((b) =>
      b.id === id ? { ...b, zone: dest.zone } : b,
    );
    changeDesign({
      blocks: reorder(
        items,
        items.findIndex((b) => b.id === id),
        items.findIndex((b) => b.id === target),
      ),
    });
  }
  function addBlock(kind: BlockKind) {
    const block = createBlock(kind, active?.zone || 'main');
    changeDesign({
      blocks: [...d.blocks, block],
      mobileOrder: [...d.mobileOrder, block.id],
    });
    select(block.id);
    setAddOpen(false);
  }
  function removeBlock() {
    if (!active || active.kind === 'form') return;
    changeDesign({
      blocks: d.blocks.filter((b) => b.id !== active.id),
      mobileOrder: d.mobileOrder.filter((id) => id !== active.id),
    });
    setSelected('page');
  }
  const field = d.form.fields.find((f) => f.id === fieldId) || d.form.fields[0];
  const ordered =
    device === 'mobile'
      ? d.mobileOrder.map((id) => d.blocks.find((b) => b.id === id)!)
      : d.blocks;
  const frameWidth = device === 'mobile' ? 375 : d.maxWidth;
  const scale =
    zoom === 'fit'
      ? Math.max(0.15, Math.min(1, (availableWidth - 48) / frameWidth))
      : Number(zoom) / 100;
  const input = (label: string, key: keyof Checkout, type = 'text') => (
    <Field label={label}>
      <input
        type={type}
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? '0.01' : undefined}
        value={primitiveValue(c[key])}
        onChange={(e) =>
          update(
            key,
            (type === 'number'
              ? Number(e.target.value)
              : e.target.value) as never,
          )
        }
      />
    </Field>
  );
  const area = (label: string, key: keyof Checkout) => (
    <Field label={label}>
      <textarea
        rows={4}
        value={primitiveValue(c[key])}
        onChange={(e) => update(key, e.target.value as never)}
      />
    </Field>
  );
  const blockText = (
    label: string,
    value: string,
    onChange: (v: string) => void,
  ) => (
    <Field label={label}>
      <textarea
        value={value}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
  function renderLayers(items: Block[]) {
    return items.map((b, i) => {
      const Icon = icons[b.kind];
      return (
        <div
          key={b.id}
          draggable
          onDragStart={(e) => {
            dragged.current = b.id;
            e.dataTransfer.setData('text/plain', b.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => {
            dragged.current = null;
          }}
          onDragOver={(e) => {
            if (dragged.current) e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const from = dragged.current;
            if (from) move(from, b.id);
            dragged.current = null;
          }}
          className={`layer-row ${selected === b.id ? 'selected' : ''} ${!b.visible ? 'muted-layer' : ''}`}
        >
          <GripVertical size={13} className="grip" />
          <button className="layer-name" onClick={() => select(b.id)}>
            <Icon size={16} />
            <span>{b.label}</span>
          </button>
          <div className="layer-actions">
            <IconButton
              label={`Mover ${b.label} acima`}
              disabled={i === 0}
              onClick={() => move(b.id, items[i - 1].id)}
            >
              <ArrowUp size={12} />
            </IconButton>
            <IconButton
              label={`Mover ${b.label} abaixo`}
              disabled={i === items.length - 1}
              onClick={() => move(b.id, items[i + 1].id)}
            >
              <ArrowDown size={12} />
            </IconButton>
          </div>
        </div>
      );
    });
  }
  function styleInspector(
    style: BlockStyle,
    change: (patch: Partial<BlockStyle>) => void,
  ) {
    return (
      <>
        <Choice
          label="Fonte"
          value={style.font}
          options={fontOptions}
          onChange={(v) => change({ font: v as BlockStyle['font'] })}
        />
        <div className="inspector-pair">
          <NumberControl
            label="Tamanho"
            value={style.size}
            min={12}
            max={96}
            onChange={(size) => change({ size })}
          />
          <Choice
            label="Peso"
            value={String(style.weight)}
            options={[400, 500, 600, 700, 800].map((n) => ({
              value: String(n),
              label: String(n),
            }))}
            onChange={(v) => change({ weight: Number(v) })}
          />
        </div>
        <NumberControl
          label="Altura da linha"
          unit="×"
          value={style.lineHeight}
          min={1}
          max={2.5}
          step={0.1}
          onChange={(lineHeight) => change({ lineHeight })}
        />
        <div className="editor-field">
          <span>Alinhamento</span>
          <div className="alignment-tools">
            {(
              [
                ['left', AlignLeft, 'À esquerda'],
                ['center', AlignCenter, 'Centralizado'],
                ['right', AlignRight, 'À direita'],
              ] as const
            ).map(([v, Icon, label]) => (
              <IconButton
                key={v}
                label={label}
                active={style.align === v}
                onClick={() => change({ align: v })}
              >
                <Icon size={17} />
              </IconButton>
            ))}
          </div>
        </div>
        <ColorControl
          label="Cor do texto"
          value={style.color}
          onChange={(color) => change({ color })}
        />
        <ColorControl
          label="Cor de fundo"
          value={style.background}
          onChange={(background) => change({ background })}
          transparent
        />
        <hr />
        <NumberControl
          label="Largura"
          unit="%"
          value={style.width}
          min={20}
          max={100}
          onChange={(width) => change({ width })}
        />
        <NumberControl
          label={
            active && ['image', 'banner', 'brand'].includes(active.kind)
              ? 'Altura (0 = automática)'
              : 'Altura mínima'
          }
          value={style.height}
          min={0}
          max={600}
          onChange={(height) => change({ height })}
        />
        <NumberControl
          label="Espaçamento interno"
          value={style.padding}
          min={0}
          max={80}
          onChange={(padding) => change({ padding })}
        />
        <NumberControl
          label="Espaço abaixo"
          value={style.space}
          min={0}
          max={100}
          onChange={(space) => change({ space })}
        />
        <NumberControl
          label="Arredondamento"
          value={style.radius}
          min={0}
          max={40}
          onChange={(radius) => change({ radius })}
        />
        {active && ['image', 'banner'].includes(active.kind) && (
          <Choice
            label="Ajuste da imagem"
            value={style.fit}
            options={[
              { value: 'cover', label: 'Preencher e recortar' },
              { value: 'contain', label: 'Mostrar imagem completa' },
            ]}
            onChange={(fit) => change({ fit: fit as 'cover' | 'contain' })}
          />
        )}
      </>
    );
  }
  function fieldEditor() {
    return (
      <>
        <Field label="Título do formulário">
          <input
            value={d.form.title}
            onChange={(e) => changeForm({ title: e.target.value })}
          />
        </Field>
        <div className="inspector-section-label">CAMPOS</div>
        <div className="form-field-list">
          {d.form.fields.map((f, i) => (
            <div key={f.id} className={field.id === f.id ? 'selected' : ''}>
              <button onClick={() => setFieldId(f.id)}>
                <FormInput size={14} />
                <span>{f.label}</span>
                {!f.enabled && <EyeOff size={12} />}
              </button>
              <IconButton
                label={`Mover ${f.label} acima`}
                disabled={i === 0}
                onClick={() =>
                  changeForm({ fields: reorder(d.form.fields, i, i - 1) })
                }
              >
                <ArrowUp size={13} />
              </IconButton>
              <IconButton
                label={`Mover ${f.label} abaixo`}
                disabled={i === d.form.fields.length - 1}
                onClick={() =>
                  changeForm({ fields: reorder(d.form.fields, i, i + 1) })
                }
              >
                <ArrowDown size={13} />
              </IconButton>
            </div>
          ))}
        </div>
        <button
          className="secondary full"
          disabled={d.form.fields.length >= 12}
          onClick={() => {
            const id = crypto.randomUUID();
            changeForm({
              fields: [
                ...d.form.fields,
                {
                  id,
                  label: 'Novo campo',
                  placeholder: '',
                  type: 'text',
                  required: false,
                  enabled: true,
                  width: 100,
                },
              ],
            });
            setFieldId(id);
          }}
        >
          <Plus size={15} />
          Adicionar campo
        </button>
        <div className="selected-field-properties">
          <Field label="Nome do campo">
            <input
              value={field.label}
              onChange={(e) =>
                changeForm({
                  fields: d.form.fields.map((f) =>
                    f.id === field.id ? { ...f, label: e.target.value } : f,
                  ),
                })
              }
            />
          </Field>
          <Field label="Placeholder">
            <input
              value={field.placeholder}
              onChange={(e) =>
                changeForm({
                  fields: d.form.fields.map((f) =>
                    f.id === field.id
                      ? { ...f, placeholder: e.target.value }
                      : f,
                  ),
                })
              }
            />
          </Field>
          <Choice
            label="Largura do campo"
            value={String(field.width)}
            options={[
              { value: '100', label: 'Linha inteira' },
              { value: '50', label: 'Meia linha' },
            ]}
            onChange={(v) =>
              changeForm({
                fields: d.form.fields.map((f) =>
                  f.id === field.id
                    ? { ...f, width: Number(v) as 50 | 100 }
                    : f,
                ),
              })
            }
          />
          <Toggle
            label="Campo visível"
            value={field.enabled}
            disabled={field.id === 'email'}
            onChange={(enabled) =>
              changeForm({
                fields: d.form.fields.map((f) =>
                  f.id === field.id ? { ...f, enabled } : f,
                ),
              })
            }
          />
          <Toggle
            label="Obrigatório"
            value={field.required}
            disabled={field.id === 'email'}
            onChange={(required) =>
              changeForm({
                fields: d.form.fields.map((f) =>
                  f.id === field.id ? { ...f, required } : f,
                ),
              })
            }
          />
          {field.id !== 'email' && (
            <button
              className="text-button"
              onClick={() => {
                changeForm({
                  fields: d.form.fields.filter((f) => f.id !== field.id),
                });
                setFieldId('email');
              }}
            >
              Remover campo
            </button>
          )}
        </div>
        <hr />
        <NumberControl
          label="Altura dos campos"
          min={32}
          max={80}
          value={
            device === 'desktop' ? d.form.inputHeight : d.form.mobileInputHeight
          }
          onChange={(v) =>
            changeForm(
              device === 'desktop'
                ? { inputHeight: v }
                : { mobileInputHeight: v },
            )
          }
        />
        <NumberControl
          label="Cantos dos campos"
          min={0}
          max={24}
          value={d.form.inputRadius}
          onChange={(inputRadius) => changeForm({ inputRadius })}
        />
        <ColorControl
          label="Fundo dos campos"
          value={d.form.inputBackground}
          onChange={(inputBackground) => changeForm({ inputBackground })}
        />
        <ColorControl
          label="Texto dos campos"
          value={d.form.inputColor}
          onChange={(inputColor) => changeForm({ inputColor })}
        />
        <ColorControl
          label="Borda dos campos"
          value={d.form.inputBorder}
          onChange={(inputBorder) => changeForm({ inputBorder })}
        />
        <button className="secondary full" onClick={() => select('button')}>
          Personalizar botão
          <ChevronRight size={15} />
        </button>
      </>
    );
  }
  function blockContent() {
    if (!active) return null;
    switch (active.kind) {
      case 'brand':
        return (
          <div className="editor-brand">
            <strong>{tenant.name}</strong>
            <p>A marca acompanha a identidade da operação.</p>
          </div>
        );
      case 'banner':
        return (
          <>
            <ImageControl
              label="Banner desktop"
              value={c.banner}
              onChange={(v) => update('banner', v)}
              onError={onError}
            />
            <ImageControl
              label="Banner mobile"
              value={c.mobileBanner}
              onChange={(v) => update('mobileBanner', v)}
              onError={onError}
            />
          </>
        );
      case 'image':
        return (
          <>
            <ImageControl
              label="Imagem desktop"
              value={active.src}
              onChange={(src) => changeBlock({ src })}
              onError={onError}
            />
            <ImageControl
              label="Imagem mobile"
              value={active.mobileSrc}
              onChange={(mobileSrc) => changeBlock({ mobileSrc })}
              onError={onError}
            />
            {blockText('Descrição da imagem', active.content, (content) =>
              changeBlock({ content }),
            )}
          </>
        );
      case 'title':
        return area('Título da oferta', 'title');
      case 'description':
        return area('Descrição', 'subtitle');
      case 'price':
        return input('Preço (R$)', 'price', 'number');
      case 'benefits':
        return area('Benefícios (um por linha)', 'benefits');
      case 'text':
      case 'footer':
        return blockText('Texto', active.content, (content) =>
          changeBlock({ content }),
        );
      case 'reviews':
        return (
          <>
            <Toggle
              label="Exibir avaliações"
              value={c.showReviews}
              onChange={(v) => update('showReviews', v)}
            />
            {c.reviews.map((r, i) => (
              <div className="review-properties" key={r.id}>
                <div className="spread">
                  <strong>Avaliação {i + 1}</strong>
                  <IconButton
                    label="Remover avaliação"
                    onClick={() =>
                      update(
                        'reviews',
                        c.reviews.filter((x) => x.id !== r.id),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
                <Field label="Nome">
                  <input
                    value={r.name}
                    onChange={(e) =>
                      update(
                        'reviews',
                        c.reviews.map((x) =>
                          x.id === r.id ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </Field>
                {blockText('Depoimento', r.text, (text) =>
                  update(
                    'reviews',
                    c.reviews.map((x) => (x.id === r.id ? { ...x, text } : x)),
                  ),
                )}
                <NumberControl
                  label="Estrelas"
                  unit=""
                  min={1}
                  max={5}
                  value={r.rating}
                  onChange={(rating) =>
                    update(
                      'reviews',
                      c.reviews.map((x) =>
                        x.id === r.id ? { ...x, rating } : x,
                      ),
                    )
                  }
                />
              </div>
            ))}
            <button
              className="secondary full"
              disabled={c.reviews.length >= 20}
              onClick={() =>
                update('reviews', [
                  ...c.reviews,
                  { id: crypto.randomUUID(), name: '', text: '', rating: 5 },
                ])
              }
            >
              <Plus size={15} />
              Adicionar avaliação
            </button>
          </>
        );
      case 'bump':
        return (
          <>
            <Toggle
              label="Order bump ativo"
              value={c.bump}
              onChange={(v) => update('bump', v)}
            />
            {input('Oferta complementar', 'bumpTitle')}
            {input('Valor adicional (R$)', 'bumpPrice', 'number')}
          </>
        );
      case 'form':
        return fieldEditor();
      case 'divider':
        return (
          <NumberControl
            label="Espessura"
            min={0}
            max={20}
            value={active[device].height}
            onChange={(height) =>
              changeBlock({ [device]: { ...active[device], height } })
            }
          />
        );
    }
  }
  function globalContent() {
    switch (selected) {
      case 'page':
        return (
          <>
            <Choice
              label="Layout"
              value={d.layout}
              options={[
                { value: 'columns', label: 'Duas colunas' },
                { value: 'stacked', label: 'Uma coluna' },
              ]}
              onChange={(v) =>
                changeDesign({ layout: v as CheckoutDesign['layout'] })
              }
            />
            {d.layout === 'columns' && (
              <>
                <Choice
                  label="Coluna do formulário"
                  value={d.formSide}
                  options={[
                    { value: 'right', label: 'À direita' },
                    { value: 'left', label: 'À esquerda' },
                  ]}
                  onChange={(v) =>
                    changeDesign({ formSide: v as 'left' | 'right' })
                  }
                />
                <NumberControl
                  label="Largura da coluna lateral"
                  unit="%"
                  value={d.asideWidth}
                  min={30}
                  max={65}
                  onChange={(asideWidth) => changeDesign({ asideWidth })}
                />
              </>
            )}
            <Choice
              label="Fonte da página"
              value={d.font}
              options={fontOptions}
              onChange={(font) =>
                changeDesign({
                  font: font as CheckoutDesign['font'],
                  blocks: d.blocks.map((b) => ({
                    ...b,
                    desktop: { ...b.desktop, font: font as BlockStyle['font'] },
                    mobile: { ...b.mobile, font: font as BlockStyle['font'] },
                  })),
                  form: {
                    ...d.form,
                    button: {
                      ...d.form.button,
                      font: font as BlockStyle['font'],
                    },
                    mobileButton: {
                      ...d.form.mobileButton,
                      font: font as BlockStyle['font'],
                    },
                  },
                })
              }
            />
            <ColorControl
              label="Fundo da página"
              value={c.background}
              onChange={(v) => update('background', v)}
            />
            <ColorControl
              label="Cor de destaque"
              value={c.color}
              onChange={(v) => update('color', v)}
            />
            {device === 'desktop' && (
              <NumberControl
                label="Largura máxima"
                value={d.maxWidth}
                min={360}
                max={1440}
                step={10}
                onChange={(maxWidth) => changeDesign({ maxWidth })}
              />
            )}
            <NumberControl
              label="Margens da página"
              value={device === 'desktop' ? d.padding : d.mobilePadding}
              min={0}
              max={device === 'desktop' ? 80 : 40}
              onChange={(v) =>
                changeDesign(
                  device === 'desktop' ? { padding: v } : { mobilePadding: v },
                )
              }
            />
            <NumberControl
              label="Intervalo entre colunas"
              value={device === 'desktop' ? d.gap : d.mobileGap}
              min={0}
              max={device === 'desktop' ? 80 : 48}
              onChange={(v) =>
                changeDesign(
                  device === 'desktop' ? { gap: v } : { mobileGap: v },
                )
              }
            />
          </>
        );
      case 'offer':
        return (
          <>
            {input('Nome interno', 'name')}
            {input('Título', 'title')}
            {input('Preço (R$)', 'price', 'number')}
            {area('Descrição', 'subtitle')}
            {c.published && (
              <>
                <a
                  className="secondary full"
                  href={`/checkout/${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Link size={15} />
                  Abrir versão publicada
                </a>
                <button className="text-button" onClick={() => save(false)}>
                  Despublicar checkout
                </button>
              </>
            )}
          </>
        );
      case 'tracking':
        return (
          <>
            {input('Meta title', 'metaTitle')}
            {area('Meta description', 'metaDescription')}
            <hr />
            {input('Meta Pixel ID', 'pixel')}
            {input('Google Analytics 4 ID', 'analytics')}
            <p className="integration-note">
              IDs salvos. O disparo de eventos depende da integração de
              rastreamento.
            </p>
          </>
        );
      case 'conversion':
        return (
          <>
            <Toggle
              label="Upsell após a compra"
              value={c.upsell}
              onChange={(v) => update('upsell', v)}
            />
            {input('Oferta do upsell', 'upsellTitle')}
            {input('Preço do upsell (R$)', 'upsellPrice', 'number')}
            <p className="integration-note">
              A cobrança da oferta depende do gateway de pagamento.
            </p>
            <button
              className="secondary full"
              onClick={() => {
                const b = d.blocks.find((x) => x.kind === 'bump');
                if (b) select(b.id);
                else addBlock('bump');
              }}
            >
              Configurar order bump
              <ChevronRight size={15} />
            </button>
          </>
        );
      case 'notifications':
        return (
          <>
            <Toggle
              label="Notificações da oferta"
              value={c.notifications}
              onChange={(v) => update('notifications', v)}
            />
            {input('E-mail de destino', 'notificationEmail', 'email')}
            <p className="integration-note">
              Envios dependem do gateway e do serviço de e-mail.
            </p>
          </>
        );
      case 'button':
        return (
          <>
            {input('Texto do botão', 'button')}
            <button
              className="secondary full"
              onClick={() => setInspectorTab('style')}
            >
              <Palette size={15} />
              Aparência do botão
            </button>
          </>
        );
      default:
        return null;
    }
  }
  const inspectorTitle =
    active?.label ||
    {
      page: 'Página',
      offer: 'Oferta',
      tracking: 'Meta e pixels',
      conversion: 'Conversão',
      notifications: 'Notificações',
      button: 'Botão de compra',
    }[selected] ||
    'Propriedades';
  return (
    <div className="builder2" data-panel={mobilePanel}>
      <header className="builder2-header">
        <div className="builder2-title">
          <IconButton
            label="Voltar"
            onClick={() => (dirty ? setConfirm(true) : onClose())}
          >
            <ArrowLeft size={19} />
          </IconButton>
          <div>
            <strong>{c.name || 'Novo checkout'}</strong>
            <small>
              {tenant.name}
              <span>/</span>Checkout builder
            </small>
          </div>
        </div>
        <div className="builder2-history">
          <IconButton
            label="Desfazer"
            disabled={!history.length}
            onClick={undo}
          >
            <Undo2 size={17} />
          </IconButton>
          <IconButton label="Refazer" disabled={!future.length} onClick={redo}>
            <Redo2 size={17} />
          </IconButton>
        </div>
        <div className="builder2-actions">
          <span className={`save-state ${dirty ? 'unsaved' : ''}`}>
            <span />
            {dirty ? 'Não salvo' : 'Salvo'}
          </span>
          <IconButton
            label="Abrir prévia interativa"
            onClick={() => setPreview(true)}
          >
            <Eye size={19} />
          </IconButton>
          <button className="secondary" disabled={busy} onClick={() => save()}>
            <Save size={16} />
            <span>Salvar</span>
          </button>
          <button
            className="primary"
            disabled={busy}
            onClick={() => save(true)}
          >
            <Globe size={16} />
            {busy ? 'Salvando…' : c.published ? 'Atualizar' : 'Publicar'}
          </button>
        </div>
      </header>
      <div className="builder2-toolbar">
        <button className="editor-path" onClick={() => select('page')}>
          <LayoutTemplate size={15} />
          Página
          <ChevronRight size={13} />
          <span>{inspectorTitle}</span>
        </button>
        <Tabs value={device} onValueChange={(v) => setDevice(v as Device)}>
          <TabsList>
            <TabsTrigger value="desktop">
              <Monitor size={16} />
              <span>Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone size={16} />
              <span>Mobile</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="zoom-choice">
          <Choice
            label="Zoom"
            value={zoom}
            options={[
              { value: 'fit', label: 'Ajustar' },
              ...['50', '75', '100'].map((v) => ({ value: v, label: `${v}%` })),
            ]}
            onChange={setZoom}
          />
        </div>
      </div>
      <div className="builder-mobile-tabs">
        <Tabs
          value={mobilePanel}
          onValueChange={(v) => setMobilePanel(String(v))}
        >
          <TabsList>
            <TabsTrigger value="layers">
              <Layers size={15} />
              Blocos
            </TabsTrigger>
            <TabsTrigger value="canvas">
              <Eye size={15} />
              Prévia
            </TabsTrigger>
            <TabsTrigger value="properties">
              <Settings2 size={15} />
              Ajustes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="builder2-body">
        <aside className="builder2-layers">
          <Tabs value={leftTab} onValueChange={(v) => setLeftTab(String(v))}>
            <TabsList>
              <TabsTrigger value="layers">Camadas</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            <TabsContent value="layers">
              <div className="layers-heading">
                <span>
                  {device === 'desktop' ? 'ESTRUTURA DESKTOP' : 'ORDEM MOBILE'}
                </span>
                <IconButton
                  label="Adicionar bloco"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus size={18} />
                </IconButton>
              </div>
              {device === 'mobile'
                ? renderLayers(ordered)
                : (Object.keys(zones) as Zone[]).map((zone) => (
                    <div
                      className="layer-zone"
                      key={zone}
                      onDragOver={(e) => {
                        if (dragged.current) e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (e.defaultPrevented) return;
                        e.preventDefault();
                        if (dragged.current)
                          changeDesign({
                            blocks: d.blocks.map((b) =>
                              b.id === dragged.current ? { ...b, zone } : b,
                            ),
                          });
                        dragged.current = null;
                      }}
                    >
                      <div className="layer-zone-heading">
                        {zones[zone]}
                        <span>
                          {d.blocks.filter((b) => b.zone === zone).length}
                        </span>
                      </div>
                      {renderLayers(d.blocks.filter((b) => b.zone === zone))}
                    </div>
                  ))}
              <button
                className="add-block-button"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={16} />
                Adicionar bloco
              </button>
              <button
                className={`page-settings-button ${selected === 'button' ? 'selected' : ''}`}
                onClick={() => select('button')}
              >
                <MousePointer2 size={16} />
                Botão de compra
              </button>
            </TabsContent>
            <TabsContent value="settings">
              <div className="builder-settings-menu">
                {(
                  [
                    ['page', 'Página e layout', LayoutTemplate],
                    ['offer', 'Dados da oferta', Tag],
                    ['tracking', 'Meta e pixels', Activity],
                    ['conversion', 'Upsell e conversão', Megaphone],
                    ['notifications', 'Notificações', Mail],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    className={selected === id ? 'selected' : ''}
                    key={id}
                    onClick={() => select(id)}
                  >
                    <Icon size={18} />
                    {label}
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <div className="layers-footer">
            <span className="live-dot" />
            {d.blocks.length} blocos<span>v2</span>
          </div>
        </aside>
        <main className="builder2-canvas" ref={canvasRef}>
          <div className="canvas-dimensions">
            <span>{device === 'mobile' ? '375' : d.maxWidth} px</span>
            <span>{Math.round(scale * 100)}%</span>
          </div>
          <div className="builder2-stage">
            <div
              className="builder2-frame"
              style={{ width: frameWidth, zoom: scale } as CSSProperties}
            >
              <div className="frame-address">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <LockAddress text={`${tenant.slug}.tradingpro.io/checkout`} />
                <span />
              </div>
              <CheckoutDocument
                checkout={c}
                tenant={tenant}
                device={device}
                selected={selected}
                onSelect={select}
              />
            </div>
          </div>
          <div className="builder2-canvas-foot">
            <MousePointer2 size={13} />
            {device === 'mobile' ? 'Mobile' : 'Desktop'}
            <span>·</span>
            {inspectorTitle}
          </div>
        </main>
        <aside className="builder2-inspector">
          <div className="inspector-heading">
            <div>
              <span>{active ? 'ELEMENTO' : 'CONFIGURAÇÕES'}</span>
              <h2>{inspectorTitle}</h2>
            </div>
            {active && (
              <IconButton
                label={active.visible ? 'Ocultar bloco' : 'Mostrar bloco'}
                disabled={active.kind === 'form'}
                onClick={() => changeBlock({ visible: !active.visible })}
              >
                {active.visible ? <Eye size={17} /> : <EyeOff size={17} />}
              </IconButton>
            )}
          </div>
          <div className="inspector-device">
            <span>
              {device === 'desktop' ? (
                <Monitor size={13} />
              ) : (
                <Smartphone size={13} />
              )}{' '}
              {device === 'desktop' ? 'Desktop' : 'Mobile'}
            </span>
            {active && (
              <button
                onClick={() =>
                  changeBlock({
                    [device]: {
                      ...active[device === 'desktop' ? 'mobile' : 'desktop'],
                    },
                  })
                }
              >
                Copiar do {device === 'desktop' ? 'mobile' : 'desktop'}
              </button>
            )}
          </div>
          <Tabs
            value={inspectorTab}
            onValueChange={(v) => setInspectorTab(String(v))}
          >
            <TabsList>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger
                value="style"
                disabled={!active && selected !== 'button'}
              >
                Estilo
              </TabsTrigger>
              {active && <TabsTrigger value="position">Posição</TabsTrigger>}
            </TabsList>
            <TabsContent value="content">
              <div className="inspector-scroll">
                {active ? blockContent() : globalContent()}
              </div>
            </TabsContent>
            <TabsContent value="style">
              <div className="inspector-scroll">
                {active
                  ? styleInspector(active[device], (patch) =>
                      changeBlock({
                        [device]: { ...active[device], ...patch },
                      }),
                    )
                  : selected === 'button'
                    ? styleInspector(
                        device === 'desktop'
                          ? d.form.button
                          : d.form.mobileButton,
                        (patch) =>
                          changeForm(
                            device === 'desktop'
                              ? { button: { ...d.form.button, ...patch } }
                              : {
                                  mobileButton: {
                                    ...d.form.mobileButton,
                                    ...patch,
                                  },
                                },
                          ),
                      )
                    : null}
              </div>
            </TabsContent>
            <TabsContent value="position">
              <div className="inspector-scroll">
                {active && (
                  <>
                    <Field label="Nome da camada">
                      <input
                        value={active.label}
                        maxLength={100}
                        onChange={(e) => changeBlock({ label: e.target.value })}
                      />
                    </Field>
                    <Choice
                      label="Região no desktop"
                      value={active.zone}
                      options={zoneOptions}
                      onChange={(zone) => changeBlock({ zone: zone as Zone })}
                    />
                    <NumberControl
                      label="Posição no mobile"
                      unit=""
                      min={1}
                      max={d.mobileOrder.length}
                      value={d.mobileOrder.indexOf(active.id) + 1}
                      onChange={(value) =>
                        changeDesign({
                          mobileOrder: reorder(
                            d.mobileOrder,
                            d.mobileOrder.indexOf(active.id),
                            value - 1,
                          ),
                        })
                      }
                    />
                    <Toggle
                      label="Bloco visível"
                      value={active.visible}
                      disabled={active.kind === 'form'}
                      onChange={(visible) => changeBlock({ visible })}
                    />
                    <div className="block-commands">
                      {['text', 'image', 'divider'].includes(active.kind) && (
                        <button
                          className="secondary"
                          onClick={() => {
                            const b = {
                              ...structuredClone(active),
                              id: crypto.randomUUID(),
                              label: active.label + ' (cópia)',
                            };
                            changeDesign({
                              blocks: [...d.blocks, b],
                              mobileOrder: [...d.mobileOrder, b.id],
                            });
                            select(b.id);
                          }}
                        >
                          <Copy size={15} />
                          Duplicar
                        </button>
                      )}
                      <button
                        className="danger"
                        disabled={active.kind === 'form'}
                        onClick={removeBlock}
                      >
                        <Trash2 size={15} />
                        Remover
                      </button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="block-library-dialog">
          <DialogTitle>Adicionar bloco</DialogTitle>
          <DialogDescription>Elementos do checkout</DialogDescription>
          <div className="block-library">
            {(Object.keys(labels) as BlockKind[])
              .filter(
                (kind) =>
                  ['text', 'image', 'divider'].includes(kind) ||
                  !d.blocks.some((b) => b.kind === kind),
              )
              .map((kind) => {
                const Icon = icons[kind];
                return (
                  <button
                    key={kind}
                    disabled={d.blocks.length >= 40}
                    onClick={() => addBlock(kind)}
                  >
                    <Icon size={25} />
                    <strong>{labels[kind]}</strong>
                    <Plus size={15} />
                  </button>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="document-preview-dialog">
          <DialogTitle>Prévia interativa</DialogTitle>
          <CheckoutDocument checkout={c} tenant={tenant} device={device} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
          <AlertDialogDescription>
            Salve antes de sair ou descarte as alterações desta edição.
          </AlertDialogDescription>
          <div className="form-footer">
            <button className="secondary" onClick={() => setConfirm(false)}>
              Continuar editando
            </button>
            <button className="danger" onClick={onClose}>
              Descartar e sair
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
function LockAddress({ text }: { text: string }) {
  return (
    <div className="address-text">
      <Globe size={11} />
      {text}
    </div>
  );
}
