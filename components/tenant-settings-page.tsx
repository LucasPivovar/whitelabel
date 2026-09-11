'use client';

import { useState, useEffect, type FormEvent } from 'react';
import type { Tenant, Session } from '@/lib/model';
import TenantSettings from './tenant-settings';
import LoginPreviewMockup from './login-preview-mockup';
import {
  User,
  LockKeyhole,
  Mail,
  Zap,
  ShieldCheck,
  Save,
  Palette,
  Check,
  Building2,
  Plug,
  Archive,
  ArrowUpRight,
  Monitor,
  Smartphone,
  ExternalLink,
} from './icons';

interface Props {
  tenant: Tenant;
  busy: boolean;
  session: Session;
  mutate: (
    action: string,
    value?: unknown,
    extra?: Record<string, unknown>,
  ) => Promise<Session | null>;
  setNotice: (msg: string) => void;
  reload: () => Promise<void>;
  view?: string;
}

export default function TenantSettingsPage({
  tenant,
  busy,
  session,
  mutate,
  setNotice,
  reload,
  view = 'all',
}: Props) {
  // Preview device state & active draft tracking
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [currentDraft, setCurrentDraft] = useState<Tenant>(tenant);

  useEffect(() => {
    setCurrentDraft(tenant);
  }, [tenant]);

  // Credentials draft state
  const [adminName, setAdminName] = useState(tenant.admin || 'Administrador');
  const [adminEmail, setAdminEmail] = useState(tenant.email);
  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [credBusy, setCredBusy] = useState(false);
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');

  const hasCredChanges =
    adminName.trim() !== (tenant.admin || 'Administrador') ||
    adminEmail.trim().toLowerCase() !== tenant.email.toLowerCase() ||
    Boolean(newPassword);

  async function handleSaveCredentials(e: FormEvent) {
    e.preventDefault();
    setCredError('');
    setCredSuccess('');

    if (newPassword) {
      if (newPassword.length < 8) {
        setCredError('A nova senha deve ter no mínimo 8 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setCredError('As senhas digitadas não coincidem.');
        return;
      }
    }

    setCredBusy(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName.trim(),
          email: adminEmail.trim().toLowerCase(),
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error || 'Falha ao salvar dados de acesso.');

      setCredSuccess('Dados de acesso e perfil atualizados com sucesso!');
      setNotice('Perfil e credenciais de acesso atualizados com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      await reload();
    } catch (err) {
      setCredError((err as Error).message);
    } finally {
      setCredBusy(false);
    }
  }

  return (
    <div className="tenant-settings-page-container">
      <div className="settings-cards-grid">
        {/* CARDS 1 & 2: Perfil, Acesso & Plano (Ocultos na aba de Identidade Visual) */}
        {view !== 'identity' && (
          <>
            {/* CARD 1: Perfil & Acesso da Operação */}
            <section className="settings-card">
          <div className="settings-card-header">
            <div className="icon-wrap">
              <User size={22} />
            </div>
            <div>
              <h2>Perfil & Acesso da Operação</h2>
              <p>Gerencie o nome do gestor, e-mail de login e senha de acesso à área da sua marca</p>
            </div>
          </div>
          <div className="settings-card-body">
            {credError && (
              <div
                style={{
                  background: '#ff4d4f20',
                  border: '1px solid #ff4d4f60',
                  color: '#ff8a80',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {credError}
              </div>
            )}
            {credSuccess && (
              <div
                style={{
                  background: '#96d60020',
                  border: '1px solid #96d60060',
                  color: '#b2f022',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Check size={16} />
                {credSuccess}
              </div>
            )}

            <form onSubmit={handleSaveCredentials}>
              <div className="info-rows" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label className="field">
                  <span>Nome do Gestor da Operação</span>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Ex: João Silva"
                    style={{
                      width: '100%',
                      background: '#191c16',
                      border: '1px solid #ffffff1c',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '9px 12px',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field">
                  <span>E-mail de Login da Operação</span>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@suaoperacao.com"
                    style={{
                      width: '100%',
                      background: '#191c16',
                      border: '1px solid #ffffff1c',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '9px 12px',
                      fontSize: 13,
                    }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <label className="field">
                    <span>Nova Senha</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        background: '#191c16',
                        border: '1px solid #ffffff1c',
                        borderRadius: 6,
                        color: '#fff',
                        padding: '9px 12px',
                        fontSize: 13,
                      }}
                    />
                  </label>

                  <label className="field">
                    <span>Confirmar Senha</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        background: '#191c16',
                        border: '1px solid #ffffff1c',
                        borderRadius: 6,
                        color: '#fff',
                        padding: '9px 12px',
                        fontSize: 13,
                      }}
                    />
                  </label>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid #ffffff10',
                }}
              >
                <button
                  type="button"
                  className="secondary"
                  disabled={!hasCredChanges || credBusy}
                  onClick={() => {
                    setAdminName(tenant.admin || 'Administrador');
                    setAdminEmail(tenant.email);
                    setNewPassword('');
                    setConfirmPassword('');
                    setCredError('');
                    setCredSuccess('');
                  }}
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="primary"
                  disabled={!hasCredChanges || credBusy}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={15} />
                  {credBusy ? 'Salvando…' : 'Salvar dados de acesso'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* CARD 2: Seu Plano White Label */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="icon-wrap" style={{ background: '#1c2813', color: '#96d600' }}>
              <Zap size={22} />
            </div>
            <div>
              <h2>Seu Plano White Label</h2>
              <p>Assinatura ativa, recursos liberados e limites da sua infraestrutura</p>
            </div>
            <span className="status green">
              <span />
              Plano Ativo
            </span>
          </div>
          <div className="settings-card-body">
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(150, 214, 0, 0.12) 0%, rgba(20, 25, 17, 0.6) 100%)',
                border: '1px solid rgba(150, 214, 0, 0.25)',
                borderRadius: 8,
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    color: '#96d600',
                    fontWeight: 700,
                  }}
                >
                  ASSINATURA ATUAL
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '4px 0 2px', color: '#fff' }}>
                  Plano Pro White Label
                </h3>
                <small style={{ color: '#a6b89e' }}>
                  Cobrança mensal · Próxima renovação automática em 30 dias
                </small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#96d600' }}>
                  R$ 497<small style={{ fontSize: 13, fontWeight: 500, color: '#b2c8a7' }}>/mês</small>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    background: '#96d60025',
                    color: '#aef422',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  Status: 100% Regular
                </span>
              </div>
            </div>

            <div className="info-rows">
              <div className="info-row">
                <span>Taxa da Plataforma por Venda</span>
                <strong style={{ color: '#96d600' }}>0% (Taxa Zero · 100% seu)</strong>
              </div>
              <div className="info-row">
                <span>Checkouts e Páginas de Venda</span>
                <strong>Ilimitados (Sem teto de criação)</strong>
              </div>
              <div className="info-row">
                <span>Domínio Próprio (CNAME) & SSL</span>
                <strong>Incluso com renovação automática</strong>
              </div>
              <div className="info-row">
                <span>Conexões com Corretoras</span>
                <strong>Bybit, Admiral, XGlobal liberadas</strong>
              </div>
              <div className="info-row">
                <span>Snapshots e Backups Automáticos</span>
                <strong>Diários com hash criptográfico SHA-256</strong>
              </div>
              <div className="info-row">
                <span>Suporte da Operação</span>
                <strong>Gerente de Conta VIP (Telegram / Discord)</strong>
              </div>
            </div>
          </div>
        </section>
          </>
        )}

        {/* CARD 3: Customização & Identidade Visual */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="icon-wrap">
              <Palette size={22} />
            </div>
            <div>
              <h2>Identidade Visual & Customização</h2>
              <p>Personalize logo, cores principais, tipografia e modo visual da sua plataforma</p>
            </div>
          </div>
          <div className="settings-card-body">
            <TenantSettings
              tenant={tenant}
              mode="identity"
              busy={busy}
              onDraftChange={setCurrentDraft}
              onSave={async (draft) => {
                await mutate('tenant', draft);
                setNotice('Identidade visual atualizada com sucesso!');
                await reload();
              }}
            />
          </div>
        </section>

        {/* CARD 4: Prévia da Tela de Login */}
        <section className="settings-card preview-card-section" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="icon-wrap">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2>Prévia da Tela de Login</h2>
                <p>Visualização estática em tempo real do template de login selecionado com a identidade da marca</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'inline-flex', background: '#141713', padding: 3, borderRadius: 8, border: '1px solid #ffffff14' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={previewDevice === 'desktop' ? 'primary' : 'secondary'}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 32,
                  }}
                  title="Visão Desktop"
                >
                  <Monitor size={15} /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={previewDevice === 'mobile' ? 'primary' : 'secondary'}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 32,
                  }}
                  title="Visão Mobile"
                >
                  <Smartphone size={15} /> Celular
                </button>
              </div>
              <a
                href="/login"
                target="_blank"
                rel="noreferrer"
                className="primary"
                style={{
                  height: 32,
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  textDecoration: 'none',
                }}
                title="Abrir tela de login real em nova aba"
              >
                Testar Login Real <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <div
            className="settings-card-body"
            style={{
              display: 'flex',
              justifyContent: 'center',
              background: '#0a0c0a',
              padding: previewDevice === 'mobile' ? '28px 16px' : '16px',
              borderRadius: 8,
              border: '1px solid #ffffff12',
              overflow: 'hidden',
              minHeight: 520,
            }}
          >
            {previewDevice === 'desktop' ? (
              <div
                style={{
                  width: '100%',
                  height: 720,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #ffffff18',
                  background: '#090b09',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Mock browser topbar */}
                <div
                  style={{
                    height: 32,
                    background: '#141713',
                    borderBottom: '1px solid #ffffff0d',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f56' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#27c93f' }} />
                  <div
                    style={{
                      margin: '0 auto',
                      width: 240,
                      height: 18,
                      background: '#0c0f0a',
                      borderRadius: 4,
                      border: '1px solid #ffffff0a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: '#666',
                    }}
                  >
                    https://{currentDraft.domain || `${currentDraft.slug}.tradingpro.io`}/login
                  </div>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <LoginPreviewMockup draft={currentDraft} isMobile={false} />
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: 360,
                  maxWidth: '100%',
                  height: 660,
                  boxSizing: 'border-box',
                  borderRadius: 36,
                  border: '8px solid #222720',
                  boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px #ffffff1a',
                  overflow: 'hidden',
                  background: '#090b09',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Fake Phone Notch */}
                <div
                  style={{
                    height: 22,
                    background: '#191c16',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 10,
                      background: '#0d0f0c',
                      borderRadius: 10,
                    }}
                  />
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <LoginPreviewMockup draft={currentDraft} isMobile={true} />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
