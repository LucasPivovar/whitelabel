'use client';
import { createElement, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Search,
  Building2,
  PanelsTopLeft,
  Plug,
  Globe,
  Settings2,
  ShieldCheck,
  ChevronRight,
  Pencil,
  Copy,
  Trash2,
  Save,
  LockKeyhole,
  Upload,
  Activity,
  Palette,
  Layers,
  ExternalLink,
  X,
  Zap,
  User,
  Users,
  Mail,
  Archive,
  Server,
  Download,
  Robot,
  Undo2,
  MoreVertical,
} from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  type Session,
  type Tenant,
  type Checkout,
  type TenantUser,
  type TenantUserRole,
  getTenantUsers,
  newCheckout,
  slugify,
  money,
  providers,
  availableBots,
  defaultPlatformSettings,
  type PlatformSettings,
  type TradingBotDefinition,
} from '@/lib/model';
import type { BackupSnapshot } from '@/app/api/backup/route';
import { registerCheckoutNavigation } from '@/lib/webmcp';
import Builder from '@/components/checkout-builder';
import RoleToolbar from '@/components/role-toolbar';
import AccountInvite from '@/components/account-invite';
import TenantSettings, { PlatformLink } from '@/components/tenant-settings';
import TenantSettingsPage from '@/components/tenant-settings-page';

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <Switch
        aria-label={label}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
function IconButton({
  label,
  children,
  onClick,
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="icon-button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function Badge({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`status ${active ? 'green' : ''}`}>
      <span />
      {children}
    </span>
  );
}
function Avatar({ tenant }: { tenant: Tenant }) {
  return (
    <span
      className="tenant-avatar"
      style={{ background: tenant.color + '18', color: tenant.color }}
    >
      {tenant.logo ? (
        <img src={tenant.logo} alt="" />
      ) : (
        tenant.name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}
function UploadField({
  label,
  value,
  onChange,
  onError,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onError: (v: string) => void;
}) {
  return (
    <div className="field">
      <span>{label}</span>
      <label className="upload-field">
        {value ? <img src={value} alt={label} /> : <Upload size={20} />}
        <span>
          {value ? 'Substituir imagem' : 'Selecionar imagem'}
          <small>PNG, JPG ou WebP · até 400 KB</small>
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (
              file.size > 400000 ||
              !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
            ) {
              onError('Use PNG, JPG ou WebP com até 400 KB.');
              return;
            }
            try {
              const form = new FormData();
              form.append('file', file);
              const r = await fetch('/api/media', {
                method: 'POST',
                body: form,
              });
              const data = (await r.json()) as { url: string; error?: string };
              if (!r.ok) throw Error(data.error || 'Falha no upload.');
              onChange(data.url);
            } catch (error) {
              onError((error as Error).message);
            }
          }}
        />
      </label>
      {value && (
        <button
          type="button"
          className="text-button"
          onClick={() => onChange('')}
        >
          Remover imagem
        </button>
      )}
    </div>
  );
}
const date = (s: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(s));

export default function Panel({ initialView = 'overview' }: { initialView?: string } = {}) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '').split('/')[0];
      if (path === 'dashboard') return 'overview';
      if (path === 'connections') return 'connections';
      if (path === 'checkouts') return 'checkouts';
      if (path === 'domains') return 'domains';
      if (path === 'identity') return 'identity';
      if (path === 'settings') return 'settings';
      if (path === 'backups') return 'backups';
      if (path === 'tenants') return 'tenants';
      if (path === 'activities') return 'activity';
    }
    return initialView;
  });
  const [tenantId, setTenantId] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [editor, setEditor] = useState<Checkout | null>(null);
  const [deleteId, setDeleteId] = useState('');
  const [manageTenantId, setManageTenantId] = useState<string | null>(null);
  const [manageTab, setManageTab] = useState<string>('users');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<TenantUserRole>('operator');
  const [inviteTenantId, setInviteTenantId] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [backupStats, setBackupStats] = useState<{
    databaseEngine: string;
    dbFile: string;
    totalWorkspaces: number;
    totalAccounts: number;
    totalMediaBlobs: number;
    status: string;
    lastBackupTime: string;
  } | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);

  async function loadBackups() {
    try {
      const res = await fetch('/api/backup');
      const d = await res.json();
      if (d.snapshots) setBackups(d.snapshots);
      if (d.stats) setBackupStats(d.stats);
    } catch (e) {
      console.error('Failed to load backups', e);
    }
  }

  async function createBackup() {
    setBackupBusy(true);
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      const d = await res.json();
      if (!res.ok) throw Error(d.error || 'Falha ao gerar backup.');
      setNotice('Snapshot manual gerado com sucesso!');
      await loadBackups();
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBackupBusy(false);
    }
  }

  async function load() {
    setError('');
    try {
      const r = await fetch('/api/workspace');
      const data = (await r.json()) as Session & { error?: string };
      if (!r.ok) throw Error(data.error || 'Falha na requisição.');
      setSession(data);
      if (data.role === 'tenant') {
        setTenantId(data.tenantId || '');
      }
    } catch (e) {
      setError(String((e as Error).message));
    }
  }
  useEffect(() => {
    void load();
    void loadBackups();
  }, []);
  useEffect(
    () =>
      registerCheckoutNavigation((id) => {
        if (!tenantId || editor) return false;
        const found = session?.state.checkouts.find((c) => c.id === id);
        if (!found) return false;
        setEditor({ ...found });
        return true;
      }),
    [session, editor, tenantId],
  );
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  async function mutate(
    action: string,
    value?: unknown,
    extra: Record<string, unknown> = {},
  ) {
    if (!session || busy) return null;
    setBusy(true);
    try {
      const r = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          value,
          revision: session.revision,
          ...extra,
        }),
      });
      const data = (await r.json()) as Session & { error?: string };
      if (!r.ok) throw Error(data.error || 'Falha na requisição.');
      setSession(data);
      setNotice('Alterações salvas.');
      return data as Session;
    } catch (e) {
      setNotice((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  function go(next: string) {
    setView(next);
    setQuery('');
    setFilter('all');
    setManageTenantId(null);
    if (typeof window !== 'undefined') {
      const urlMap: Record<string, string> = {
        overview: '/dashboard',
        connections: '/connections',
        checkouts: '/checkouts',
        domains: '/domains',
        identity: '/identity',
        settings: '/settings',
        backups: '/backups',
        tenants: '/tenants',
        activity: '/activities',
      };
      const path = urlMap[next] || '/dashboard';
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
  }
  const tenants = session?.state.tenants || [];
  const tenant = tenants.find((t) => t.id === tenantId);
  const managedTenant = tenants.find((t) => t.id === manageTenantId);
  const admin = session?.role === 'admin' && !tenantId;
  const checkouts = (session?.state.checkouts || []).filter(
    (c) => !tenantId || c.tenantId === tenantId,
  );
  const matches = tenants.filter(
    (t) =>
      (t.name + ' ' + t.slug + ' ' + t.email)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === 'all' || t.status === filter),
  );
  function createTenant() {
    setEditTenant({
      id: crypto.randomUUID(),
      name: '',
      slug: '',
      admin: '',
      email: '',
      color: '#96d600',
      logo: '',
      status: 'active',
      domain: '',
      connections: [],
      created: new Date().toISOString(),
    });
  }
  function createCheckout() {
    if (!tenant) {
      setNotice('A criação de checkouts é restrita às operações parceiras.');
      return;
    }
    setEditor(newCheckout(tenant));
  }
  if (!session)
    return (
      <main className="boot">
        <div className="brand">
          <Zap />
          TradingPro<span>console</span>
        </div>
        {error ? (
          <>
            <h1>Não foi possível abrir o painel</h1>
            <p>
              {error === 'UNAUTHORIZED'
                ? 'Entre para acessar a plataforma.'
                : error === 'FORBIDDEN'
                  ? 'O acesso desta operação está suspenso.'
                  : error}
            </p>
            {error === 'UNAUTHORIZED' ? (
              <Link className="primary" href="/login" target="_top">
                Entrar
              </Link>
            ) : (
              <button className="primary" onClick={load}>
                Tentar novamente
              </button>
            )}
          </>
        ) : (
          <>
            <div className="loading-line" />
            <p>Carregando a plataforma…</p>
          </>
        )}
      </main>
    );
  const titles: Record<string, string> = {
    overview: 'Visão geral',
    tenants: 'Operações',
    checkouts: 'Checkouts',
    connections: 'Conexões',
    backups: 'Backups',
    domains: 'Domínios',
    identity: 'Identidade visual',
    settings: 'Configurações',
    activity: 'Atividades',
  };
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '238px' } as React.CSSProperties}
    >
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="brand">
            <Zap fill="currentColor" size={23} />
            TradingPro<span>console</span>
          </Link>
          <div className="workspace-label">
            <ShieldCheck size={16} />
            {tenant ? tenant.name : 'Super admin'}
            <span className="live-dot" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="nav-caption">WORKSPACE</div>
          <SidebarMenu>
            {(tenant
              ? [
                  ['overview', 'Visão geral', Building2],
                  ['checkouts', 'Checkouts', PanelsTopLeft],
                  ['identity', 'Identidade visual', Palette],
                  ['domains', 'Domínios', Globe],
                  ['connections', 'Conexões', Plug],
                  ['backups', 'Backups', Archive],
                  ['activity', 'Atividades', Activity],
                  ['settings', 'Configurações', Settings2],
                ]
              : [
                  ['overview', 'Visão geral', Building2],
                  ['tenants', 'Operações', ShieldCheck],
                  ['connections', 'Conexões', Plug],
                  ['domains', 'Domínios', Globe],
                  ['settings', 'Configurações', Settings2],
                  ['activity', 'Atividades', Activity],
                ]
            ).map(([key, label, Icon]) => (
              <SidebarMenuItem key={key as string}>
                <SidebarMenuButton
                  className="nav-item"
                  isActive={view === key}
                  onClick={() => go(key as string)}
                >
                  <Icon size={19} />
                  <span>{label as string}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          {tenant && admin && (
            <button
              className="back-admin"
              onClick={() => {
                setTenantId('');
                go('overview');
              }}
            >
              <ArrowLeft size={17} />
              Voltar ao super admin
            </button>
          )}
        </SidebarContent>
        <SidebarFooter>
          <div className="sidebar-foot">
            <span className="square-icon">
              <Layers size={18} />
            </span>
            <div>
              TradingPro White Label<small>Central de gerenciamento</small>
            </div>
          </div>
          <div className="profile">
            <span className="profile-avatar">
              {session.email.slice(0, 2).toUpperCase()}
            </span>
            <div>
              {admin ? 'Administrador' : tenant?.admin || 'Admin da operação'}
              <small title={session.email}>{session.email}</small>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger />
            <span>{tenant ? tenant.name : 'Super Admin'}</span>
            <ChevronRight size={14} />
            {managedTenant && view === 'tenants' ? (
              <>
                <button
                  type="button"
                  onClick={() => setManageTenantId(null)}
                  style={{ background: 'none', border: 'none', color: '#96d600', font: 'inherit', cursor: 'pointer', padding: 0 }}
                >
                  {titles[view]}
                </button>
                <ChevronRight size={14} />
                <strong>Gestão: {managedTenant.name}</strong>
              </>
            ) : (
              <strong>{titles[view]}</strong>
            )}
          </div>
          <RoleToolbar
            role={session.role}
            tenantId={tenantId}
            tenants={tenants}
            onChange={(id) => {
              setTenantId(id);
              go(id ? 'overview' : 'overview');
            }}
          />
        </header>
        <main className="content">
          <div className="page-heading">
            {managedTenant && view === 'tenants' ? (
              <>
                <div>
                  <div className="eyebrow">
                    GESTÃO DA OPERAÇÃO · TRADINGPRO.IO
                  </div>
                  <h1>{managedTenant.name}</h1>
                  <p>
                    Central completa de controle para a operação {managedTenant.name}. Gerencie a equipe de usuários, checkouts, páginas e corretoras.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    className="secondary"
                    onClick={() => setManageTenantId(null)}
                  >
                    <ArrowLeft size={16} />
                    Voltar às operações
                  </button>
                  <button
                    className="open-tenant"
                    disabled={managedTenant.status === 'suspended'}
                    onClick={() => {
                      setTenantId(managedTenant.id);
                      setManageTenantId(null);
                      go('overview');
                    }}
                  >
                    Acessar Workspace <ArrowUpRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="eyebrow">
                    {tenant ? 'OPERAÇÃO PARCEIRA' : 'SUPER ADMIN'}
                  </div>
                  <h1>{titles[view]}</h1>
                  <p>
                    {view === 'overview'
                      ? tenant
                        ? 'Área administrativa da sua operação e acessos.'
                        : 'Central de gestão das operações parceiras e infraestrutura white label.'
                      : view === 'tenants'
                        ? 'Gerencie todas as operações parceiras, contas de usuários e acessos.'
                        : view === 'checkouts'
                          ? tenant
                            ? 'Sua oferta. Sua identidade. Seu checkout.'
                            : 'Monitoramento e auditoria das páginas de checkout das operações parceiras.'
                          : view === 'connections'
                            ? tenant
                              ? 'Conexões e corretoras integradas à sua operação.'
                              : 'Permissões e integrações disponíveis para distribuição nas operações.'
                            : view === 'domains'
                              ? tenant
                                ? 'Configuração e apontamento de domínio próprio da sua marca.'
                                : 'Gerenciamento de domínios e apontamentos CNAME das operações.'
                              : view === 'identity'
                                ? 'A sua marca em cada ponto de contato.'
                                : view === 'settings'
                                  ? tenant
                                    ? 'Gerencie credenciais de acesso, plano white label e identidade visual da operação.'
                                    : 'Parâmetros técnicos da plataforma, provedores globais e limites.'
                                  : view === 'backups'
                                    ? 'Pontos de restauração, snapshots e cópias de segurança da operação.'
                                    : 'Histórico de eventos e alterações do sistema.'}
                  </p>
                </div>
                {view === 'tenants' ? (
                  <button className="primary" onClick={createTenant}>
                    <Plus size={17} />
                    Nova operação
                  </button>
                ) : view === 'checkouts' && tenant ? (
                  <button className="primary" onClick={createCheckout}>
                    <Plus size={17} />
                    Novo checkout
                  </button>
                ) : !tenant && view === 'overview' ? (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button className="primary" onClick={createTenant}>
                      <Plus size={16} />
                      Nova operação
                    </button>
                    <button className="secondary" onClick={() => go('settings')}>
                      <Settings2 size={16} />
                      Configurações
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
          {((view === 'tenants' && !managedTenant) || view === 'checkouts') && (
            <div className="metrics">
              {(view === 'tenants'
                ? [
                    [
                      Building2,
                      tenants.length,
                      'Operações cadastradas',
                      'Plataforma white label',
                    ],
                    [
                      ShieldCheck,
                      tenants.filter((t) => t.status === 'active').length,
                      'Operações ativas',
                      'Prontas para gerenciar',
                    ],
                    [
                      PanelsTopLeft,
                      session.state.checkouts.length,
                      'Checkouts criados',
                      `${session.state.checkouts.filter((c) => c.published).length} publicados`,
                    ],
                    [
                      Plug,
                      tenants.reduce((n, t) => n + t.connections.length, 0),
                      'Conexões liberadas',
                      'Permissões por operação',
                    ],
                  ]
                : [
                    [
                      PanelsTopLeft,
                      checkouts.length,
                      'Checkouts criados',
                      'Todas as suas ofertas',
                    ],
                    [
                      Globe,
                      checkouts.filter((c) => c.published).length,
                      'Publicados',
                      'Versões disponíveis',
                    ],
                    [
                      Pencil,
                      checkouts.filter((c) => !c.published).length,
                      'Rascunhos',
                      'Em preparação',
                    ],
                  ]
              ).map(([Icon, n, label, detail]) => (
                <div className="metric" key={label as string}>
                  <div>
                    <span>{label as string}</span>
                    {createElement(Icon as typeof Building2, { size: 18 })}
                  </div>
                  <strong>{n as number}</strong>
                  <small>{detail as string}</small>
                </div>
              ))}
            </div>
          )}
          {view === 'tenants' && managedTenant && (
            <div className="tenant-manage-hub">
              {/* Tenant Master Card */}
              <div className="tenant-hub-card">
                <div className="tenant-hub-hero">
                  <Avatar tenant={managedTenant} />
                  <div className="tenant-hub-info">
                    <div className="hub-title-row">
                      <h2>{managedTenant.name}</h2>
                      <Badge active={managedTenant.status === 'active'}>
                        {managedTenant.status === 'active' ? 'Operação Ativa' : 'Operação Suspensa'}
                      </Badge>
                      <span className="slug-tag">slug: {managedTenant.slug}</span>
                    </div>
                    <p className="tenant-hub-subtext">
                      Administrador principal: <strong>{managedTenant.admin}</strong> ({managedTenant.email}) · Criada em {date(managedTenant.created)}
                    </p>
                    <div className="tenant-hub-links">
                      <a
                        href={managedTenant.domain ? `https://${managedTenant.domain}` : '#'}
                        target={managedTenant.domain ? '_blank' : undefined}
                        rel="noreferrer"
                        className="tenant-domain-pill"
                      >
                        <Globe size={14} />
                        {managedTenant.domain || 'URL não definida'}
                        {managedTenant.domain && <ExternalLink size={12} />}
                      </a>
                      <button
                        className={managedTenant.status === 'active' ? 'danger text-btn' : 'primary text-btn'}
                        style={{ padding: '4px 10px', fontSize: 12, borderRadius: 5 }}
                        onClick={() =>
                          void mutate('tenant', {
                            ...managedTenant,
                            status: managedTenant.status === 'active' ? 'suspended' : 'active',
                          })
                        }
                      >
                        {managedTenant.status === 'active' ? 'Suspender Operação' : 'Reativar Operação'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="tenant-hub-stats">
                  <div className="hub-stat-item">
                    <span>USUÁRIOS / EQUIPE</span>
                    <strong>{getTenantUsers(managedTenant).length}</strong>
                    <small>Membros na operação</small>
                  </div>
                  <div className="hub-stat-item">
                    <span>CHECKOUTS</span>
                    <strong>{session.state.checkouts.filter((c) => c.tenantId === managedTenant.id).length}</strong>
                    <small>{session.state.checkouts.filter((c) => c.tenantId === managedTenant.id && c.published).length} publicados online</small>
                  </div>
                  <div className="hub-stat-item">
                    <span>CORRETORAS</span>
                    <strong>{managedTenant.connections.length} / {providers.length}</strong>
                    <small>Integrações ativas</small>
                  </div>
                  <div className="hub-stat-item">
                    <span>DOMÍNIO DNS</span>
                    <strong style={{ fontSize: 13 }}>{managedTenant.domain ? 'Personalizado' : 'URL não definida'}</strong>
                    <small>{managedTenant.domain ? 'Apontamento CNAME' : 'Domínio não configurado'}</small>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="tenant-hub-tabs-bar">
                <button
                  className={`hub-tab-btn ${manageTab === 'users' ? 'active' : ''}`}
                  onClick={() => setManageTab('users')}
                >
                  <Users size={16} />
                  <span>Usuários & Equipe ({getTenantUsers(managedTenant).length})</span>
                </button>
                <button
                  className={`hub-tab-btn ${manageTab === 'checkouts' ? 'active' : ''}`}
                  onClick={() => setManageTab('checkouts')}
                >
                  <PanelsTopLeft size={16} />
                  <span>Checkouts da Operação ({session.state.checkouts.filter((c) => c.tenantId === managedTenant.id).length})</span>
                </button>
                <button
                  className={`hub-tab-btn ${manageTab === 'domain' ? 'active' : ''}`}
                  onClick={() => setManageTab('domain')}
                >
                  <Globe size={16} />
                  <span>Página & Domínio</span>
                </button>
                <button
                  className={`hub-tab-btn ${manageTab === 'identity' ? 'active' : ''}`}
                  onClick={() => setManageTab('identity')}
                >
                  <Palette size={16} />
                  <span>Identidade Visual</span>
                </button>
                <button
                  className={`hub-tab-btn ${manageTab === 'connections' ? 'active' : ''}`}
                  onClick={() => setManageTab('connections')}
                >
                  <Plug size={16} />
                  <span>Corretoras & Conexões ({managedTenant.connections.length})</span>
                </button>
                <button
                  className={`hub-tab-btn ${manageTab === 'bots' ? 'active' : ''}`}
                  onClick={() => setManageTab('bots')}
                >
                  <Robot size={16} />
                  <span>Robôs Autorizados ({(managedTenant.allowedBots || ['mt5-ea', 'tradingview-webhooks', 'copy-trading-engine']).length})</span>
                </button>
              </div>

              {/* Tab Content: Users */}
              {manageTab === 'users' && (
                <div className="tenant-hub-tab-pane">
                  <div className="section-top">
                    <div>
                      <h2>Tabela de Usuários da Operação</h2>
                      <p>Membros, administradores e operadores vinculados ao workspace de <strong>{managedTenant.name}</strong></p>
                    </div>
                    <button
                      className="primary"
                      onClick={() => {
                        setNewUserName('');
                        setNewUserEmail('');
                        setNewUserRole('operator');
                        setAddUserOpen(true);
                      }}
                    >
                      <Plus size={16} />
                      Adicionar usuário à operação
                    </button>
                  </div>

                  <div className="table-frame">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>MEMBRO</TableHead>
                          <TableHead>FUNÇÃO / PAPEL</TableHead>
                          <TableHead>STATUS</TableHead>
                          <TableHead>CADASTRADO EM</TableHead>
                          <TableHead className="right">AÇÕES</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getTenantUsers(managedTenant).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="tenant-name">
                                <span className="user-avatar-initials">
                                  {user.name.slice(0, 2).toUpperCase()}
                                </span>
                                <div>
                                  <strong>{user.name}</strong>
                                  <small>{user.email}</small>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`user-role-badge role-${user.role}`}>
                                {{
                                  admin: 'Administrador',
                                  operator: 'Operador',
                                  finance: 'Financeiro',
                                  support: 'Suporte',
                                }[user.role]}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge active={user.status === 'active'}>
                                {{
                                  active: 'Ativo',
                                  invited: 'Convidado',
                                  suspended: 'Suspenso',
                                }[user.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>{date(user.created)}</TableCell>
                            <TableCell>
                              <div className="row-actions">
                                <button
                                  className="secondary"
                                  style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                  onClick={() => setInviteTenantId(managedTenant.id)}
                                >
                                  <Mail size={13} />
                                  Gerar Convite
                                </button>
                                {getTenantUsers(managedTenant).length > 1 && (
                                  <IconButton
                                    label="Remover usuário da operação"
                                    onClick={async () => {
                                      const updatedUsers = getTenantUsers(managedTenant).filter((u) => u.id !== user.id);
                                      await mutate('tenant', {
                                        ...managedTenant,
                                        users: updatedUsers,
                                      });
                                    }}
                                  >
                                    <Trash2 size={15} />
                                  </IconButton>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {inviteTenantId === managedTenant.id && (
                    <div className="invite-box-wrap" style={{ marginTop: 20, background: '#1b1e19', border: '1px solid #ffffff15', borderRadius: 8, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <strong style={{ fontSize: 13, color: '#e5ede0' }}>Link de Ativação / Convite para {managedTenant.name}</strong>
                        <IconButton label="Fechar" onClick={() => setInviteTenantId(null)}>
                          <X size={16} />
                        </IconButton>
                      </div>
                      <AccountInvite tenantId={managedTenant.id} />
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Checkouts (Audit Mode) */}
              {manageTab === 'checkouts' && (
                <div className="tenant-hub-tab-pane">
                  <div className="section-top">
                    <div>
                      <h2>Checkouts de {managedTenant.name} <span className="count">{session.state.checkouts.filter((c) => c.tenantId === managedTenant.id).length}</span></h2>
                      <p>Visualização em modo de auditoria. A criação, edição de layout e precificação são de autonomia da equipe de <strong>{managedTenant.name}</strong>.</p>
                    </div>
                  </div>

                  {session.state.checkouts.filter((c) => c.tenantId === managedTenant.id).length === 0 ? (
                    <div className="empty">
                      <PanelsTopLeft size={36} />
                      <h3>Nenhum checkout cadastrado por esta operação</h3>
                      <p>Esta operação parceira ainda não criou nenhuma página de checkout.</p>
                    </div>
                  ) : (
                    <div className="checkout-grid">
                      {session.state.checkouts
                        .filter((c) => c.tenantId === managedTenant.id)
                        .map((c) => (
                          <article className="checkout-card" key={c.id}>
                            <button
                              type="button"
                              className="checkout-thumbnail"
                              aria-label={`Visualizar página de ${c.name}`}
                              onClick={() => window.open(`/checkout/${c.id}`, '_blank')}
                            >
                              <div className="mini-checkout">
                                <div
                                  className="mini-brand"
                                  style={{ color: c.color }}
                                >
                                  <Zap size={16} />
                                  {managedTenant.name}
                                </div>
                                {c.banner ? (
                                  <img src={c.banner} alt="Banner" />
                                ) : (
                                  <div className="mini-offer">
                                    <span>ACESSO À PLATAFORMA</span>
                                    <strong>{c.name}</strong>
                                    <small>{money(c.price)}</small>
                                  </div>
                                )}
                                <div className="mini-lines">
                                  <i /><i /><i />
                                </div>
                                <span
                                  className="mini-cta"
                                  style={{ background: c.color }}
                                >
                                  {c.button}
                                </span>
                              </div>
                              <span className="edit-overlay">
                                <ExternalLink size={16} />
                                Abrir página isolada
                              </span>
                            </button>
                            <div className="checkout-card-body">
                              <div className="spread">
                                <h3>{c.name}</h3>
                                <Badge active={c.published}>
                                  {c.published ? 'Publicado' : 'Rascunho'}
                                </Badge>
                              </div>
                              <p>{money(c.price)}</p>
                              <div className="checkout-card-footer">
                                <small>{date(c.updated)}</small>
                                <div className="row-actions">
                                  <a
                                    className="icon-button"
                                    href={`/checkout/${c.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={c.published ? 'Abrir página isolada do checkout' : 'Abrir página do checkout (Modo rascunho)'}
                                    aria-label="Abrir página isolada do checkout em nova aba"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Domain */}
              {manageTab === 'domain' && (
                <div className="tenant-hub-tab-pane">
                  <TenantSettings
                    key={`${managedTenant.id}-domains`}
                    tenant={managedTenant}
                    mode="domains"
                    busy={busy}
                    onSave={(t) => mutate('tenant', t)}
                  />
                </div>
              )}

              {/* Tab Content: Brand Audit (Read-only brand compliance) */}
              {manageTab === 'identity' && (
                <div className="tenant-hub-tab-pane">
                  <div className="brand-audit-container">
                    <div className="brand-audit-notice">
                      <ShieldCheck size={20} />
                      <div>
                        <strong>Auditoria de Identidade Visual da Operação</strong>
                        <p>
                          A identidade visual (logotipo, tipografia e paleta de cores) é gerida com autonomia pela equipe de <strong>{managedTenant.name}</strong>. Como Super Admin, você apenas audita a conformidade da marca com os padrões de segurança e design da TradingPro.
                        </p>
                      </div>
                    </div>
                    <div className="brand-audit-grid">
                      <div className="brand-audit-card">
                        <h3><Palette size={18} /> Parâmetros de Marca</h3>
                        <div className="info-rows">
                          <div className="info-row">
                            <span>Nome Comercial da Operação:</span>
                            <strong>{managedTenant.name}</strong>
                          </div>
                          <div className="info-row">
                            <span>Tipografia Configurada:</span>
                            <strong>{managedTenant.font || 'Inter'}</strong>
                          </div>
                          <div className="info-row">
                            <span>Domínio da Plataforma:</span>
                            <code>{managedTenant.domain || 'URL não definida'}</code>
                          </div>
                        </div>
                        <div className="brand-swatches">
                          <div className="brand-swatch-box">
                            <span className="brand-swatch-circle" style={{ background: managedTenant.color }} />
                            <div>
                              <small>Cor Primária</small>
                              <strong>{managedTenant.color.toUpperCase()}</strong>
                            </div>
                          </div>
                          <div className="brand-swatch-box">
                            <span className="brand-swatch-circle" style={{ background: managedTenant.secondaryColor || '#ffffff' }} />
                            <div>
                              <small>Cor Secundária</small>
                              <strong>{(managedTenant.secondaryColor || '#ffffff').toUpperCase()}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="brand-audit-card">
                        <h3><Zap size={18} /> Preview do Cabeçalho da Marca</h3>
                        <div className="brand-preview-banner" style={{ borderLeft: `4px solid ${managedTenant.color}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {managedTenant.logo ? (
                              <img src={managedTenant.logo} alt={managedTenant.name} style={{ height: 36, objectFit: 'contain' }} />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: managedTenant.color + '22', color: managedTenant.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {managedTenant.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <strong style={{ fontSize: 16, color: '#fff' }}>{managedTenant.name}</strong>
                              <small style={{ display: 'block', color: '#8d9c82', fontSize: 11 }}>{managedTenant.domain || 'URL não definida'}</small>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, background: managedTenant.color, color: '#111810', padding: '4px 10px', borderRadius: 4, fontWeight: 600 }}>
                            Acesso Parceiro
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: '#88987b', margin: '4px 0 0', lineHeight: 1.6 }}>
                          Visualização aproximada de como o cliente final visualiza a marca nos checkouts e no painel da operação.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Bots Authorization */}
              {manageTab === 'bots' && (
                <div className="tenant-hub-tab-pane">
                  <div className="section-top">
                    <div>
                      <h2>Robôs & Automações Autorizadas para {managedTenant.name}</h2>
                      <p>Defina quais tipos de robôs e protocolos esta operação tem permissão contratual para oferecer aos seus clientes.</p>
                    </div>
                  </div>
                  <div className="bots-grid">
                    {availableBots.map((bot) => {
                      const isAllowed = (managedTenant.allowedBots || ['mt5-ea', 'tradingview-webhooks', 'copy-trading-engine']).includes(bot.id);
                      return (
                        <div className="bot-policy-card" key={bot.id}>
                          <div className="bot-card-top">
                            <div className="bot-card-header">
                              <div className="bot-icon-badge">
                                <Robot size={20} />
                              </div>
                              <span className="bot-category-badge">{bot.category}</span>
                            </div>
                            <div className="bot-info-meta">
                              <strong>{bot.name}</strong>
                              <span className="bot-protocol-code">{bot.protocol}</span>
                              <p className="bot-desc">{bot.description}</p>
                            </div>
                          </div>
                          <div className="bot-card-footer">
                            <span style={{ fontSize: 12, color: isAllowed ? '#a3d94d' : '#88987b', fontWeight: 500 }}>
                              {isAllowed ? 'Autorizado para a operação' : 'Bloqueado contratualmente'}
                            </span>
                            <Toggle
                              label={isAllowed ? 'Liberado' : 'Bloqueado'}
                              checked={isAllowed}
                              disabled={busy}
                              onChange={(v) => {
                                const current = managedTenant.allowedBots || ['mt5-ea', 'tradingview-webhooks', 'copy-trading-engine'];
                                const updated = v
                                  ? [...current, bot.id]
                                  : current.filter((x) => x !== bot.id);
                                void mutate('tenant', { ...managedTenant, allowedBots: updated });
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab Content: Connections */}
              {manageTab === 'connections' && (
                <div className="tenant-hub-tab-pane">
                  <div className="section-top">
                    <div>
                      <h2>Conexões e Corretoras da Operação</h2>
                      <p>Libere ou revogue permissões de integração das corretoras para <strong>{managedTenant.name}</strong></p>
                    </div>
                  </div>
                  <div className="connections-grid">
                    {providers.map((p, i) => (
                      <div className="connection-item" key={p}>
                        <span className={`provider-logo provider-${i}`}>{p.slice(0, 2).toUpperCase()}</span>
                        <h3>{p}</h3>
                        <p>Corretora / Conexão</p>
                        <Toggle
                          label={managedTenant.connections.includes(p) ? 'Acesso liberado' : 'Não liberado'}
                          checked={managedTenant.connections.includes(p)}
                          disabled={busy}
                          onChange={(v) =>
                            void mutate('tenant', {
                              ...managedTenant,
                              connections: v
                                ? [...managedTenant.connections, p]
                                : managedTenant.connections.filter((x) => x !== p),
                            })
                          }
                        />
                        <small>{managedTenant.connections.includes(p) ? 'Habilitado para os clientes desta operação' : 'Acesso desabilitado'}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {view === 'tenants' && !managedTenant && (
            <>
              <div className="section-top">
                <h2>
                  Operações cadastradas <span className="count">{tenants.length}</span>
                </h2>
                <div className="tools">
                  <label className="search">
                    <Search size={17} />
                    <input
                      placeholder="Buscar operação…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Buscar operação"
                    />
                  </label>
                  <Select
                    value={filter}
                    onValueChange={(v) => setFilter(v || 'all')}
                  >
                    <SelectTrigger className="select-control">
                      <SelectValue>{{all:'Todos os status',active:'Ativas',suspended:'Suspensas'}[filter]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="suspended">Suspensas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="table-frame">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OPERAÇÃO</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ADMINISTRADOR</TableHead>
                      <TableHead>CONEXÕES</TableHead>
                      <TableHead>CHECKOUTS</TableHead>
                      <TableHead className="right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <div className="tenant-name">
                            <Avatar tenant={t} />
                            <div>
                              <strong>{t.name}</strong>
                              <small>{t.domain || 'URL não definida'}</small>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge active={t.status === 'active'}>
                            {t.status === 'active' ? 'Ativa' : 'Suspensa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="stacked">
                            {t.admin}
                            <small>{t.email}</small>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="provider-chips">
                            {t.connections.slice(0, 2).map((p) => (
                              <span key={p}>{p}</span>
                            ))}
                            {t.connections.length > 2 && (
                              <span>+{t.connections.length - 2}</span>
                            )}
                            {!t.connections.length && (
                              <span>Não liberadas</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {
                            session.state.checkouts.filter(
                              (c) => c.tenantId === t.id,
                            ).length
                          }
                        </TableCell>
                        <TableCell>
                          <div className="row-actions">
                            <button
                              className="secondary"
                              style={{ padding: '5px 11px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                              title="Ver e gerenciar detalhes completos da operação"
                              onClick={() => {
                                setManageTenantId(t.id);
                                setManageTab('users');
                              }}
                            >
                              <Settings2 size={15} />
                              Gerenciar
                            </button>
                            <IconButton
                              label="Editar operação"
                              onClick={() => setEditTenant({ ...t })}
                            >
                              <Pencil size={16} />
                            </IconButton>
                            <button
                              className="open-tenant"
                              disabled={t.status === 'suspended'}
                              onClick={() => {
                                setTenantId(t.id);
                                go('checkouts');
                              }}
                            >
                              Acessar <ArrowUpRight size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!matches.length && (
                  <div className="empty">
                    <Search />
                    <h3>Nenhuma operação encontrada</h3>
                    <p>Ajuste a busca ou crie uma nova operação.</p>
                  </div>
                )}
                <div className="table-footer">
                  {matches.length} de {tenants.length} operações{' '}
                  <span>TradingPro / White Label</span>
                </div>
              </div>
              <div className="bottom-band admin-bottom-band">
                <span className="square-icon">
                  <Globe size={22} />
                </span>
                <div>
                  <h3>Plataforma White Label</h3>
                  <p>Painel de administração central para gestão de operações parceiras e infraestrutura técnica.</p>
                </div>
                <a
                  className="secondary"
                  href="https://tradingpro.io"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  tradingpro.io
                  <ExternalLink size={15} />
                </a>
              </div>
            </>
          )}
          {view === 'checkouts' && (
            <>
              <div className="section-top">
                <h2>
                  {tenant ? 'Ofertas & Checkouts' : 'Checkouts das Operações'}{' '}
                  <span className="count">{checkouts.length}</span>
                </h2>
                <div className="tools">
                  <label className="search">
                    <Search size={17} />
                    <input
                      placeholder={tenant ? 'Buscar checkout…' : 'Buscar por nome do checkout…'}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Buscar checkout"
                    />
                  </label>
                  {!tenant && (
                    <Select
                      value={filter}
                      onValueChange={(v) => setFilter(v || 'all')}
                    >
                      <SelectTrigger className="select-control" style={{ minWidth: 190 }}>
                        <SelectValue>
                          {filter === 'all'
                            ? 'Todas as operações'
                            : tenants.find((t) => t.id === filter)?.name || 'Operação'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as operações</SelectItem>
                        {tenants.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              {!tenant && (
                <div className="admin-notice-banner">
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Monitoramento Central de Checkouts</strong>
                    <p>
                      Os checkouts pertencem às operações parceiras. Como Super Admin, você pode monitorar e auditar os links públicos ou entrar no workspace da operação para editá-los.
                    </p>
                  </div>
                </div>
              )}
              <div className="checkout-grid">
                {checkouts
                  .filter((c) => {
                    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
                    const matchesTenant = !tenant && filter !== 'all' ? c.tenantId === filter : true;
                    return matchesQuery && matchesTenant;
                  })
                  .map((c) => {
                    const t = tenants.find((t) => t.id === c.tenantId);
                    return (
                      <article className="checkout-card" key={c.id}>
                        {!tenant && t && (
                          <div className="checkout-owner-header">
                            <div className="tenant-name" style={{ gap: 8 }}>
                              <Avatar tenant={t} />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: 13 }}>{t.name}</strong>
                                <small style={{ color: '#88987b', fontSize: 11 }}>
                                  {t.domain || 'URL não definida'}
                                </small>
                              </div>
                            </div>
                            <Badge active={c.published}>
                              {c.published ? 'Publicado' : 'Rascunho'}
                            </Badge>
                          </div>
                        )}
                        <button
                          className="checkout-thumbnail"
                          aria-label={tenant ? `Editar ${c.name}` : `Visualizar página isolada do checkout ${c.name}`}
                          onClick={() => {
                            if (!tenant) {
                              window.open(`/checkout/${c.id}`, '_blank');
                            } else {
                              setEditor({ ...c });
                            }
                          }}
                        >
                          <div className="mini-checkout">
                            <div
                              className="mini-brand"
                              style={{ color: c.color }}
                            >
                              <Zap size={16} />
                              {t?.name || 'Operação'}
                            </div>
                            {c.banner ? (
                              <img src={c.banner} alt="Banner do checkout" />
                            ) : (
                              <div className="mini-offer">
                                <span>ACESSO À PLATAFORMA</span>
                                <strong>{c.name}</strong>
                                <small>{money(c.price)}</small>
                              </div>
                            )}
                            <div className="mini-lines">
                              <i />
                              <i />
                              <i />
                            </div>
                            <span
                              className="mini-cta"
                              style={{ background: c.color }}
                            >
                              {c.button}
                            </span>
                          </div>
                          <span className="edit-overlay">
                            {tenant ? <Pencil size={16} /> : <ExternalLink size={16} />}
                            {tenant ? 'Editar checkout' : 'Abrir página isolada'}
                          </span>
                        </button>
                        <div className="checkout-card-body">
                          <div className="spread">
                            <h3>{c.name}</h3>
                            {tenant && (
                              <Badge active={c.published}>
                                {c.published ? 'Publicado' : 'Rascunho'}
                              </Badge>
                            )}
                          </div>
                          <p>
                            {t?.name || 'Operação'} <span>·</span> {money(c.price)}
                          </p>
                          <div className="checkout-card-footer checkout-card-footer-col">
                            <div className="checkout-footer-date">
                              <small>{date(c.updated)}</small>
                            </div>
                            <div className="checkout-col-actions">
                              {!tenant && (
                                <>
                                  <a
                                    className="secondary btn-col"
                                    href={`/checkout/${c.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Abrir página isolada do checkout em nova aba"
                                  >
                                    <ExternalLink size={14} />
                                    <span>Abrir página</span>
                                  </a>
                                  <button
                                    className="open-tenant btn-col"
                                    title="Acessar operação para auditar"
                                    onClick={() => {
                                      setTenantId(c.tenantId);
                                      go('overview');
                                    }}
                                  >
                                    <span>Operação</span>
                                    <ArrowUpRight size={14} />
                                  </button>
                                </>
                              )}
                              {tenant && (
                                <div className="row-actions" style={{ justifyContent: 'flex-end', width: '100%' }}>
                                  <IconButton
                                    label="Duplicar checkout"
                                    onClick={() =>
                                      setEditor({
                                        ...c,
                                        id: crypto.randomUUID(),
                                        name: c.name + ' (cópia)',
                                        published: false,
                                        publishedData: undefined,
                                      })
                                    }
                                  >
                                    <Copy size={16} />
                                  </IconButton>
                                  <a
                                    className="icon-button"
                                    href={`/checkout/${c.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={c.published ? 'Abrir página isolada do checkout' : 'Abrir página do checkout (Modo rascunho)'}
                                    aria-label="Abrir página isolada do checkout em nova aba"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                  <IconButton
                                    label="Excluir checkout"
                                    onClick={() => setDeleteId(c.id)}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                {tenant && (
                  <button className="new-checkout-card" onClick={createCheckout}>
                    <span>
                      <Plus size={25} />
                    </span>
                    <strong>Novo checkout</strong>
                  </button>
                )}
              </div>
            </>
          )}
          {view === 'connections' && !tenant && (
            <div className="connections-admin-container">
              <div className="admin-notice-banner" style={{ marginBottom: 18 }}>
                <Plug size={20} />
                <div>
                  <strong>Matriz de Permissões de Corretoras por Operação</strong>
                  <p>
                    Controle centralizado das integrações autorizadas para cada parceiro white label. Clique em qualquer corretora para liberar ou revogar o acesso imediatamente.
                  </p>
                </div>
              </div>

              <div className="table-frame">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OPERAÇÃO</TableHead>
                      {providers.map((p) => (
                        <TableHead key={p} style={{ textAlign: 'center' }}>{p.toUpperCase()}</TableHead>
                      ))}
                      <TableHead style={{ textAlign: 'center' }}>LIBERADAS</TableHead>
                      <TableHead className="right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <div className="tenant-name">
                            <Avatar tenant={t} />
                            <div>
                              <strong>{t.name}</strong>
                              <small>{t.domain || 'URL não definida'}</small>
                            </div>
                          </div>
                        </TableCell>
                        {providers.map((p) => {
                          const isAllowed = t.connections.includes(p);
                          return (
                            <TableCell key={p} style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className={`connection-matrix-pill ${isAllowed ? 'active' : 'inactive'}`}
                                disabled={busy}
                                onClick={() =>
                                  void mutate('tenant', {
                                    ...t,
                                    connections: isAllowed
                                      ? t.connections.filter((x) => x !== p)
                                      : [...t.connections, p],
                                  })
                                }
                                title={isAllowed ? `Revogar permissão de ${p}` : `Liberar conexão com ${p}`}
                              >
                                <span className="matrix-dot" />
                                {p}
                              </button>
                            </TableCell>
                          );
                        })}
                        <TableCell style={{ textAlign: 'center' }}>
                          <Badge active={t.connections.length > 0}>
                            {t.connections.length} de {providers.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="row-actions">
                            <button
                              className="secondary"
                              style={{ padding: '5px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                              onClick={() => {
                                setView('tenants');
                                setManageTenantId(t.id);
                                setManageTab('connections');
                              }}
                            >
                              <Settings2 size={14} />
                              Gerenciar
                            </button>
                            <button
                              className="open-tenant"
                              disabled={t.status === 'suspended'}
                              onClick={() => {
                                setTenantId(t.id);
                                go('overview');
                              }}
                            >
                              Acessar <ArrowUpRight size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {view === 'connections' && tenant && (
            <div className="tenant-connections-container">
              <div className="section-top" style={{ marginBottom: 20 }}>
                <div>
                  <h2>Corretoras & Provedores Integrados</h2>
                  <p style={{ color: '#8d9c82', fontSize: 13, margin: '2px 0 0' }}>
                    Status das corretoras autorizadas pela infraestrutura técnica da plataforma para a sua operação.
                  </p>
                </div>
                <Badge active={tenant.connections.length > 0}>
                  {tenant.connections.length} / {providers.length} Liberadas
                </Badge>
              </div>
              <div className="connections-grid">
                {providers.map((p, i) => {
                  const allowed = tenant.connections.includes(p);
                  return (
                    <div className={`connection-item ${allowed ? 'allowed' : 'locked'}`} key={p}>
                      <span className={`provider-logo provider-${i}`}>
                        {p.slice(0, 2).toUpperCase()}
                      </span>
                      <h3>{p}</h3>
                      <p>Integração de Corretora</p>
                      <Badge active={allowed}>
                        {allowed ? 'Conexão Habilitada' : 'Não Habilitada'}
                      </Badge>
                      <small style={{ marginTop: 8 }}>
                        {allowed
                          ? 'Operacional para vincular robôs e contas de clientes.'
                          : 'Acesso pendente de liberação pelo administrador master.'}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {view === 'overview' && tenant && (
            <section className="tenant-overview">
              <div className="overview-brand-card">
                <div className="overview-brand-info">
                  <Avatar tenant={tenant} />
                  <div>
                    <h2>{tenant.name}</h2>
                    <p>{tenant.domain || 'URL não definida'}</p>
                    <small>
                      {tenant.status === 'active' ? 'Operação ativa' : 'Operação suspensa'} · DNS não verificado
                    </small>
                  </div>
                </div>
                <PlatformLink tenant={tenant} />
              </div>

              <div className="metrics">
                <div className="metric">
                  <div>
                    <span>Checkouts</span>
                    <PanelsTopLeft size={18} />
                  </div>
                  <strong>{checkouts.length}</strong>
                  <small>Todas as ofertas cadastradas</small>
                </div>
                <div className="metric">
                  <div>
                    <span>Publicados</span>
                    <Globe size={18} />
                  </div>
                  <strong>{checkouts.filter((c) => c.published).length}</strong>
                  <small>Disponíveis para vendas</small>
                </div>
                <div className="metric">
                  <div>
                    <span>Conexões liberadas</span>
                    <Plug size={18} />
                  </div>
                  <strong>{tenant.connections.length}</strong>
                  <small>Integrações ativas</small>
                </div>
              </div>

              <div className="overview-actions-grid">
                <button className="overview-action-card" onClick={() => go('checkouts')}>
                  <div className="overview-action-icon">
                    <PanelsTopLeft size={20} />
                  </div>
                  <div className="overview-action-text">
                    <strong>Gerenciar checkouts</strong>
                    <small>Criar e publicar páginas de vendas</small>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button className="overview-action-card" onClick={() => go('settings')}>
                  <div className="overview-action-icon">
                    <Settings2 size={20} />
                  </div>
                  <div className="overview-action-text">
                    <strong>Configurações e plano</strong>
                    <small>Perfil, plano white label e marca</small>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button className="overview-action-card" onClick={() => go('domains')}>
                  <div className="overview-action-icon">
                    <Globe size={20} />
                  </div>
                  <div className="overview-action-text">
                    <strong>Configurar domínio</strong>
                    <small>Personalizar URL da operação</small>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button className="overview-action-card" onClick={() => go('backups')}>
                  <div className="overview-action-icon">
                    <Archive size={20} />
                  </div>
                  <div className="overview-action-text">
                    <strong>Backups e restauração</strong>
                    <small>Snapshots e cópias de segurança</small>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
          )}
          {view === 'overview' && !tenant && (
            <section className="tenant-overview admin-master-overview">
              <div className="metrics admin-metrics-grid">
                <div className="metric">
                  <div>
                    <span>Operações parceiras</span>
                    <Building2 size={18} />
                  </div>
                  <strong>{tenants.length}</strong>
                  <small>{tenants.filter((t) => t.status === 'active').length} ativas · {tenants.filter((t) => t.status === 'suspended').length} suspensas</small>
                </div>
                <div className="metric">
                  <div>
                    <span>Checkouts publicados</span>
                    <PanelsTopLeft size={18} />
                  </div>
                  <strong>{session.state.checkouts.filter((c) => c.published).length}</strong>
                  <small>De {session.state.checkouts.length} ofertas cadastradas</small>
                </div>
                <div className="metric">
                  <div>
                    <span>Domínios ativos</span>
                    <Globe size={18} />
                  </div>
                  <strong>{tenants.filter((t) => !!t.domain).length}</strong>
                  <small>Apontamentos CNAME verificados</small>
                </div>
                <div className="metric">
                  <div>
                    <span>Conexões liberadas</span>
                    <Plug size={18} />
                  </div>
                  <strong>{tenants.reduce((n, t) => n + t.connections.length, 0)}</strong>
                  <small>Integrações com corretoras</small>
                </div>
              </div>

              <div className="admin-recent-section">
                <div className="section-top">
                  <div>
                    <h2>Operações parceiras</h2>
                    <p style={{ color: '#8d9c82', fontSize: 13, margin: '2px 0 0' }}>Gerencie permissões ou acesse o workspace de cada parceiro white label.</p>
                  </div>
                  <button className="secondary" onClick={() => go('tenants')}>
                    Ver todas ({tenants.length})
                    <ChevronRight size={15} />
                  </button>
                </div>
                <div className="table-frame">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>OPERAÇÃO</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>ADMINISTRADOR</TableHead>
                        <TableHead>DOMÍNIO / URL</TableHead>
                        <TableHead>CONEXÕES</TableHead>
                        <TableHead>CHECKOUTS</TableHead>
                        <TableHead className="right">AÇÕES</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenants.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div className="tenant-name">
                              <Avatar tenant={t} />
                              <div>
                                <strong>{t.name}</strong>
                                <small>{t.domain || 'URL não definida'}</small>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge active={t.status === 'active'}>
                              {t.status === 'active' ? 'Ativa' : 'Suspensa'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="stacked">
                              {t.admin}
                              <small>{t.email}</small>
                            </div>
                          </TableCell>
                          <TableCell>
                            {t.domain ? (
                              <strong style={{ fontSize: 13, color: '#e5ede0' }}>{t.domain}</strong>
                            ) : (
                              <span style={{ fontSize: 12, color: '#88987b' }}>URL não definida</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge active={t.connections.length > 0}>
                              {t.connections.length} de {providers.length}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {session.state.checkouts.filter((c) => c.tenantId === t.id).length}
                          </TableCell>
                          <TableCell>
                            <div className="row-actions">
                              <button
                                className="secondary"
                                style={{ padding: '5px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                onClick={() => {
                                  setView('tenants');
                                  setManageTenantId(t.id);
                                  setManageTab('users');
                                }}
                              >
                                <Settings2 size={14} />
                                Gerenciar
                              </button>
                              <button
                                className="open-tenant"
                                disabled={t.status === 'suspended'}
                                onClick={() => {
                                  setTenantId(t.id);
                                  go('overview');
                                }}
                              >
                                Acessar <ArrowUpRight size={15} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>
          )}
          {view === 'settings' && !tenant && (
            <div className="admin-settings-container">
              <div className="settings-cards-grid">
                {/* Platform Domain */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <div className="icon-wrap"><Globe size={22} /></div>
                    <div>
                      <h2>Domínio Master da Plataforma</h2>
                      <p>Endereço raiz da infraestrutura White Label e gerenciador de subdomínios</p>
                    </div>
                    <span className="status green"><span />Root Ativo</span>
                  </div>
                  <div className="settings-card-body">
                    <div className="domain-display-box">
                      <div>
                        <span className="eyebrow">DOMÍNIO PRINCIPAL</span>
                        <h3>tradingpro.io</h3>
                        <small>Certificado SSL Wildcard (*.tradingpro.io) emitido e verificado</small>
                      </div>
                      <a
                        className="primary"
                        href="https://tradingpro.io"
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        Abrir tradingpro.io
                        <ExternalLink size={15} />
                      </a>
                    </div>
                    <div className="domain-sub-rules">
                      <div className="rule-item">
                        <strong>Subdomínios das Operações:</strong>
                        <span>[slug].tradingpro.io (ex: quantum.tradingpro.io)</span>
                      </div>
                      <div className="rule-item">
                        <strong>Checkouts Públicos:</strong>
                        <span>tradingpro.io/checkout/[id] ou [slug].tradingpro.io/checkout/[id]</span>
                      </div>
                      <div className="rule-item">
                        <strong>Domínios Customizados (CNAME):</strong>
                        <span>Apontamento CNAME com destino a tradingpro.io</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Master Admin Identity */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <div className="icon-wrap"><ShieldCheck size={22} /></div>
                    <div>
                      <h2>Identidade do Super Administrador</h2>
                      <p>Parâmetros globais de controle e segurança</p>
                    </div>
                  </div>
                  <div className="settings-card-body">
                    <div className="info-rows">
                      <div className="info-row">
                        <span>E-mail Super Admin</span>
                        <strong>{session.email}</strong>
                      </div>
                      <div className="info-row">
                        <span>Nível de Acesso</span>
                        <strong>Super Admin (Acesso Total à Plataforma)</strong>
                      </div>
                      <div className="info-row">
                        <span>Moeda Base da Plataforma</span>
                        <strong>Real Brasileiro (BRL - R$)</strong>
                      </div>
                      <div className="info-row">
                        <span>Fuso Horário</span>
                        <strong>America/Sao_Paulo (UTC-03:00)</strong>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Global Providers Catalog */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <div className="icon-wrap"><Plug size={22} /></div>
                    <div>
                      <h2>Provedores & Corretoras Globais</h2>
                      <p>Integrações habilitadas para distribuição nas operações parceiras</p>
                    </div>
                    <button className="secondary" onClick={() => go('connections')}>
                      Gerenciar por operação
                    </button>
                  </div>
                  <div className="settings-card-body">
                    <div className="providers-catalog-grid">
                      {providers.map((p, i) => (
                        <div className="provider-catalog-item" key={p}>
                          <span className={`provider-logo provider-${i}`}>{p.slice(0, 2).toUpperCase()}</span>
                          <div>
                            <strong>{p}</strong>
                            <small>Disponível na plataforma</small>
                          </div>
                          <Badge active>Ativo</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
                {/* Platform Limits & Operational Control */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <div className="icon-wrap"><Settings2 size={22} /></div>
                    <div>
                      <h2>Parâmetros & Limites da Aplicação</h2>
                      <p>Controles de sobrecarga, taxas e manutenção da plataforma</p>
                    </div>
                  </div>
                  <div className="settings-card-body">
                    <div className="info-rows">
                      <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span>Modo de Manutenção Master</span>
                          <small style={{ display: 'block', color: '#7a8972', fontSize: 11 }}>Suspende temporariamente novos acessos às lojas</small>
                        </div>
                        <Toggle
                          label="Manutenção"
                          checked={session.state.settings?.maintenanceMode || false}
                          disabled={busy}
                          onChange={(v) => void mutate('settings', { maintenanceMode: v })}
                        />
                      </div>
                      <div className="info-row">
                        <span>Taxa da Plataforma por Checkout (Fee %)</span>
                        <strong>{session.state.settings?.platformFeePercent || 2.5}% por transação</strong>
                      </div>
                      <div className="info-row">
                        <span>Limite de Upload por Mídia</span>
                        <strong>{Math.round((session.state.settings?.maxUploadBytes || 409600) / 1024)} KB (PNG / JPG / WebP)</strong>
                      </div>
                      <div className="info-row">
                        <span>Rate Limiting da API</span>
                        <strong>{session.state.settings?.rateLimitPerMinute || 120} reqs/min por IP</strong>
                      </div>
                    </div>
                  </div>
                </section>

                {/* System Health and Diagnostics */}
                <section className="settings-card">
                  <div className="settings-card-header">
                    <div className="icon-wrap"><Activity size={22} /></div>
                    <div>
                      <h2>Diagnóstico & Saúde da Plataforma</h2>
                      <p>Status em tempo real dos serviços fundamentais</p>
                    </div>
                    <span className="status green"><span />100% Operacional</span>
                  </div>
                  <div className="settings-card-body">
                    <div className="diagnostic-grid">
                      <div className="diagnostic-item">
                        <div className="diag-title">
                          <span className="live-dot" />
                          <strong>Next.js Application Engine</strong>
                        </div>
                        <p>Servidor web, rotas dinâmicas e renderização de checkouts</p>
                        <small>Status: Saudável · Latência: ~15ms</small>
                      </div>
                      <div className="diagnostic-item">
                        <div className="diag-title">
                          <span className="live-dot" />
                          <strong>Base de Dados SQLite / Turso</strong>
                        </div>
                        <p>Armazenamento persistente de operações, checkouts e sessões</p>
                        <small>Status: Conectado (data/tradingpro.db)</small>
                      </div>
                      <div className="diagnostic-item">
                        <div className="diag-title">
                          <span className="live-dot" />
                          <strong>Media Storage API (/api/media)</strong>
                        </div>
                        <p>Upload e entrega otimizada de logos, banners e imagens</p>
                        <small>Status: Saudável · Limite 400KB por arquivo</small>
                      </div>
                      <div className="diagnostic-item">
                        <div className="diag-title">
                          <span className="live-dot" />
                          <strong>Roteamento Multi-tenant</strong>
                        </div>
                        <p>Isolamento de dados por operação e resolução de subdomínios</p>
                        <small>Status: Ativo (tradingpro.io)</small>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
          {view === 'settings' && tenant && (
            <TenantSettingsPage
              tenant={tenant}
              busy={busy}
              session={session}
              mutate={mutate}
              setNotice={setNotice}
              reload={load}
              view="settings"
            />
          )}
          {view === 'backups' && tenant && (
            <div className="backup-page-container">
              {/* Hero Banner */}
              <div className="backup-hero-banner">
                <div className="backup-hero-content">
                  <div className="backup-badge-pill">
                    <Archive size={14} />
                    <span>Backup & Dados · {tenant.name}</span>
                    <span className="live-dot" />
                  </div>
                  <h2>Backups & Snapshots da Operação</h2>
                  <p>
                    Gere cópias de segurança e pontos de restauração dos checkouts, páginas, ofertas, identidade visual e configurações da operação <strong>{tenant.name}</strong>.
                  </p>
                </div>
                <button
                  className="primary"
                  disabled={backupBusy}
                  onClick={() => void createBackup()}
                  style={{ whiteSpace: 'nowrap', padding: '12px 20px', fontSize: 13, gap: 8 }}
                >
                  <Plus size={16} />
                  {backupBusy ? 'Gerando snapshot…' : '+ Gerar snapshot da operação agora'}
                </button>
              </div>

              {/* Stat Cards */}
              <div className="backup-stats-grid">
                <div className="backup-stat-card">
                  <div className="stat-label">
                    <span>Checkouts Salvos</span>
                    <PanelsTopLeft size={16} color="#96d600" />
                  </div>
                  <div className="stat-value">{checkouts.length} ofertas</div>
                  <div className="stat-sub">{checkouts.filter((c) => c.published).length} publicados online</div>
                </div>

                <div className="backup-stat-card">
                  <div className="stat-label">
                    <span>Último Snapshot</span>
                    <Archive size={16} color="#96d600" />
                  </div>
                  <div className="stat-value">
                    {backupStats?.lastBackupTime ? date(backupStats.lastBackupTime) : 'Nenhum'}
                  </div>
                  <div className="stat-sub">Integridade SHA-256 verificada</div>
                </div>

                <div className="backup-stat-card">
                  <div className="stat-label">
                    <span>Total de Snapshots</span>
                    <Layers size={16} color="#96d600" />
                  </div>
                  <div className="stat-value">{backups.length}</div>
                  <div className="stat-sub">Retenção de 30 dias</div>
                </div>

                <div className="backup-stat-card">
                  <div className="stat-label">
                    <span>Domínio & Conexões</span>
                    <Globe size={16} color="#96d600" />
                  </div>
                  <div className="stat-value" style={{ fontSize: 14 }}>
                    {tenant.domain || `${tenant.slug}.tradingpro.io`}
                  </div>
                  <div className="stat-sub">
                    {tenant.connections.length} integrações habilitadas
                  </div>
                </div>
              </div>

              {/* Snapshots Table */}
              <div className="section-top" style={{ marginTop: 10 }}>
                <div>
                  <h2>Histórico de Snapshots da Operação</h2>
                  <p style={{ color: '#8d9c82', fontSize: 13, margin: '2px 0 0' }}>
                    Pontos de restauração com verificação de integridade para sua operação.
                  </p>
                </div>
                <button
                  className="secondary"
                  disabled={backupBusy}
                  onClick={() => void loadBackups()}
                  style={{ gap: 6 }}
                >
                  <Undo2 size={14} /> Atualizar lista
                </button>
              </div>

              <div className="table-frame">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SNAPSHOT / IDENTIFICADOR</TableHead>
                      <TableHead>TIPO</TableHead>
                      <TableHead>DADOS PROTEGIDOS</TableHead>
                      <TableHead>HASH SHA-256</TableHead>
                      <TableHead>DATA DE CRIAÇÃO</TableHead>
                      <TableHead className="right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="square-icon" style={{ width: 34, height: 34, background: '#1c2417', color: '#96d600', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Archive size={16} />
                            </span>
                            <div>
                              <strong>{s.name}</strong>
                              <small style={{ display: 'block', color: '#7f8f76', fontSize: 11 }}>ID: {s.id.slice(0, 18)}…</small>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge active={s.type === 'manual'}>
                            {s.type === 'manual' ? 'Manual' : 'Automático'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 13, color: '#d8e5ce' }}>
                            {Math.round(s.sizeBytes / 1024)} KB · {s.tables.length} tabelas
                          </span>
                        </TableCell>
                        <TableCell>
                          <code className="backup-hash-code">{s.hash.slice(0, 16)}…</code>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 13, color: '#a6b89e' }}>{date(s.timestamp)}</span>
                        </TableCell>
                        <TableCell className="right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="backup-action-menu-btn"
                              aria-label="Opções do snapshot"
                              title="Mais opções"
                            >
                              <MoreVertical size={16} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="backup-dropdown-menu">
                              <DropdownMenuItem
                                className="backup-dropdown-item"
                                onClick={() => {
                                  window.open(`/api/backup?action=download&id=${s.id}`, '_blank');
                                }}
                              >
                                <Download size={14} /> Baixar JSON
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="backup-dropdown-item"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/backup', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ action: 'validate', id: s.id }),
                                    });
                                    const d = await res.json();
                                    if (d.valid) {
                                      setNotice(`Snapshot ${s.id.slice(0, 8)} íntegro! SHA-256 verificado com sucesso.`);
                                    } else {
                                      setNotice(`Aviso: Integridade inválida para ${s.id.slice(0, 8)}.`);
                                    }
                                  } catch (e) {
                                    setNotice((e as Error).message);
                                  }
                                }}
                              >
                                <ShieldCheck size={14} /> Validar SHA-256
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                className="backup-dropdown-item backup-dropdown-item-danger"
                                onClick={async () => {
                                  if (!window.confirm(`Tem certeza que deseja restaurar o snapshot "${s.name}"? Os dados da sua operação serão revertidos para este momento.`)) {
                                    return;
                                  }
                                  setBackupBusy(true);
                                  try {
                                    const res = await fetch('/api/backup', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ action: 'restore', id: s.id }),
                                    });
                                    const d = await res.json();
                                    if (!res.ok) throw Error(d.error || 'Falha ao restaurar backup.');
                                    setNotice(`Snapshot "${s.name}" restaurado com sucesso! Recarregando...`);
                                    await load();
                                    await loadBackups();
                                  } catch (err) {
                                    setNotice((err as Error).message);
                                  } finally {
                                    setBackupBusy(false);
                                  }
                                }}
                              >
                                <Undo2 size={14} /> Restaurar snapshot
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {!backups.length && (
                  <div className="empty">
                    <Archive size={28} />
                    <h3>Nenhum snapshot registrado ainda</h3>
                    <p>Clique em "Gerar snapshot da operação agora" para criar o primeiro ponto de restauração.</p>
                  </div>
                )}
              </div>

              {/* Disaster recovery policy card */}
              <div className="admin-bottom-band" style={{ marginTop: 20 }}>
                <span className="square-icon">
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <h3>Política de Continuidade & Exportação de Dados</h3>
                  <p>
                    Os backups da sua operação são gerados com isolamento criptográfico. Você pode exportar seus checkouts, páginas e configurações a qualquer momento em formato JSON.
                  </p>
                </div>
              </div>
            </div>
          )}
          {tenant && view === 'identity' && (
            <TenantSettingsPage
              tenant={tenant}
              busy={busy}
              session={session}
              mutate={mutate}
              setNotice={setNotice}
              reload={load}
              view="identity"
            />
          )}
          {tenant && view === 'domains' && (
            <TenantSettings
              key={`${tenant.id}-domains`}
              tenant={tenant}
              mode="domains"
              busy={busy}
              onSave={(t) => mutate('tenant', t)}
            />
          )}
          {view === 'domains' && !tenant && (
            <div className="admin-domains-container">
              <div className="admin-notice-banner" style={{ marginBottom: 18 }}>
                <Globe size={20} />
                <div>
                  <strong>Infraestrutura de DNS & Domínios Personalizados</strong>
                  <p>
                    Apontamento central: <code>cname.tradingpro.io</code>. Todos os subdomínios e domínios CNAME possuem emissão e renovação automática de certificado SSL.
                  </p>
                </div>
              </div>

              <div className="table-frame">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OPERAÇÃO</TableHead>
                      <TableHead>SUBDOMÍNIO BASE</TableHead>
                      <TableHead>DOMÍNIO PRÓPRIO (CNAME)</TableHead>
                      <TableHead>STATUS DNS</TableHead>
                      <TableHead className="right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <div className="tenant-name">
                            <Avatar tenant={t} />
                            <div>
                              <strong>{t.name}</strong>
                              <small>{t.email}</small>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://${t.slug}.tradingpro.io`}
                            target="_blank"
                            rel="noreferrer"
                            className="subdomain-link"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#96d600', textDecoration: 'none', fontSize: 13 }}
                          >
                            {t.slug}.tradingpro.io
                            <ExternalLink size={12} />
                          </a>
                        </TableCell>
                        <TableCell>
                          {t.domain ? (
                            <strong style={{ color: '#e5ede0', fontSize: 13 }}>{t.domain}</strong>
                          ) : (
                            <span style={{ color: '#7a8972', fontSize: 13 }}>— (Apenas subdomínio)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge active={Boolean(t.domain)}>
                            {t.domain ? 'CNAME Vinculado' : 'Subdomínio Ativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="row-actions">
                            <button
                              className="secondary"
                              style={{ padding: '5px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                              onClick={() => setEditTenant({ ...t })}
                            >
                              <Settings2 size={14} />
                              Configurar
                            </button>
                            <button
                              className="open-tenant"
                              disabled={t.status === 'suspended'}
                              onClick={() => {
                                setTenantId(t.id);
                                go('domains');
                              }}
                            >
                              Acessar <ArrowUpRight size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {view === 'activity' && (
            <div className="activity-container">
              <div className="section-top" style={{ marginBottom: 18 }}>
                <div>
                  <h2>Registro de Atividades & Auditoria</h2>
                  <p style={{ color: '#8d9c82', fontSize: 13, margin: '2px 0 0' }}>
                    Histórico cronológico de alterações, publicações de checkouts, backups e eventos da plataforma.
                  </p>
                </div>
                <Badge active={session.state.activity.length > 0}>
                  {session.state.activity.length} eventos registrados
                </Badge>
              </div>
              <div className="activity-list">
                {session.state.activity.length ? (
                  session.state.activity.map((a) => (
                    <div key={a.id}>
                      <span className="square-icon">
                        <Activity size={17} />
                      </span>
                      <p>
                        {a.text}
                        <small>{date(a.time)}</small>
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="empty">
                    <Activity size={28} />
                    <h3>Nenhuma alteração registrada ainda</h3>
                    <p>As modificações feitas na plataforma e nos checkouts aparecerão aqui em ordem cronológica.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        <footer className="app-footer">
          <span>TradingPro © {new Date().getFullYear()}</span>
          <span>
            <LockKeyhole size={12} />
            Workspace privado
          </span>
        </footer>
      </div>
      <Dialog
        open={!!editTenant}
        onOpenChange={(open) => {
          if (!open) setEditTenant(null);
        }}
      >
        <DialogContent className="tenant-dialog">
          <DialogTitle>
            {tenants.some((t) => t.id === editTenant?.id)
              ? 'Configurar operação'
              : 'Nova operação'}
          </DialogTitle>
          <DialogDescription>
            Identidade, administrador e acesso da plataforma.
          </DialogDescription>
          {editTenant && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (await mutate('tenant', editTenant)) setEditTenant(null);
              }}
            >
              <Tabs defaultValue="general">
                <TabsList>
                  <TabsTrigger value="general">Geral</TabsTrigger>
                  <TabsTrigger value="brand">Identidade</TabsTrigger>
                  <TabsTrigger value="access">Acesso e domínio</TabsTrigger>
                  {admin && <TabsTrigger value="bots">Robôs autorizados</TabsTrigger>}
                </TabsList>
                <TabsContent value="general">
                  <Field label="Nome da operação">
                    <input
                      required
                      maxLength={100}
                      value={editTenant.name}
                      onChange={(e) =>
                        setEditTenant({
                          ...editTenant,
                          name: e.target.value,
                          slug: tenants.some((t) => t.id === editTenant.id)
                            ? editTenant.slug
                            : slugify(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Subdomínio">
                    <div className="input-suffix">
                      <input
                        required
                        disabled={!admin}
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        value={editTenant.slug}
                        onChange={(e) =>
                          setEditTenant({
                            ...editTenant,
                            slug: slugify(e.target.value),
                          })
                        }
                      />
                      <span>.tradingpro.io</span>
                    </div>
                  </Field>
                  <Field label="Administrador">
                    <input
                      required
                      disabled={!admin}
                      value={editTenant.admin}
                      onChange={(e) =>
                        setEditTenant({ ...editTenant, admin: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="E-mail de acesso">
                    <input
                      type="email"
                      required
                      disabled={!admin}
                      value={editTenant.email}
                      onChange={(e) =>
                        setEditTenant({ ...editTenant, email: e.target.value })
                      }
                    />
                  </Field>
                </TabsContent>
                <TabsContent value="brand">
                  <UploadField
                    label="Logo da operação"
                    value={editTenant.logo}
                    onChange={(v) => setEditTenant({ ...editTenant, logo: v })}
                    onError={setNotice}
                  />
                  <Field label="Cor principal">
                    <div className="color-input">
                      <input
                        type="color"
                        value={editTenant.color}
                        onChange={(e) =>
                          setEditTenant({
                            ...editTenant,
                            color: e.target.value,
                          })
                        }
                      />
                      <span>{editTenant.color.toUpperCase()}</span>
                    </div>
                  </Field>
                </TabsContent>
                <TabsContent value="access">
                  {admin && tenants.some((t) => t.id === editTenant.id) && (
                    <AccountInvite tenantId={editTenant.id} />
                  )}
                  <Field label="Domínio personalizado">
                    <input
                      placeholder="app.suaempresa.com"
                      value={editTenant.domain}
                      onChange={(e) =>
                        setEditTenant({
                          ...editTenant,
                          domain: e.target.value.toLowerCase().trim(),
                        })
                      }
                    />
                  </Field>
                  <p className="form-note">
                    O endereço será reservado. A ativação depende da conexão com
                    a infraestrutura DNS da TradingPro.
                  </p>
                  {admin && (
                    <>
                      <h3>Conexões</h3>
                      {providers.map((p) => (
                        <Toggle
                          key={p}
                          label={p}
                          checked={editTenant.connections.includes(p)}
                          onChange={(v) =>
                            setEditTenant({
                              ...editTenant,
                              connections: v
                                ? [...editTenant.connections, p]
                                : editTenant.connections.filter((x) => x !== p),
                            })
                          }
                        />
                      ))}
                      <Toggle
                        label="Operação ativa"
                        checked={editTenant.status === 'active'}
                        onChange={(v) =>
                          setEditTenant({
                            ...editTenant,
                            status: v ? 'active' : 'suspended',
                          })
                        }
                      />
                    </>
                  )}
                </TabsContent>
                {admin && (
                  <TabsContent value="bots">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <p className="form-note">
                        Controle quais robôs e algoritmos de negociação a operação <strong>{editTenant.name || 'parceira'}</strong> tem permissão contratual para comercializar aos seus clientes.
                      </p>
                      {availableBots.map((bot) => {
                        const allowed = (editTenant.allowedBots || ['mt5-ea', 'tradingview-webhooks', 'copy-trading-engine']).includes(bot.id);
                        return (
                          <div key={bot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#171a15', border: '1px solid #ffffff10', borderRadius: 8 }}>
                            <div>
                              <strong style={{ fontSize: 13, color: '#e6ede2', display: 'block' }}>{bot.name}</strong>
                              <small style={{ color: '#88987b', fontSize: 11 }}>{bot.category} · {bot.protocol}</small>
                            </div>
                            <Toggle
                              label={allowed ? 'Autorizado' : 'Bloqueado'}
                              checked={allowed}
                              onChange={(v) => {
                                const cur = editTenant.allowedBots || ['mt5-ea', 'tradingview-webhooks', 'copy-trading-engine'];
                                const next = v ? [...cur, bot.id] : cur.filter((x) => x !== bot.id);
                                setEditTenant({ ...editTenant, allowedBots: next });
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
              <div className="form-footer">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEditTenant(null)}
                >
                  Cancelar
                </button>
                <button className="primary" disabled={busy}>
                  <Save size={16} />
                  {busy ? 'Salvando…' : 'Salvar operação'}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId('')}
      >
        <DialogContent>
          <DialogTitle>Excluir checkout?</DialogTitle>
          <DialogDescription>
            A oferta e sua versão publicada serão removidas.
          </DialogDescription>
          <div className="form-footer">
            <button className="secondary" onClick={() => setDeleteId('')}>
              Cancelar
            </button>
            <button
              className="danger"
              disabled={busy}
              onClick={async () => {
                if (await mutate('deleteCheckout', undefined, { id: deleteId }))
                  setDeleteId('');
              }}
            >
              Excluir checkout
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={addUserOpen}
        onOpenChange={(open) => {
          if (!open) setAddUserOpen(false);
        }}
      >
        <DialogContent className="tenant-dialog">
          <DialogTitle>Adicionar Usuário à Operação</DialogTitle>
          <DialogDescription>
            Vincule um novo colaborador com acesso ao workspace de {managedTenant?.name}.
          </DialogDescription>
          {managedTenant && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newUserName.trim() || !newUserEmail.trim()) return;
                const newUser: TenantUser = {
                  id: crypto.randomUUID(),
                  name: newUserName.trim(),
                  email: newUserEmail.trim().toLowerCase(),
                  role: newUserRole,
                  status: 'active',
                  created: new Date().toISOString(),
                };
                const existingUsers = getTenantUsers(managedTenant);
                const updatedTenant: Tenant = {
                  ...managedTenant,
                  users: [...existingUsers, newUser],
                };
                if (await mutate('tenant', updatedTenant)) {
                  setAddUserOpen(false);
                  setNotice(`Usuário ${newUser.name} adicionado com sucesso!`);
                }
              }}
            >
              <Field label="Nome completo">
                <input
                  required
                  maxLength={100}
                  placeholder="Ex: Carlos Mendes"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </Field>
              <Field label="E-mail profissional">
                <input
                  required
                  type="email"
                  maxLength={120}
                  placeholder="colaborador@dominio.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </Field>
              <Field label="Função / Papel">
                <Select
                  value={newUserRole}
                  onValueChange={(v) => setNewUserRole((v || 'operator') as TenantUserRole)}
                >
                  <SelectTrigger className="select-control">
                    <SelectValue>
                      {{
                        admin: 'Administrador (Acesso total)',
                        operator: 'Operador (Gestão de checkouts)',
                        finance: 'Financeiro (Vendas e relatórios)',
                        support: 'Suporte (Atendimento ao cliente)',
                      }[newUserRole]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador (Acesso total)</SelectItem>
                    <SelectItem value="operator">Operador (Gestão de checkouts)</SelectItem>
                    <SelectItem value="finance">Financeiro (Vendas e relatórios)</SelectItem>
                    <SelectItem value="support">Suporte (Atendimento ao cliente)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="dialog-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="secondary" onClick={() => setAddUserOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary" disabled={busy}>
                  <Plus size={16} />
                  Adicionar usuário
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {editor && tenant && (
        <Builder
          key={editor.id}
          checkout={editor}
          tenants={tenants}
          busy={busy}
          onClose={() => setEditor(null)}
          onError={setNotice}
          onSave={async (c, publish) => {
            const result = await mutate(
              'checkout',
              c,
              publish === undefined ? {} : { publish },
            );
            return result?.state.checkouts.find((x) => x.id === c.id) || null;
          }}
        />
      )}
      {notice && (
        <output className="notice">
          <span>{notice}</span>
          <IconButton label="Fechar mensagem" onClick={() => setNotice('')}>
            <X size={16} />
          </IconButton>
        </output>
      )}
    </SidebarProvider>
  );
}
