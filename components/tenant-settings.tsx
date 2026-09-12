'use client';
import { useEffect, useState } from 'react';
import type { Tenant, LoginTemplate } from '@/lib/model';
import { create as createPalette } from '@/lib/brand-palette';
import LoginTemplateThumbnail from './login-template-thumbnail';
import { ImageControl } from './editor-controls';
import { ExternalLink, Save, X } from './icons';


export function PlatformLink({ tenant }: { tenant: Tenant }) {
  const prototypeQuery = `?name=${encodeURIComponent(tenant.name)}&color=${encodeURIComponent(tenant.color)}&logo=${encodeURIComponent(tenant.logo || '')}&favicon=${encodeURIComponent(tenant.favicon || '')}&secondaryColor=${encodeURIComponent(tenant.secondaryColor || '')}&font=${encodeURIComponent(tenant.font || '')}&loginTemplate=${encodeURIComponent(tenant.loginTemplate || 'split')}`;
  return (
    <a
      className="secondary"
      href={`/prototipo${prototypeQuery}`}
      target="_blank"
      rel="noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      Acessar protótipo <ExternalLink size={16} />
    </a>
  );
}


const LOGIN_TEMPLATES: { id: LoginTemplate; label: string; description: string }[] = [
  { id: 'split', label: 'Split', description: 'Marca e formulário em duas colunas' },
  { id: 'centered', label: 'Centralizado', description: 'Formulário centralizado com destaque para a marca' },
  { id: 'hero', label: 'Hero', description: 'Marca em destaque e formulário à direita' },
  { id: 'glassmorphism', label: 'Glassmorphism', description: 'Formulário com superfície translúcida' },
  { id: 'minimal', label: 'Minimalista', description: 'Tipografia e formulário em um layout compacto' },
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
        <small style={{ color: "var(--muted-foreground)", fontSize: 11, marginTop: -4 }}>
          Aparência da página de login da sua operação
        </small>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={e => e.key === 'Enter' && setOpen(true)}
          style={{
            cursor: 'pointer',
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '16/10',
            background: "var(--background)",
          }}
        >
          <LoginTemplateThumbnail template={current.id} color={color} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '8px 12px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{current.label}</span>
            <span style={{ color: 'var(--brand-accent)', fontSize: 11 }}>Trocar template →</span>
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
            background: "var(--background)",
            border: "1px solid var(--border)",
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
                aria-label="Fechar templates"
                title="Fechar templates"
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
                    borderRadius: 8,
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
                    <LoginTemplateThumbnail template={t.id} color={color} />
                  </div>
                  <div style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    background: 'var(--card)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: value === t.id ? 'var(--brand-accent)' : '#fff', marginBottom: 2 }}>
                      {value === t.id ? '✓ ' : ''}{t.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{t.description}</div>
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
  const palette = createPalette(draft.color, draft.secondaryColor);
  function updateColor(field: 'color' | 'secondaryColor', value: string) {
    setDraft(current => current[field] === value ? current : { ...current, [field]: value });
  }
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
    window.dispatchEvent(new CustomEvent('whitelabel:identity-draft', { detail: draft }));
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
          window.location.origin,
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
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              color: 'inherit',
              padding: '10px 12px',
              font: 'inherit',
              fontSize: '13px',
            }}
          >
            {['Inter', 'Sora', 'Roboto', 'Poppins', 'Montserrat', 'Plus Jakarta Sans', 'Outfit', 'Manrope', 'Open Sans', 'Lato', 'Nunito'].map(f => (
              <option key={f} value={f} style={{ background: "var(--card)", color: '#fff' }}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label className="field">
            <span>Cor principal</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: "var(--card)", border: "1px solid var(--border)", borderRadius: 5, padding: '6px 10px' }}>
              <input type="color" value={draft.color} onInput={e => updateColor('color', e.currentTarget.value)} onChange={e => updateColor('color', e.target.value)} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: "var(--muted-foreground)" }}>{draft.color}</span>
            </div>
          </label>
          <label className="field">
            <span>Cor secundária</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: "var(--card)", border: "1px solid var(--border)", borderRadius: 5, padding: '6px 10px' }}>
              <input type="color" value={draft.secondaryColor || '#ffffff'} onInput={e => updateColor('secondaryColor', e.currentTarget.value)} onChange={e => updateColor('secondaryColor', e.target.value)} style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: "var(--muted-foreground)" }}>{draft.secondaryColor || '#ffffff'}</span>
            </div>
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", margin: '10px 0' }}>
          <div>
            <strong style={{ fontSize: '13px', display: 'block' }}>Tema escuro nativo</strong>
            <small style={{ color: "var(--muted-foreground)", fontSize: '11px' }}>Aparência padrão dos checkouts e páginas</small>
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

        <label className="field"><span>Subdomínio da plataforma</span><input readOnly value={tenant.domain || 'URL não definida'} /></label>
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
            style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'contain', border: "1px solid var(--border)", background: '#111', padding: 2 }}
          />
        )}
        {draft.logo ? (
          <img src={draft.logo} alt="Logo da plataforma" style={{ maxHeight: 34, maxWidth: 130, objectFit: 'contain' }} />
        ) : (
          <span style={{ color: palette.accent, fontWeight: 700, fontSize: '24px' }}>
            {draft.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <h2 style={{ fontFamily: `${draft.font || 'Inter'}, sans-serif` }}>{draft.name}</h2>
      <p>{tenant.domain || 'URL não definida'}</p>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
        <span className="brand-swatch" style={{ background: draft.color }} title="Cor principal" />
        <span className="brand-swatch" style={{ background: palette.subtle }} title="Tom suave" />
        <span className="brand-swatch" style={{ background: palette.secondary }} title="Cor complementar" />
      </div>
      <div style={{ marginTop: '16px', padding: '10px 14px', background: '#ffffff08', borderRadius: 6, width: '100%', textAlign: 'center' }}>
        <small style={{ color: "var(--muted-foreground)", display: 'block', marginBottom: 4 }}>Fonte ativa</small>
        <strong style={{ fontSize: '13px', color: palette.accent }}>{draft.font || 'Inter'}</strong>
      </div>
      <button type="button" style={{ marginTop: '12px', width: '100%', padding: '8px', borderRadius: 5, background: palette.primary, color: palette.onPrimary, fontWeight: 600, border: 'none', cursor: 'default', fontSize: '12px' }}>
        Botão de Demonstração
      </button>
      <a
        href={`/prototipo/login${prototypeQuery}&loginTemplate=${encodeURIComponent(draft.loginTemplate || 'split')}`}
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

