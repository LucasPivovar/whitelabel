'use client';
import { useMemo, useState, type CSSProperties } from 'react';
import {
  Check,
  Star,
  Zap,
  LockKeyhole,
  ImageIcon,
  ArrowUpRight,
} from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { type Checkout, type Tenant, money } from '@/lib/model';
import {
  withDesign,
  type Block,
  type BlockStyle,
  type Device,
} from '@/lib/checkout-design';

function styleVars(desktop: BlockStyle, mobile: BlockStyle): CSSProperties {
  const vars: Record<string, string | number> = {};
  for (const [device, s] of [
    ['d', desktop],
    ['m', mobile],
  ] as const) {
    Object.assign(vars, {
      [`--${device}-font`]: `${s.font},sans-serif`,
      [`--${device}-size`]: `${s.size}px`,
      [`--${device}-weight`]: s.weight,
      [`--${device}-line`]: s.lineHeight,
      [`--${device}-align`]: s.align,
      [`--${device}-width`]: `${s.width}%`,
      [`--${device}-pad`]: `${s.padding}px`,
      [`--${device}-space`]: `${s.space}px`,
      [`--${device}-radius`]: `${s.radius}px`,
      [`--${device}-color`]: s.color,
      [`--${device}-bg`]: s.background,
      [`--${device}-height`]: s.height ? `${s.height}px` : 'auto',
      [`--${device}-fit`]: s.fit,
      [`--${device}-left`]: s.align === 'left' ? '0' : 'auto',
      [`--${device}-right`]: s.align === 'right' ? '0' : 'auto',
    });
  }
  return vars as CSSProperties;
}
export default function CheckoutDocument({
  checkout,
  tenant,
  device,
  selected,
  onSelect,
}: {
  checkout: Checkout;
  tenant: Tenant;
  device?: Device;
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const c = useMemo(() => withDesign(checkout), [checkout]);
  const d = c.design;
  const [bump, setBump] = useState(false);
  const [message, setMessage] = useState('');
  const editing = Boolean(onSelect);
  const cssVars = {
    fontFamily: `${d.font},sans-serif`,
    background: c.background,
    width: '100%',
    boxSizing: 'border-box',
    '--document-width': `${d.maxWidth}px`,
    '--document-padding': `${d.padding}px`,
    '--document-mobile-padding': `${d.mobilePadding}px`,
    '--document-gap': `${d.gap}px`,
    '--document-mobile-gap': `${d.mobileGap}px`,
    '--aside-width': `${d.asideWidth}%`,
    '--input-height': `${d.form.inputHeight}px`,
    '--mobile-input-height': `${d.form.mobileInputHeight}px`,
    '--input-radius': `${d.form.inputRadius}px`,
    '--field-color': d.form.inputColor,
    '--field-bg': d.form.inputBackground,
    '--field-border': d.form.inputBorder,
    '--accent': c.color,
  } as CSSProperties;
  function content(b: Block) {
    switch (b.kind) {
      case 'brand':
        return (
          <div className="document-brand">
            {tenant.logo ? (
              <img src={tenant.logo} alt={tenant.name} />
            ) : (
              <>
                <Zap size={22} fill="currentColor" />
                <strong>{tenant.name}</strong>
              </>
            )}
          </div>
        );
      case 'banner':
      case 'image': {
        const desktop = b.kind === 'banner' ? c.banner : b.src;
        const mobile = b.kind === 'banner' ? c.mobileBanner : b.mobileSrc;
        return desktop || mobile ? (
          <picture>
            {mobile && (
              <source
                media={
                  device === 'mobile' ? '(min-width:0px)' : '(max-width:620px)'
                }
                srcSet={mobile}
              />
            )}
            <img
              className="document-image"
              src={
                (device === 'mobile' ? mobile : desktop) || desktop || mobile
              }
              alt={b.content || c.name}
            />
          </picture>
        ) : editing ? (
          <div className="image-empty">
            <ImageIcon size={25} />
            <span>{b.label}</span>
          </div>
        ) : null;
      }
      case 'title':
        return <h1>{c.title}</h1>;
      case 'description':
        return <p>{c.subtitle}</p>;
      case 'price':
        return (
          <div className="document-price">
            <strong>{money(c.price)}</strong>
            <small>{b.content || 'pagamento único'}</small>
          </div>
        );
      case 'benefits':
        return (
          <ul className="document-benefits">
            {c.benefits
              .split('\n')
              .filter(Boolean)
              .map((text, i) => (
                <li key={i}>
                  <Check size={17} />
                  <span>{text.replaceAll('Conexões Robox', 'Conexões')}</span>
                </li>
              ))}
          </ul>
        );
      case 'reviews':
        return c.showReviews ? (
          <div className="document-reviews">
            {c.reviews.length ? (
              c.reviews.map((r) => (
                <div key={r.id}>
                  <div className="document-stars">
                    {Array.from(
                      { length: Math.min(5, Math.max(0, r.rating)) },
                      (_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ),
                    )}
                  </div>
                  <p>{r.text}</p>
                  <strong>{r.name}</strong>
                </div>
              ))
            ) : editing ? (
              <span className="empty-block">Avaliações</span>
            ) : null}
          </div>
        ) : editing ? (
          <span className="empty-block">Avaliações · ocultas</span>
        ) : null;
      case 'bump':
        return c.bump ? (
          <label className="document-bump">
            <Checkbox
              checked={bump}
              onCheckedChange={(v) => setBump(Boolean(v))}
            />
            <span>
              {c.bumpTitle}
              <strong>+ {money(c.bumpPrice)}</strong>
            </span>
          </label>
        ) : editing ? (
          <span className="empty-block">Order bump · oculto</span>
        ) : null;
      case 'text':
        return <p className="free-text">{b.content}</p>;
      case 'divider':
        return <div className="document-divider" />;
      case 'footer':
        return (
          <div className="document-footer">
            <span>{b.content || tenant.name}</span>
            <span>Powered by TradingPro</span>
          </div>
        );
      case 'form':
        return (
          <form
            className="document-form"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(
                'Gateway de pagamento ainda não conectado. Nenhuma cobrança foi realizada.',
              );
            }}
          >
            <h2>{d.form.title}</h2>
            <fieldset className="checkout-payment-methods">
              <legend>Forma de pagamento</legend>
              {(c.paymentMethods || ['pix', 'boleto', 'card']).map((method, index) => <label key={method}><input type="radio" name="payment-method" value={method} defaultChecked={index === 0} /><span>{{pix: 'Pix', boleto: 'Boleto', card: 'Cartão de crédito'}[method]}</span></label>)}
            </fieldset>
            <div className="document-fields">
              {d.form.fields
                .filter((f) => f.enabled)
                .map((f) => (
                  <label
                    key={f.id}
                    style={{
                      gridColumn: f.width === 100 ? 'span 2' : 'span 1',
                    }}
                  >
                    <span>
                      {f.label}
                      {f.required && <sup> *</sup>}
                    </span>
                    <input
                      name={f.id}
                      type={f.type}
                      placeholder={f.placeholder}
                      required={f.required}
                      tabIndex={editing ? -1 : undefined}
                      autoComplete={
                        f.id === 'name'
                          ? 'name'
                          : f.id === 'email'
                            ? 'email'
                            : f.id === 'phone'
                              ? 'tel'
                              : 'off'
                      }
                    />
                  </label>
                ))}
            </div>
            <div className="document-total">
              <span>Total</span>
              <strong>
                {money(c.price + (c.bump && bump ? c.bumpPrice : 0))}
              </strong>
            </div>
            <button
              className={`styled-block document-pay ${selected === 'button' ? 'block-selected' : ''}`}
              style={styleVars(d.form.button, d.form.mobileButton)}
              type={editing ? 'button' : 'submit'}
              onClick={
                editing
                  ? (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect?.('button');
                    }
                  : undefined
              }
            >
              {c.button}
              <ArrowUpRight size={18} />
            </button>
            {message && (
              <output className="payment-message">
                {message}
              </output>
            )}
            <p className="document-secure">
              <LockKeyhole size={13} />
              Ambiente de prévia · sem envio de dados
            </p>
          </form>
        );
    }
  }
  function block(b: Block) {
    if (!b.visible && !editing) return null;
    const el = content(b);
    if (el === null) return null;
    return (
      // Editor wrappers contain forms, so a native button cannot wrap them.
      // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        key={b.id}
        data-block-id={b.id}
        className={`styled-block document-block kind-${b.kind} ${editing ? 'editable-block' : ''} ${selected === b.id ? 'block-selected' : ''} ${!b.visible ? 'block-hidden' : ''}`}
        style={
          {
            ...styleVars(b.desktop, b.mobile),
            '--mobile-order': d.mobileOrder.indexOf(b.id),
          } as CSSProperties
        }
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role={editing ? 'button' : undefined}
        tabIndex={editing ? 0 : undefined}
        aria-label={editing ? `Editar ${b.label}` : undefined}
        onClick={
          editing
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect?.(b.id);
              }
            : undefined
        }
        onKeyDown={
          editing
            ? (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSelect?.(b.id);
                }
              }
            : undefined
        }
      >
        {editing && <span className="block-tag">{b.label}</span>}
        {el}
      </div>
    );
  }
  return (
    <div
      className={`checkout-document ${device === 'mobile' ? 'force-mobile' : ''} ${editing ? 'editing-document' : ''}`}
      style={cssVars}
    >
      <div className="document-inner">
        <div className="document-header">
          {d.blocks.filter((b) => b.zone === 'header').map(block)}
        </div>
        <div className={`document-columns ${d.layout} aside-${d.formSide}`}>
          <div className="document-main">
            {d.blocks.filter((b) => b.zone === 'main').map(block)}
          </div>
          <div className="document-aside">
            {d.blocks.filter((b) => b.zone === 'aside').map(block)}
          </div>
        </div>
        <div className="document-bottom">
          {d.blocks.filter((b) => b.zone === 'footer').map(block)}
        </div>
      </div>
    </div>
  );
}
