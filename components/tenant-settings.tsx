'use client';
import { useState } from 'react';
import type { Tenant } from '@/lib/model';
import { ImageControl } from './editor-controls';
import { ExternalLink, Save } from './icons';

export function PlatformLink({ tenant }: { tenant: Tenant }) {
  const host = tenant.domain || `${tenant.slug}.tradingpro.io`;
  return <a className="secondary" href={`https://${host}`} target="_blank" rel="noreferrer">Acessar plataforma <ExternalLink size={16} /></a>;
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
        <label className="field"><span>Cor principal</span><input type="color" value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} /></label>
      </> : <>
        <label className="field"><span>Subdomínio da plataforma</span><input readOnly value={`${tenant.slug}.tradingpro.io`} /></label>
        <label className="field"><span>Domínio personalizado</span><input placeholder="app.suaempresa.com" value={draft.domain} onChange={e => setDraft({ ...draft, domain: e.target.value.trim() })} /></label>
        <p className="settings-status">{tenant.domain ? 'Domínio salvo · conexão DNS não verificada' : 'Domínio personalizado não configurado'}</p>
        <PlatformLink tenant={tenant} />
      </>}
      <div className="settings-actions"><button className="primary" disabled={busy || !dirty}><Save size={16} />{busy ? 'Salvando…' : 'Salvar alterações'}</button><button type="button" className="secondary" disabled={!dirty || busy} onClick={() => setDraft(tenant)}>Descartar</button></div>
    </div>
    {mode === 'identity' && <div className="tenant-brand-preview" style={{ borderTopColor: draft.color }}>
      {draft.logo ? <img src={draft.logo} alt="Logo da plataforma" /> : <span style={{ color: draft.color }}>{draft.name.slice(0, 2).toUpperCase()}</span>}
      <h2>{draft.name}</h2><p>{tenant.domain || `${tenant.slug}.tradingpro.io`}</p><span className="brand-swatch" style={{ background: draft.color }} />
    </div>}
  </form>;
}
