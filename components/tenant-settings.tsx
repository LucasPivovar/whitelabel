'use client';
import { useState } from 'react';
import type { Tenant } from '@/lib/model';
import { ImageControl } from './editor-controls';
import { ExternalLink, Save } from './icons';

export function PlatformLink({ tenant }: { tenant: Tenant }) {
  const host = tenant.domain || (tenant.slug === 'tradingpro' ? 'tradingpro.io' : `${tenant.slug}.tradingpro.io`);
  return <a className="secondary" href={`https://${host}`} target="_blank" rel="noreferrer">Acessar plataforma ({host}) <ExternalLink size={16} /></a>;
}

export default function TenantSettings({ tenant, mode, busy, onSave }: {
  tenant: Tenant; mode: 'identity' | 'domains'; busy: boolean;
  onSave: (tenant: Tenant) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState(tenant);
  const [error, setError] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(tenant);
  return <form className="tenant-settings" onSubmit={(e) => { e.preventDefault(); void onSave(draft); }}>
    <div className="tenant-settings-fields">
      {mode === 'identity' ? <>
        <label className="field"><span>Nome da plataforma</span><input required value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
        <ImageControl label="Logo da plataforma" value={draft.logo} onChange={logo => setDraft({ ...draft, logo })} onError={setError} />
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
      </> : <>
        <label className="field"><span>Subdomínio da plataforma</span><input readOnly value={tenant.slug === 'tradingpro' ? 'tradingpro.io' : `${tenant.slug}.tradingpro.io`} /></label>
        <label className="field"><span>Domínio personalizado</span><input placeholder="app.suaempresa.com" value={draft.domain} onChange={e => setDraft({ ...draft, domain: e.target.value.trim() })} /></label>
        <p className="settings-status">{tenant.domain ? 'Domínio salvo · conexão DNS não verificada' : 'Domínio personalizado não configurado'}</p>
        <PlatformLink tenant={tenant} />
      </>}
      <div className="settings-actions"><button className="primary" disabled={busy || !dirty}><Save size={16} />{busy ? 'Salvando…' : 'Salvar alterações'}</button><button type="button" className="secondary" disabled={!dirty || busy} onClick={() => setDraft(tenant)}>Descartar</button></div>
    </div>
    {mode === 'identity' && <div className="tenant-brand-preview" style={{ borderTopColor: draft.color, fontFamily: `${draft.font || 'Inter'}, sans-serif` }}>
      {draft.logo ? <img src={draft.logo} alt="Logo da plataforma" /> : <span style={{ color: draft.color, fontWeight: 700, fontSize: '24px' }}>{draft.name.slice(0, 2).toUpperCase()}</span>}
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
    </div>}
  </form>;
}
