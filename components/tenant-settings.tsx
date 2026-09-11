'use client';
import { useEffect, useState } from 'react';
import type { Tenant, LoginTemplate } from '@/lib/model';
import { ImageControl } from './editor-controls';
import { ExternalLink, Save, X } from './icons';


export function PlatformLink({ tenant }: { tenant: Tenant }) {
  const host = tenant.domain || (tenant.slug === 'tradingpro' ? 'tradingpro.io' : `${tenant.slug}.tradingpro.io`);
  const prototypeQuery = `?name=${encodeURIComponent(tenant.name)}&color=${encodeURIComponent(tenant.color)}&logo=${encodeURIComponent(tenant.logo || '')}&favicon=${encodeURIComponent(tenant.favicon || '')}&secondaryColor=${encodeURIComponent(tenant.secondaryColor || '')}&font=${encodeURIComponent(tenant.font || '')}`;
  return (
    <a
      className="secondary"
      href={`/prototipo${prototypeQuery}`}
      target="_blank"
      rel="noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      Acessar plataforma ({host}) <ExternalLink size={16} />
    </a>
  );
}


// ── SVG previews for login templates ──────────────────────────────────────
const LOGIN_TEMPLATES: { id: LoginTemplate; label: string; description: string; preview: (color: string) => React.ReactNode }[] = [
  {
    id: 'split',
    label: 'Split',
    description: 'Coluna esquerda com copy da marca e coluna direita com formulário',
    preview: (color) => (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', borderRadius: 8 }}>
        <rect width="280" height="180" fill="#0a0c0a" />
        {/* Left panel */}
        <rect x="8" y="8" width="130" height="164" rx="8" fill="#111410" />
        <rect x="8" y="8" width="130" height="164" rx="8" fill={color} fillOpacity="0.06" />
        <rect x="22" y="22" width="24" height="24" rx="6" fill={color} />
        <rect x="50" y="28" width="60" height="7" rx="3" fill="#fff" fillOpacity="0.8" />
        <rect x="50" y="39" width="40" height="4" rx="2" fill={color} fillOpacity="0.6" />
        <rect x="22" y="62" width="100" height="5" rx="2" fill="#fff" fillOpacity="0.6" />
        <rect x="22" y="72" width="80" height="5" rx="2" fill="#fff" fillOpacity="0.5" />
        <rect x="22" y="82" width="90" height="5" rx="2" fill="#fff" fillOpacity="0.4" />
        <rect x="22" y="100" width="55" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        <rect x="22" y="109" width="70" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        <rect x="22" y="118" width="45" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        {/* Right panel */}
        <rect x="146" y="8" width="126" height="164" rx="8" fill="#111410" />
        <rect x="162" y="24" width="16" height="16" rx="4" fill={color} fillOpacity="0.2" />
        <rect x="182" y="28" width="60" height="5" rx="2" fill="#fff" fillOpacity="0.5" />
        <rect x="162" y="50" width="94" height="7" rx="3" fill="#fff" fillOpacity="0.7" />
        <rect x="162" y="62" width="80" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        <rect x="162" y="80" width="94" height="26" rx="5" fill="#1a1c19" stroke="#ffffff18" strokeWidth="1" />
        <rect x="168" y="86" width="40" height="4" rx="2" fill="#fff" fillOpacity="0.4" />
        <rect x="162" y="114" width="94" height="26" rx="5" fill="#1a1c19" stroke="#ffffff18" strokeWidth="1" />
        <rect x="168" y="120" width="30" height="4" rx="2" fill="#fff" fillOpacity="0.4" />
        <rect x="162" y="148" width="94" height="14" rx="5" fill={color} />
        <rect x="196" y="152" width="26" height="4" rx="2" fill="#0a0c0a" fillOpacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'centered',
    label: 'Centralizado',
    description: 'Card centralizado em fundo escuro com logo grande acima do formulário',
    preview: (color) => (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', borderRadius: 8 }}>
        <rect width="280" height="180" fill="#0a0c0a" />
        <ellipse cx="140" cy="-10" rx="120" ry="80" fill={color} fillOpacity="0.1" />
        {/* Card */}
        <rect x="60" y="14" width="160" height="152" rx="12" fill="#111410" stroke="#ffffff12" strokeWidth="1" />
        {/* Logo */}
        <rect x="116" y="26" width="48" height="48" rx="14" fill={color} />
        <rect x="128" y="38" width="24" height="24" rx="4" fill="#0a0c0a" fillOpacity="0.4" />
        {/* Name */}
        <rect x="90" y="82" width="100" height="6" rx="3" fill="#fff" fillOpacity="0.8" />
        <rect x="106" y="93" width="68" height="4" rx="2" fill="#888" fillOpacity="0.6" />
        {/* Fields */}
        <rect x="76" y="108" width="128" height="16" rx="4" fill="#1a1c19" stroke="#ffffff18" strokeWidth="1" />
        <rect x="82" y="113" width="40" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        <rect x="76" y="129" width="128" height="16" rx="4" fill="#1a1c19" stroke="#ffffff18" strokeWidth="1" />
        <rect x="82" y="134" width="28" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        {/* Button */}
        <rect x="76" y="150" width="128" height="12" rx="4" fill={color} />
        <rect x="112" y="153" width="56" height="4" rx="2" fill="#0a0c0a" fillOpacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'hero',
    label: 'Hero',
    description: 'Gradiente de fundo fullscreen com formulário flutuante à direita',
    preview: (color) => (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', borderRadius: 8 }}>
        <rect width="280" height="180" fill="#090b09" />
        {/* Left hero bg */}
        <rect x="0" y="0" width="168" height="180" fill="#0c100c" />
        <ellipse cx="50" cy="60" rx="100" ry="90" fill={color} fillOpacity="0.13" />
        {/* Hero brand */}
        <rect x="16" y="18" width="28" height="28" rx="8" fill={color} />
        <rect x="48" y="24" width="70" height="6" rx="3" fill="#fff" fillOpacity="0.75" />
        {/* Hero heading */}
        <rect x="16" y="70" width="120" height="9" rx="4" fill="#fff" fillOpacity="0.85" />
        <rect x="16" y="84" width="100" height="9" rx="4" fill="#fff" fillOpacity="0.75" />
        <rect x="16" y="98" width="80" height="9" rx="4" fill={color} fillOpacity="0.9" />
        <rect x="16" y="116" width="110" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        <rect x="16" y="124" width="90" height="4" rx="2" fill="#fff" fillOpacity="0.25" />
        {/* Right panel */}
        <rect x="168" y="0" width="112" height="180" fill="#111410" />
        <rect x="168" y="0" width="1" height="180" fill="#ffffff0a" />
        {/* Form */}
        <rect x="182" y="40" width="84" height="6" rx="3" fill="#fff" fillOpacity="0.7" />
        <rect x="182" y="52" width="60" height="4" rx="2" fill="#888" fillOpacity="0.5" />
        <rect x="182" y="66" width="84" height="18" rx="4" fill="#1a1c19" stroke="#ffffff18" strokeWidth="1" />
        <rect x="188" y="72" width="36" height="4" rx="2" fill="#fff" fillOpacity="0.35" />
        <rect x="182" y="90" width="84" height="18" rx="4" fill="#1a1c19" stroke="#ffffff18" strokeWidth="1" />
        <rect x="188" y="96" width="28" height="4" rx="2" fill="#fff" fillOpacity="0.35" />
        <rect x="182" y="116" width="84" height="14" rx="4" fill={color} />
        <rect x="204" y="120" width="40" height="4" rx="2" fill="#0a0c0a" fillOpacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'glassmorphism',
    label: 'Glassmorphism',
    description: 'Efeito frosted glass com esferas luminosas em background escuro',
    preview: (color) => (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', borderRadius: 8 }}>
        <rect width="280" height="180" fill="#080b08" />
        <circle cx="80" cy="50" r="55" fill={color} fillOpacity="0.22" />
        <circle cx="210" cy="130" r="65" fill={color} fillOpacity="0.16" />
        <circle cx="140" cy="90" r="35" fill="#3b82f6" fillOpacity="0.12" />
        <rect x="62" y="16" width="156" height="148" rx="14" fill="#ffffff" fillOpacity="0.05" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1" />
        <rect x="126" y="26" width="28" height="28" rx="8" fill={color} fillOpacity="0.2" stroke={color} strokeOpacity="0.4" />
        <circle cx="140" cy="40" r="5" fill={color} />
        <rect x="96" y="62" width="88" height="6" rx="3" fill="#fff" fillOpacity="0.9" />
        <rect x="110" y="72" width="60" height="3" rx="1.5" fill="#888" fillOpacity="0.6" />
        <rect x="76" y="86" width="128" height="18" rx="5" fill="#ffffff" fillOpacity="0.05" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
        <rect x="84" y="92" width="45" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        <rect x="76" y="110" width="128" height="18" rx="5" fill="#ffffff" fillOpacity="0.05" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
        <rect x="84" y="116" width="35" height="4" rx="2" fill="#fff" fillOpacity="0.3" />
        <rect x="76" y="136" width="128" height="16" rx="5" fill={color} />
        <rect x="114" y="142" width="52" height="4" rx="2" fill="#070907" fillOpacity="0.8" />
      </svg>
    ),
  },
  {
    id: 'minimal',
    label: 'Minimalista',
    description: 'Estilo clean e sofisticado com linhas sutis e foco na tipografia',
    preview: (color) => (
      <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', borderRadius: 8 }}>
        <rect width="280" height="180" fill="#0c0d0c" />
        <line x1="20" y1="20" x2="260" y2="20" stroke="#ffffff08" strokeWidth="1" />
        <rect x="128" y="24" width="24" height="24" rx="6" fill="#181a17" stroke="#ffffff1a" strokeWidth="1" />
        <circle cx="140" cy="36" r="4" fill={color} />
        <rect x="100" y="55" width="80" height="5" rx="2" fill="#fff" fillOpacity="0.85" />
        <rect x="114" y="64" width="52" height="3" rx="1.5" fill="#666" />
        <rect x="68" y="74" width="144" height="92" rx="8" fill="#121412" stroke="#ffffff14" strokeWidth="1" />
        <rect x="78" y="86" width="124" height="16" rx="4" fill="#0c0d0c" stroke="#ffffff15" strokeWidth="1" />
        <rect x="84" y="92" width="38" height="4" rx="2" fill="#fff" fillOpacity="0.25" />
        <rect x="78" y="108" width="124" height="16" rx="4" fill="#0c0d0c" stroke="#ffffff15" strokeWidth="1" />
        <rect x="84" y="114" width="30" height="4" rx="2" fill="#fff" fillOpacity="0.25" />
        <rect x="78" y="132" width="124" height="18" rx="4" fill={color} />
        <rect x="118" y="139" width="44" height="4" rx="2" fill="#070907" fillOpacity="0.85" />
      </svg>
    ),
  },
];

function LoginTemplatePicker({ value, color, onChange }: {
  value: LoginTemplate;
  color: string;
  onChange: (t: LoginTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = LOGIN_TEMPLATES.find(t => t.id === value) || LOGIN_TEMPLATES[0];

  return (
    <>
      <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span>Template de login</span>
        <small style={{ color: '#88947f', fontSize: 11, marginTop: -4 }}>
          Aparência da página de login da sua operação
        </small>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={e => e.key === 'Enter' && setOpen(true)}
          style={{
            cursor: 'pointer',
            border: '1px solid #ffffff1c',
            borderRadius: 10,
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '16/10',
            background: '#111410',
          }}
        >
          {current.preview(color)}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '8px 12px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{current.label}</span>
            <span style={{ color: color, fontSize: 11 }}>Trocar template →</span>
          </div>
        </div>
      </div>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            background: '#111410',
            border: '1px solid #ffffff12',
            borderRadius: 16,
            padding: 24,
            maxWidth: 820,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Escolher template de login</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>Selecione o estilo da tela de login da sua plataforma</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {LOGIN_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { onChange(t.id); setOpen(false); }}
                  style={{
                    background: 'none',
                    border: `2px solid ${value === t.id ? color : '#ffffff14'}`,
                    borderRadius: 10,
                    padding: 0,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: value === t.id ? `0 0 0 1px ${color}44` : 'none',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ aspectRatio: '16/10', width: '100%' }}>
                    {t.preview(color)}
                  </div>
                  <div style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    background: value === t.id ? color + '12' : '#0a0c0a',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: value === t.id ? color : '#fff', marginBottom: 2 }}>
                      {value === t.id ? '✓ ' : ''}{t.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>{t.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



export default function TenantSettings({ tenant, mode, busy, onSave, onDraftChange }: {
  tenant: Tenant; mode: 'identity' | 'domains'; busy: boolean;
  onSave: (tenant: Tenant) => Promise<unknown>;
  onDraftChange?: (draft: Tenant) => void;
}) {
  const [draft, setDraft] = useState(tenant);
  const [error, setError] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(tenant);

  useEffect(() => {
    setDraft(tenant);
  }, [tenant]);

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  useEffect(() => {
    if (mode !== 'identity') return;
    try {
      const payload = {
        name: draft.name,
        color: draft.color,
        secondaryColor: draft.secondaryColor || '#ffffff',
        logo: draft.logo || '',
        favicon: draft.favicon || '',
        font: draft.font || 'Inter',
        darkMode: draft.darkMode !== false,
        loginTemplate: draft.loginTemplate || 'split',
      };
      localStorage.setItem('whitelabel_tenant_branding', JSON.stringify(payload));
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('whitelabel_branding');
        ch.postMessage({ type: 'WHITELABEL_BRANDING_UPDATE', branding: payload });
        ch.close();
      }
      const iframes = document.querySelectorAll('iframe.prototype-preview-frame');
      for (const iframe of iframes) {
        (iframe as HTMLIFrameElement).contentWindow?.postMessage(
          { type: 'WHITELABEL_BRANDING_UPDATE', branding: payload },
          '*',
        );
      }
    } catch {}
  }, [draft, mode]);


  const prototypeQuery = `?name=${encodeURIComponent(draft.name)}&color=${encodeURIComponent(draft.color)}&logo=${encodeURIComponent(draft.logo || '')}&favicon=${encodeURIComponent(draft.favicon || '')}&secondaryColor=${encodeURIComponent(draft.secondaryColor || '')}&font=${encodeURIComponent(draft.font || '')}`;

  return <form className="tenant-settings" onSubmit={(e) => { e.preventDefault(); void onSave(draft); }}>
    <div className="tenant-settings-fields">
      {mode === 'identity' ? <>
        <label className="field"><span>Nome da plataforma</span><input required value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
        <ImageControl label="Logo da plataforma" value={draft.logo || ''} onChange={logo => setDraft({ ...draft, logo })} onError={setError} />
        <ImageControl label="Ícone da plataforma / Favicon da aba" value={draft.favicon || ''} onChange={favicon => setDraft({ ...draft, favicon })} onError={setError} />
        {error && <p role="alert">{error}</p>}
        <label className="field">
          <span>Fonte da plataforma</span>
          <select
            value={draft.font || 'Inter'}
            onChange={e => setDraft({ ...draft, font: e.target.value })}
            style={{
              width: '100%',
              background: '#1a1c19',
              border: '1px solid #ffffff1c',
              borderRadius: 5,
              color: 'inherit',
              padding: '10px 12px',
              font: 'inherit',
              fontSize: '13px',
            }}
          >
            {['Inter', 'Sora', 'Roboto', 'Poppins', 'Montserrat', 'Plus Jakarta Sans', 'Outfit', 'Manrope', 'Open Sans', 'Lato', 'Nunito'].map(f => (
              <option key={f} value={f} style={{ background: '#20221e', color: '#fff' }}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label className="field">
            <span>Cor principal</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a1c19', border: '1px solid #ffffff1c', borderRadius: 5, padding: '6px 10px' }}>
              <input type="color" value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#b0b8a8' }}>{draft.color}</span>
            </div>
          </label>
          <label className="field">
            <span>Cor secundária</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a1c19', border: '1px solid #ffffff1c', borderRadius: 5, padding: '6px 10px' }}>
              <input type="color" value={draft.secondaryColor || '#ffffff'} onChange={e => setDraft({ ...draft, secondaryColor: e.target.value })} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#b0b8a8' }}>{draft.secondaryColor || '#ffffff'}</span>
            </div>
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #ffffff10', borderBottom: '1px solid #ffffff10', margin: '10px 0' }}>
          <div>
            <strong style={{ fontSize: '13px', display: 'block' }}>Tema escuro nativo</strong>
            <small style={{ color: '#88947f', fontSize: '11px' }}>Aparência padrão dos checkouts e páginas</small>
          </div>
          <input
            type="checkbox"
            checked={draft.darkMode !== false}
            onChange={e => setDraft({ ...draft, darkMode: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: draft.color, cursor: 'pointer' }}
          />
        </div>
        <LoginTemplatePicker
          value={(draft.loginTemplate as LoginTemplate) || 'split'}
          color={draft.color}
          onChange={loginTemplate => setDraft({ ...draft, loginTemplate })}
        />
      </> : <>

        <label className="field"><span>Subdomínio da plataforma</span><input readOnly value={tenant.slug === 'tradingpro' ? 'tradingpro.io' : `${tenant.slug}.tradingpro.io`} /></label>
        <label className="field"><span>Domínio personalizado</span><input placeholder="app.suaempresa.com" value={draft.domain} onChange={e => setDraft({ ...draft, domain: e.target.value.trim() })} /></label>
        <p className="settings-status">{tenant.domain ? 'Domínio salvo · conexão DNS não verificada' : 'Domínio personalizado não configurado'}</p>
        <PlatformLink tenant={tenant} />
      </>}
      <div className="settings-actions"><button className="primary" disabled={busy || !dirty}><Save size={16} />{busy ? 'Salvando…' : 'Salvar alterações'}</button><button type="button" className="secondary" disabled={!dirty || busy} onClick={() => setDraft(tenant)}>Descartar</button></div>
    </div>
    {mode === 'identity' && <div className="tenant-brand-preview" style={{ borderTopColor: draft.color, fontFamily: `${draft.font || 'Inter'}, sans-serif` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
        {draft.favicon && (
          <img
            src={draft.favicon}
            alt="Favicon"
            title="Ícone / Favicon"
            style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'contain', border: '1px solid #ffffff1a', background: '#111', padding: 2 }}
          />
        )}
        {draft.logo ? (
          <img src={draft.logo} alt="Logo da plataforma" style={{ maxHeight: 34, maxWidth: 130, objectFit: 'contain' }} />
        ) : (
          <span style={{ color: draft.color, fontWeight: 700, fontSize: '24px' }}>
            {draft.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <h2 style={{ fontFamily: `${draft.font || 'Inter'}, sans-serif` }}>{draft.name}</h2>
      <p>{tenant.domain || (tenant.slug === 'tradingpro' ? 'tradingpro.io' : `${tenant.slug}.tradingpro.io`)}</p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
        <span className="brand-swatch" style={{ background: draft.color }} title="Cor principal" />
        {draft.secondaryColor && <span className="brand-swatch" style={{ background: draft.secondaryColor }} title="Cor secundária" />}
      </div>
      <div style={{ marginTop: '16px', padding: '10px 14px', background: '#ffffff08', borderRadius: 6, width: '100%', textAlign: 'center' }}>
        <small style={{ color: '#88987d', display: 'block', marginBottom: 4 }}>Fonte ativa</small>
        <strong style={{ fontSize: '13px', color: draft.color }}>{draft.font || 'Inter'}</strong>
      </div>
      <button type="button" style={{ marginTop: '12px', width: '100%', padding: '8px', borderRadius: 5, background: draft.color, color: '#101509', fontWeight: 600, border: 'none', cursor: 'default', fontSize: '12px' }}>
        Botão de Demonstração
      </button>
      <a
        href="/login"
        target="_blank"
        rel="noreferrer"
        className="secondary"
        style={{
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          textAlign: 'center',
          fontSize: '12px',
          padding: '8px 10px',
          borderRadius: 5,
          textDecoration: 'none',
        }}
      >
        Testar Tela de Login em Nova Aba <ExternalLink size={14} />
      </a>
    </div>}
  </form>;
}

