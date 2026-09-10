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
  Search,
  LayoutDashboard,
  Pencil,
  X,
  ExternalLink,
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
import { type Checkout, type Tenant, money } from '@/lib/model';
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
  const [sidebarTab, setSidebarTab] = useState<'objects' | 'sections'>('sections');
  const [searchObjects, setSearchObjects] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
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
  function changeBlockById(id: string, patch: Partial<Block>) {
    changeDesign({
      blocks: d.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  }
  function duplicateBlock(blockToDup: Block) {
    const b = {
      ...structuredClone(blockToDup),
      id: crypto.randomUUID(),
      label: blockToDup.label + ' (cópia)',
    };
    changeDesign({
      blocks: [...d.blocks, b],
      mobileOrder: [...d.mobileOrder, b.id],
    });
    select(b.id, true);
  }
  function removeBlockById(id: string) {
    const blockToRemove = d.blocks.find((b) => b.id === id);
    if (!blockToRemove || blockToRemove.kind === 'form') return;
    changeDesign({
      blocks: d.blocks.filter((b) => b.id !== id),
      mobileOrder: d.mobileOrder.filter((bId) => bId !== id),
    });
    if (selected === id) {
      setSelected('page');
      setEditModalOpen(false);
    }
  }
  function changeForm(patch: Partial<CheckoutDesign['form']>) {
    changeDesign({ form: { ...d.form, ...patch } });
  }
  function select(id: string, openModal = true) {
    setSelected(id);
    setInspectorTab('content');
    setMobilePanel('properties');
    if (openModal) {
      setEditModalOpen(true);
    }
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
      const Icon = icons[b.kind] || LayoutDashboard;
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
          <button
            className="layer-name"
            onClick={() => select(b.id, true)}
            type="button"
          >
            <Icon size={14} />
            <span>{b.label}</span>
          </button>
          <div className="layer-actions">
            <IconButton
              label="Editar elemento"
              onClick={() => select(b.id, true)}
            >
              <Pencil size={12} />
            </IconButton>
            {['text', 'image', 'divider'].includes(b.kind) && (
              <IconButton
                label="Duplicar"
                onClick={() => duplicateBlock(b)}
              >
                <Copy size={12} />
              </IconButton>
            )}
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
            {b.kind !== 'form' && (
              <IconButton
                label="Excluir elemento"
                onClick={() => removeBlockById(b.id)}
              >
                <Trash2 size={12} />
              </IconButton>
            )}
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
        return (
          <div className="compact-price-editor">
            {input('Valor da oferta (R$)', 'price', 'number')}
            <Field label="Texto descritivo abaixo do valor">
              <input
                type="text"
                value={active.content || 'pagamento único'}
                onChange={(e) => changeBlock({ content: e.target.value })}
                placeholder="Ex: pagamento único ou em até 12x"
              />
            </Field>
          </div>
        );
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
      case 'payments':
        return <div className="payment-settings">
          {(['pix', 'boleto', 'card'] as const).map(method => {
            const methods = c.paymentMethods || ['pix', 'boleto', 'card'];
            return <Toggle key={method} label={{pix: 'Pix', boleto: 'Boleto', card: 'Cartão de crédito'}[method]} value={methods.includes(method)} onChange={enabled => {
              if (!enabled && methods.length === 1) { onError('Mantenha pelo menos uma forma de pagamento.'); return; }
              update('paymentMethods', enabled ? [...methods, method] as NonNullable<Checkout['paymentMethods']> : methods.filter(m => m !== method) as NonNullable<Checkout['paymentMethods']>);
            }} />;
          })}
        </div>;
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
      payments: 'Formas de pagamento',
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
          <a
            href={`/checkout/${c.id}`}
            target="_blank"
            rel="noreferrer"
            className="builder2-open-external"
            title="Abrir página isolada do checkout em outra aba"
          >
            <ExternalLink size={15} />
            <span>Abrir em nova aba</span>
          </a>
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
        <aside className="builder2-sidebar">
          <Tabs
            value={sidebarTab}
            onValueChange={(v) => setSidebarTab(v as 'objects' | 'sections')}
            className="sidebar-tabs-root"
          >
            <TabsList className="sidebar-tabs-header">
              <TabsTrigger value="objects" className="sidebar-tab-trigger">
                <LayoutDashboard size={15} />
                <span>Objetos</span>
              </TabsTrigger>
              <TabsTrigger value="sections" className="sidebar-tab-trigger">
                <Layers size={15} />
                <span>Seções</span>
              </TabsTrigger>
            </TabsList>

            {/* ABA OBJETOS */}
            <TabsContent value="objects" className="sidebar-tab-pane">
              <div className="objects-search-box">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Pesquisar elementos..."
                  value={searchObjects}
                  onChange={(e) => setSearchObjects(e.target.value)}
                  aria-label="Pesquisar elementos"
                />
                {searchObjects && (
                  <button
                    type="button"
                    onClick={() => setSearchObjects('')}
                    className="clear-search-btn"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="objects-scroll-view">
                {[
                  {
                    title: 'ESTRUTURA & ESTRUTURAÇÃO',
                    items: [
                      {
                        id: 'grid-layout',
                        badge: 'GRID',
                        name: 'Grid Layout',
                        desc: 'Colunas e margens',
                        icon: LayoutDashboard,
                        action: () => {
                          setSelected('page');
                          setEditModalOpen(true);
                        },
                      },
                      {
                        id: 'divider',
                        badge: 'DIV',
                        name: 'Divisor',
                        desc: 'Espaçador ou linha',
                        icon: Minus,
                        action: () => addBlock('divider'),
                      },
                      {
                        id: 'footer',
                        badge: 'BASE',
                        name: 'Rodapé',
                        desc: 'Termos e copyright',
                        icon: PanelTop,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'footer');
                          if (b) select(b.id, true);
                          else addBlock('footer');
                        },
                      },
                    ],
                  },
                  {
                    title: 'OBJETOS GERAIS',
                    items: [
                      {
                        id: 'title',
                        badge: 'H1',
                        name: 'Título / Headline',
                        desc: 'Chamada principal',
                        icon: Type,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'title');
                          if (b) select(b.id, true);
                          else addBlock('title');
                        },
                      },
                      {
                        id: 'description',
                        badge: '¶',
                        name: 'Parágrafo / Texto',
                        desc: 'Texto de apoio',
                        icon: AlignLeft,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'description');
                          if (b) select(b.id, true);
                          else addBlock('description');
                        },
                      },
                      {
                        id: 'button',
                        badge: 'CTA',
                        name: 'Botão Link',
                        desc: 'Ação de conversão',
                        icon: MousePointer2,
                        action: () => {
                          setSelected('button');
                          setEditModalOpen(true);
                        },
                      },
                      {
                        id: 'image',
                        badge: 'IMG',
                        name: 'Imagem',
                        desc: 'Fotos e banners',
                        icon: ImageIcon,
                        action: () => addBlock('image'),
                      },
                      {
                        id: 'text',
                        badge: 'TXT',
                        name: 'Texto Livre',
                        desc: 'Conteúdo flexível',
                        icon: Type,
                        action: () => addBlock('text'),
                      },
                    ],
                  },
                  {
                    title: 'ELEMENTOS DO CHECKOUT',
                    items: [
                      {
                        id: 'banner',
                        badge: 'AVISO',
                        name: 'Banner Topo',
                        desc: 'Faixa de urgência',
                        icon: PanelTop,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'banner');
                          if (b) select(b.id, true);
                          else addBlock('banner');
                        },
                      },
                      {
                        id: 'price',
                        badge: 'R$',
                        name: 'Preço / Oferta',
                        desc: 'Valor e parcelas',
                        icon: Tag,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'price');
                          if (b) select(b.id, true);
                          else addBlock('price');
                        },
                      },
                      {
                        id: 'benefits',
                        badge: '✓',
                        name: 'Benefícios',
                        desc: 'Lista de entregáveis',
                        icon: Check,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'benefits');
                          if (b) select(b.id, true);
                          else addBlock('benefits');
                        },
                      },
                      {
                        id: 'reviews',
                        badge: '★',
                        name: 'Avaliações',
                        desc: 'Prova social',
                        icon: Star,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'reviews');
                          if (b) select(b.id, true);
                          else addBlock('reviews');
                        },
                      },
                      {
                        id: 'bump',
                        badge: '+',
                        name: 'Order Bump',
                        desc: 'Venda adicional',
                        icon: Plus,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'bump');
                          if (b) select(b.id, true);
                          else addBlock('bump');
                        },
                      },
                      {
                        id: 'form',
                        badge: 'FORM',
                        name: 'Formulário',
                        desc: 'Campos de dados',
                        icon: FormInput,
                        action: () => {
                          const b = d.blocks.find((x) => x.kind === 'form');
                          if (b) select(b.id, true);
                          else addBlock('form');
                        },
                      },
                    ],
                  },
                ].map((category) => {
                  const filtered = category.items.filter(
                    (item) =>
                      !searchObjects ||
                      item.name.toLowerCase().includes(searchObjects.toLowerCase()) ||
                      item.desc.toLowerCase().includes(searchObjects.toLowerCase()) ||
                      item.badge.toLowerCase().includes(searchObjects.toLowerCase()),
                  );
                  if (!filtered.length) return null;
                  return (
                    <div className="objects-category-section" key={category.title}>
                      <span className="objects-category-title">{category.title}</span>
                      <div className="objects-cards-grid">
                        {filtered.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <button
                              key={item.id}
                              className="object-catalog-card"
                              onClick={item.action}
                              type="button"
                            >
                              <div className="object-catalog-icon-wrapper">
                                <ItemIcon size={18} />
                              </div>
                              <div className="object-catalog-info">
                                <strong>{item.name}</strong>
                                <small>{item.desc}</small>
                              </div>
                              {item.badge && (
                                <span className="object-catalog-badge">{item.badge}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ABA SEÇÕES */}
            <TabsContent value="sections" className="sidebar-tab-pane">
              {/* Card de Configurações Gerais no topo abaixo das abas */}
              <div
                className="sidebar-page-settings-card"
                onClick={() => {
                  setSelected('page');
                  setEditModalOpen(true);
                }}
              >
                <div className="sidebar-page-settings-icon">
                  <Settings2 size={18} />
                </div>
                <div className="sidebar-page-settings-text">
                  <strong>Configurações Gerais da Página</strong>
                  <small>Título, cor de fundo e SEO</small>
                </div>
                <ChevronRight size={16} />
              </div>

              <div className="sections-header">
                <span>ESTRUTURA DAS SEÇÕES</span>
                <button
                  className="new-section-pill"
                  onClick={() => setSidebarTab('objects')}
                  type="button"
                >
                  <Plus size={13} /> Nova seção
                </button>
              </div>

              <div className="sections-list-container">
                {renderLayers(device === 'mobile' ? ordered : d.blocks)}
              </div>

              <button
                className={`page-settings-button ${selected === 'button' ? 'selected' : ''}`}
                onClick={() => {
                  setSelected('button');
                  setEditModalOpen(true);
                }}
                type="button"
              >
                <MousePointer2 size={16} />
                Botão de compra
              </button>

              <div className="layers-footer">
                <span className="live-dot" />
                {d.blocks.length} blocos<span>v2</span>
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* CANVAS DO BUILDER - SEM SCROLL DUPLO OU BARRAS HORIZONTAIS */}
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
                onSelect={(id) => select(id, true)}
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
      </div>

      {/* MODAL DE EDIÇÃO DO ELEMENTO / PÁGINA COM PREVIEW DINÂMICO E ORGANIZAÇÃO COMPACTA */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent
          className={`element-editor-dialog ${selected === 'page' && !active ? 'is-page-dialog' : ''}`}
          showCloseButton={false}
        >
          <div className="editor-modal-header">
            <div className="editor-modal-title">
              <span className="editor-modal-label">Editando:</span>
              <h2>{inspectorTitle}</h2>
              <span className="editor-modal-device-tag">
                {device === 'desktop' ? <Monitor size={12} /> : <Smartphone size={12} />}
                {device === 'desktop' ? 'DESKTOP' : 'MOBILE'}
              </span>
              {active && (
                <span className="editor-modal-id-tag">ID: {active.id.slice(0, 8)}</span>
              )}
            </div>
            <div className="editor-modal-header-actions">
              <button
                type="button"
                className="device-toggle-btn"
                onClick={() => setDevice(device === 'desktop' ? 'mobile' : 'desktop')}
              >
                {device === 'desktop' ? (
                  <>
                    <Smartphone size={13} /> Ver Mobile
                  </>
                ) : (
                  <>
                    <Monitor size={13} /> Ver Desktop
                  </>
                )}
              </button>
              <button
                type="button"
                className="editor-modal-close-btn"
                onClick={() => setEditModalOpen(false)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* PRÉVIA DINÂMICA EM TEMPO REAL NO TOPO DO MODAL (RECORTE REAL DA PÁGINA) */}
          {(active || selected === 'button') && (
            <div className="editor-modal-preview-bar">
              <div className="preview-bar-header">
                <span className="preview-bar-label">PRÉVIA EM TEMPO REAL (RECORTE REAL DA PÁGINA)</span>
                <span className="preview-cutout-badge">
                  Fundo: <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: c.background, margin: '0 4px', border: '1px solid #ffffff40' }} /> {c.background}
                </span>
              </div>
              <div className="preview-cutout-viewport">
                <div
                  className="preview-cutout-card"
                  style={{
                    background: c.background,
                    fontFamily: `${(active && active[device].font) || d.font}, sans-serif`,
                  }}
                >
                  {active ? (
                    (() => {
                      const st = active[device];
                      const alignVal = st.align || 'left';
                      const justifyVal =
                        alignVal === 'center'
                          ? 'center'
                          : alignVal === 'right'
                            ? 'flex-end'
                            : 'flex-start';

                      return (
                        <div
                          style={{
                            fontFamily: `${st.font || d.font}, sans-serif`,
                            fontSize: `${st.size}px`,
                            fontWeight: st.weight,
                            color: st.color,
                            textAlign: st.align,
                            background:
                              st.background !== 'transparent'
                                ? st.background
                                : 'transparent',
                            padding: st.padding ? `${st.padding}px` : undefined,
                            borderRadius: `${st.radius}px`,
                            width: `${st.width}%`,
                            margin:
                              alignVal === 'center'
                                ? '0 auto'
                                : alignVal === 'right'
                                  ? '0 0 0 auto'
                                  : '0 auto 0 0',
                            lineHeight: st.lineHeight || 1.3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: justifyVal,
                          }}
                        >
                          {active.kind === 'price' ? (
                            <div
                              className="document-price"
                              style={{
                                width: '100%',
                                textAlign: st.align,
                                alignItems: justifyVal,
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: `${st.size}px`,
                                  fontWeight: st.weight || 700,
                                  color: st.color,
                                  lineHeight: 1.1,
                                }}
                              >
                                {money(c.price)}
                              </strong>
                              <small
                                style={{
                                  fontSize: `${Math.max(11, Math.round(st.size * 0.42))}px`,
                                  color: st.color,
                                  opacity: 0.75,
                                  marginTop: 4,
                                  fontWeight: 400,
                                }}
                              >
                                {active.content || 'pagamento único'}
                              </small>
                            </div>
                          ) : active.kind === 'title' ? (
                            <h1
                              style={{
                                fontSize: `${st.size}px`,
                                fontWeight: st.weight || 700,
                                color: st.color,
                                textAlign: st.align,
                                margin: 0,
                                lineHeight: st.lineHeight || 1.2,
                                width: '100%',
                              }}
                            >
                              {c.title || 'Título da oferta'}
                            </h1>
                          ) : active.kind === 'description' ? (
                            <p
                              style={{
                                fontSize: `${st.size}px`,
                                fontWeight: st.weight || 400,
                                color: st.color,
                                textAlign: st.align,
                                margin: 0,
                                lineHeight: st.lineHeight || 1.4,
                                width: '100%',
                              }}
                            >
                              {c.subtitle || 'Descrição da oferta'}
                            </p>
                          ) : active.kind === 'divider' ? (
                            <hr
                              style={{
                                borderColor: st.color || '#00000020',
                                borderTopWidth: `${Math.max(1, Math.min(st.size, 8))}px`,
                                borderStyle: 'solid',
                                width: '100%',
                                margin: '6px 0',
                              }}
                            />
                          ) : active.kind === 'benefits' ? (
                            <ul
                              className="document-benefits"
                              style={{
                                width: '100%',
                                textAlign: st.align,
                                padding: 0,
                                margin: 0,
                                listStyle: 'none',
                              }}
                            >
                              {(c.benefits || 'Acesso imediato ao material\nAtualizações automáticas')
                                .split('\n')
                                .filter(Boolean)
                                .slice(0, 3)
                                .map((text, i) => (
                                  <li
                                    key={i}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      justifyContent: justifyVal,
                                      marginBottom: '4px',
                                      fontSize: `${st.size}px`,
                                      color: st.color,
                                    }}
                                  >
                                    <Check size={16} color={c.color} />
                                    <span>{text}</span>
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <div style={{ width: '100%', textAlign: st.align }}>
                              {active.content || labels[active.kind] || 'Elemento'}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <button
                        type="button"
                        style={{
                          fontFamily: `${d.form.button.font || d.font}, sans-serif`,
                          fontSize: `${d.form.button.size}px`,
                          fontWeight: d.form.button.weight,
                          color: d.form.button.color || '#12170b',
                          background:
                            d.form.button.background !== 'transparent'
                              ? d.form.button.background
                              : c.color,
                          padding: '12px 28px',
                          borderRadius: `${d.form.button.radius || 6}px`,
                          border: 'none',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                          cursor: 'default',
                        }}
                      >
                        {c.button || 'Comprar agora'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="editor-modal-body">
            {active ? (
              <div className="editor-modal-unified-pane">
                {/* CONTEÚDO PRINCIPAL */}
                <div className="compact-section-box">
                  <div className="compact-section-title">CONTEÚDO</div>
                  {blockContent()}
                </div>

                {/* ESTILO, TIPOGRAFIA E CORES */}
                <div className="compact-section-box">
                  <div className="compact-section-title">ESTILO & TIPOGRAFIA</div>
                  <div className="compact-controls-grid">
                    <Choice
                      label="Fonte"
                      value={active[device].font}
                      options={fontOptions}
                      onChange={(font) =>
                        changeBlock({
                          [device]: { ...active[device], font: font as BlockStyle['font'] },
                        })
                      }
                    />
                    <NumberControl
                      label="Tamanho"
                      value={active[device].size}
                      min={10}
                      max={80}
                      onChange={(size) =>
                        changeBlock({ [device]: { ...active[device], size } })
                      }
                    />
                    <Choice
                      label="Espessura"
                      value={String(active[device].weight)}
                      options={[
                        { value: '400', label: 'Normal (400)' },
                        { value: '500', label: 'Médio (500)' },
                        { value: '600', label: 'Semi-Bold (600)' },
                        { value: '700', label: 'Bold (700)' },
                        { value: '800', label: 'Extra Bold (800)' },
                      ]}
                      onChange={(w) =>
                        changeBlock({ [device]: { ...active[device], weight: Number(w) } })
                      }
                    />
                    <div className="editor-field">
                      <span>Alinhamento</span>
                      <div className="alignment-tools">
                        {(
                          [
                            ['left', AlignLeft, 'Esquerda'],
                            ['center', AlignCenter, 'Centro'],
                            ['right', AlignRight, 'Direita'],
                          ] as const
                        ).map(([v, Icon, label]) => (
                          <IconButton
                            key={v}
                            label={label}
                            active={active[device].align === v}
                            onClick={() =>
                              changeBlock({ [device]: { ...active[device], align: v } })
                            }
                          >
                            <Icon size={16} />
                          </IconButton>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="compact-controls-grid" style={{ marginTop: '10px' }}>
                    <NumberControl
                      label="Espaço abaixo"
                      value={active[device].space}
                      min={0}
                      max={80}
                      onChange={(space) =>
                        changeBlock({ [device]: { ...active[device], space } })
                      }
                    />
                    <NumberControl
                      label="Padding interno"
                      value={active[device].padding}
                      min={0}
                      max={60}
                      onChange={(padding) =>
                        changeBlock({ [device]: { ...active[device], padding } })
                      }
                    />
                    <NumberControl
                      label="Arredondamento"
                      value={active[device].radius}
                      min={0}
                      max={40}
                      onChange={(radius) =>
                        changeBlock({ [device]: { ...active[device], radius } })
                      }
                    />
                    <NumberControl
                      label="Largura (%)"
                      unit="%"
                      value={active[device].width}
                      min={20}
                      max={100}
                      onChange={(width) =>
                        changeBlock({ [device]: { ...active[device], width } })
                      }
                    />
                  </div>

                  <div className="compact-colors-row" style={{ marginTop: '12px' }}>
                    <ColorControl
                      label="Cor do texto"
                      value={active[device].color}
                      onChange={(color) =>
                        changeBlock({ [device]: { ...active[device], color } })
                      }
                    />
                    <ColorControl
                      label="Cor de fundo"
                      value={active[device].background}
                      onChange={(background) =>
                        changeBlock({ [device]: { ...active[device], background } })
                      }
                      transparent
                    />
                    <div className="quick-palette-box">
                      <span>Paleta rápida</span>
                      <div className="quick-palette-swatches">
                        {[
                          { label: 'Branco', color: '#ffffff' },
                          { label: 'Amarelo', color: '#f1c232' },
                          { label: 'Roxo', color: '#8b5cf6' },
                          { label: 'Verde', color: '#96d600' },
                          { label: 'Vermelho', color: '#ef4444' },
                          { label: 'Preto', color: '#141712' },
                        ].map((cSw) => (
                          <button
                            key={cSw.color}
                            type="button"
                            title={cSw.label}
                            className="quick-color-dot"
                            style={{ background: cSw.color }}
                            onClick={() =>
                              changeBlock({
                                [device]: { ...active[device], color: cSw.color },
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* REGIÃO E ORDEM */}
                <div className="compact-section-box">
                  <div className="compact-section-title">CAMADA E POSIÇÃO</div>
                  <div className="compact-controls-grid">
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
                      label="Posição na ordem"
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
                  </div>
                </div>
              </div>
            ) : selected === 'button' ? (
              <div className="editor-modal-unified-pane">
                <div className="compact-section-box">
                  <div className="compact-section-title">TEXTO DO BOTÃO</div>
                  {input('Texto do botão', 'button')}
                </div>
                <div className="compact-section-box">
                  <div className="compact-section-title">ESTILO DO BOTÃO</div>
                  {styleInspector(
                    device === 'desktop' ? d.form.button : d.form.mobileButton,
                    (patch) =>
                      changeForm(
                        device === 'desktop'
                          ? { button: { ...d.form.button, ...patch } }
                          : { mobileButton: { ...d.form.mobileButton, ...patch } },
                      ),
                  )}
                </div>
              </div>
            ) : (
              /* Configurações Gerais da Página com Prévia em Tempo Real */
              <div className="page-settings-split">
                <div className="page-settings-controls">
                  <Tabs defaultValue="page" className="page-settings-tabs-root">
                    <TabsList className="editor-modal-tabs">
                      <TabsTrigger value="page">Página & Layout</TabsTrigger>
                      <TabsTrigger value="offer">Oferta</TabsTrigger>
                      <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                      <TabsTrigger value="tracking">Meta & Pixels</TabsTrigger>
                      <TabsTrigger value="conversion">Conversão</TabsTrigger>
                      <TabsTrigger value="notifications">Notificações</TabsTrigger>
                    </TabsList>

                    <div className="page-settings-tab-scroll">
                      <TabsContent value="page" className="editor-modal-tab-content">
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
                      </TabsContent>
                      <TabsContent value="offer" className="editor-modal-tab-content">
                        {input('Nome interno', 'name')}
                        {input('Título', 'title')}
                        {input('Preço (R$)', 'price', 'number')}
                        {area('Descrição', 'subtitle')}
                        {c.published && (
                          <a
                            className="secondary full"
                            href={`/checkout/${c.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Link size={15} />
                            Abrir versão publicada
                          </a>
                        )}
                      </TabsContent>
                      <TabsContent value="payments" className="editor-modal-tab-content">
                        <div className="payment-settings">
                          {(['pix', 'boleto', 'card'] as const).map((method) => {
                            const methods = c.paymentMethods || ['pix', 'boleto', 'card'];
                            return (
                              <Toggle
                                key={method}
                                label={{ pix: 'Pix', boleto: 'Boleto', card: 'Cartão de crédito' }[method]}
                                value={methods.includes(method)}
                                onChange={(enabled) => {
                                  if (!enabled && methods.length === 1) {
                                    onError('Mantenha pelo menos uma forma de pagamento.');
                                    return;
                                  }
                                  update(
                                    'paymentMethods',
                                    enabled
                                      ? ([...methods, method] as NonNullable<Checkout['paymentMethods']>)
                                      : (methods.filter((m) => m !== method) as NonNullable<Checkout['paymentMethods']>),
                                  );
                                }}
                              />
                            );
                          })}
                        </div>
                      </TabsContent>
                      <TabsContent value="tracking" className="editor-modal-tab-content">
                        {input('Meta title', 'metaTitle')}
                        {area('Meta description', 'metaDescription')}
                        <hr />
                        {input('Meta Pixel ID', 'pixel')}
                        {input('Google Analytics 4 ID', 'analytics')}
                        <p className="integration-note">
                          IDs salvos. O disparo de eventos depende da integração de rastreamento.
                        </p>
                      </TabsContent>
                      <TabsContent value="conversion" className="editor-modal-tab-content">
                        <Toggle
                          label="Upsell após a compra"
                          value={c.upsell}
                          onChange={(v) => update('upsell', v)}
                        />
                        {input('Oferta do upsell', 'upsellTitle')}
                        {input('Preço do upsell (R$)', 'upsellPrice', 'number')}
                      </TabsContent>
                      <TabsContent value="notifications" className="editor-modal-tab-content">
                        <Toggle
                          label="Notificações da oferta"
                          value={c.notifications}
                          onChange={(v) => update('notifications', v)}
                        />
                        {input('E-mail de destino', 'notificationEmail', 'email')}
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* PAINEL DE PRÉVIA EM TEMPO REAL DA PÁGINA */}
                <div className="page-settings-preview-pane">
                  <div className="page-preview-pane-header">
                    <div className="page-preview-status">
                      <span className="live-dot" />
                      <strong style={{ fontSize: '11px', color: '#e5ece0', letterSpacing: '0.5px' }}>
                        PRÉVIA DA PÁGINA
                      </strong>
                      <span style={{ fontSize: '10px', color: '#7e9075' }}>· Tempo real</span>
                    </div>
                    <div className="page-preview-device-switch">
                      <button
                        type="button"
                        className={`preview-device-btn ${device === 'desktop' ? 'active' : ''}`}
                        onClick={() => setDevice('desktop')}
                      >
                        <Monitor size={12} /> Desktop
                      </button>
                      <button
                        type="button"
                        className={`preview-device-btn ${device === 'mobile' ? 'active' : ''}`}
                        onClick={() => setDevice('mobile')}
                      >
                        <Smartphone size={12} /> Mobile
                      </button>
                    </div>
                  </div>

                  <div className="page-preview-stage-container">
                    <div className={`page-preview-mockup ${device === 'mobile' ? 'is-mobile' : 'is-desktop'}`}>
                      <div className="page-preview-mockup-bar">
                        <span className="window-dots">
                          <i /><i /><i />
                        </span>
                        <span className="mockup-url">
                          {tenant.slug}.tradingpro.io/checkout
                        </span>
                        <span />
                      </div>
                      <div className="page-preview-document-scroll">
                        <div
                          className="page-preview-frame-wrapper"
                          style={{
                            width: device === 'mobile' ? '375px' : `${d.maxWidth}px`,
                            zoom: device === 'mobile' ? 0.9 : 0.62,
                          } as CSSProperties}
                        >
                          <CheckoutDocument
                            checkout={c}
                            tenant={tenant}
                            device={device}
                            selected={undefined}
                            onSelect={(id) => select(id, true)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="editor-modal-footer">
            {active && active.kind !== 'form' ? (
              <button
                type="button"
                className="danger"
                onClick={() => {
                  removeBlock();
                  setEditModalOpen(false);
                }}
              >
                <Trash2 size={15} />
                Excluir elemento
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              className="primary"
              onClick={() => setEditModalOpen(false)}
            >
              <Check size={16} />
              Salvar alterações
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
