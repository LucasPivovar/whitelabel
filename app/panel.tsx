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
} from '@/components/icons';
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
  newCheckout,
  slugify,
  money,
  providers,
} from '@/lib/model';
import { registerCheckoutNavigation } from '@/lib/webmcp';
import Builder from '@/components/checkout-builder';
import RoleToolbar from '@/components/role-toolbar';
import AccountInvite from '@/components/account-invite';

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

export default function Panel() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState('tenants');
  const [tenantId, setTenantId] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [editor, setEditor] = useState<Checkout | null>(null);
  const [deleteId, setDeleteId] = useState('');
  async function load() {
    setError('');
    try {
      const r = await fetch('/api/workspace');
      const data = (await r.json()) as Session & { error?: string };
      if (!r.ok) throw Error(data.error || 'Falha na requisição.');
      setSession(data);
      if (data.role === 'tenant') {
        setTenantId(data.tenantId || '');
        setView('checkouts');
      }
    } catch (e) {
      setError(String((e as Error).message));
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(
    () =>
      registerCheckoutNavigation((id) => {
        if (editor) return false;
        const found = session?.state.checkouts.find((c) => c.id === id);
        if (!found) return false;
        setEditor({ ...found });
        return true;
      }),
    [session, editor],
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
  }
  const tenants = session?.state.tenants || [];
  const tenant = tenants.find((t) => t.id === tenantId);
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
    const t = tenant || tenants.find((t) => t.status === 'active');
    if (t) setEditor(newCheckout(t));
    else setNotice('Crie ou reative uma operação primeiro.');
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
                ? 'Entre para acessar suas operações.'
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
            <p>Carregando suas operações…</p>
          </>
        )}
      </main>
    );
  const titles: Record<string, string> = {
    tenants: 'Operações white label',
    checkouts: 'Checkouts',
    connections: 'Conexões',
    domains: 'Domínios',
    identity: 'Identidade visual',
    activity: 'Atividade',
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
                  ['checkouts', 'Checkouts', PanelsTopLeft],
                  ['identity', 'Identidade visual', Palette],
                  ['domains', 'Domínios', Globe],
                  ['connections', 'Conexões', Plug],
                ]
              : [
                  ['tenants', 'Operações', Building2],
                  ['checkouts', 'Checkouts', PanelsTopLeft],
                  ['connections', 'Conexões', Plug],
                  ['domains', 'Domínios', Globe],
                  ['activity', 'Atividade', Activity],
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
                  {view === key && <ChevronRight size={14} />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          {tenant && admin && (
            <button
              className="back-admin"
              onClick={() => {
                setTenantId('');
                go('tenants');
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
              {admin ? 'Administrador' : 'Admin da operação'}
              <small title={session.email}>{session.email}</small>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger />
            <span>{tenant ? tenant.name : 'Workspace'}</span>
            <ChevronRight size={14} />
            <strong>{titles[view]}</strong>
          </div>
          <RoleToolbar
            role={session.role}
            tenantId={tenantId}
            tenants={tenants}
            onChange={(id) => {
              setTenantId(id);
              go(id ? 'checkouts' : 'tenants');
            }}
          />
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {tenant ? 'SUA OPERAÇÃO' : 'GESTÃO DA PLATAFORMA'}
              </div>
              <h1>{titles[view]}</h1>
              <p>
                {view === 'tenants'
                  ? 'Todas as suas operações, em um só lugar.'
                  : view === 'checkouts'
                    ? 'Sua oferta. Sua identidade. Seu checkout.'
                    : view === 'connections'
                      ? 'Permissões de acesso às integrações de operação.'
                      : view === 'domains'
                        ? 'Endereços de acesso das suas operações.'
                        : view === 'identity'
                          ? 'A sua marca em cada ponto de contato.'
                          : 'Alterações recentes no seu workspace.'}
              </p>
            </div>
            {view === 'tenants' ? (
              <button className="primary" onClick={createTenant}>
                <Plus size={17} />
                Nova operação
              </button>
            ) : view === 'checkouts' ? (
              <button className="primary" onClick={createCheckout}>
                <Plus size={17} />
                Criar checkout
              </button>
            ) : null}
          </div>
          {(view === 'tenants' || view === 'checkouts') && (
            <div className="metrics">
              {(view === 'tenants'
                ? [
                    [
                      Building2,
                      tenants.length,
                      'Operações cadastradas',
                      'Seu ecossistema white label',
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
          {view === 'tenants' && (
            <>
              <div className="section-top">
                <h2>
                  Suas operações <span className="count">{tenants.length}</span>
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
                              <small>{t.slug}.tradingpro.io</small>
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
              <div className="bottom-band">
                <span className="square-icon">
                  <PanelsTopLeft size={22} />
                </span>
                <div>
                  <h3>Uma experiência de compra com a sua marca</h3>
                  <p>Organize suas ofertas no checkout builder.</p>
                </div>
                <button className="secondary" onClick={() => go('checkouts')}>
                  Ver checkouts
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </>
          )}
          {view === 'checkouts' && (
            <>
              <div className="section-top">
                <h2>
                  Suas ofertas <span className="count">{checkouts.length}</span>
                </h2>
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="Buscar checkout…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar checkout"
                  />
                </label>
              </div>
              <div className="checkout-grid">
                {checkouts
                  .filter((c) =>
                    c.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((c) => {
                    const t = tenants.find((t) => t.id === c.tenantId)!;
                    return (
                      <article className="checkout-card" key={c.id}>
                        <button
                          className="checkout-thumbnail"
                          aria-label={`Editar ${c.name}`}
                          onClick={() => setEditor({ ...c })}
                        >
                          <div className="mini-checkout">
                            <div
                              className="mini-brand"
                              style={{ color: c.color }}
                            >
                              <Zap size={16} />
                              {t.name}
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
                            <Pencil size={16} />
                            Editar checkout
                          </span>
                        </button>
                        <div className="checkout-card-body">
                          <div className="spread">
                            <h3>{c.name}</h3>
                            <Badge active={c.published}>
                              {c.published ? 'Publicado' : 'Rascunho'}
                            </Badge>
                          </div>
                          <p>
                            {t.name} <span>·</span> {money(c.price)}
                          </p>
                          <div className="checkout-card-footer">
                            <small>{date(c.updated)}</small>
                            <div className="row-actions">
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
                              {c.published && (
                                <a
                                  className="icon-button"
                                  href={`/checkout/${c.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Abrir checkout publicado"
                                  aria-label="Abrir checkout publicado"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                              <IconButton
                                label="Excluir checkout"
                                onClick={() => setDeleteId(c.id)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                <button className="new-checkout-card" onClick={createCheckout}>
                  <span>
                    <Plus size={25} />
                  </span>
                  <strong>Novo checkout</strong>
                </button>
              </div>
            </>
          )}
          {view === 'connections' && (
            <div className="settings-list">
              {(tenant ? [tenant] : tenants).map((t) => (
                <section key={t.id} className="settings-section">
                  <div className="section-top">
                    <div className="tenant-name">
                      <Avatar tenant={t} />
                      <div>
                        <h2>{t.name}</h2>
                        <small>{t.connections.length} conexões liberadas</small>
                      </div>
                    </div>
                  </div>
                  <div className="connections-grid">
                    {providers.map((p, i) => (
                      <div className="connection-item" key={p}>
                        <span className={`provider-logo provider-${i}`}>
                          {p.slice(0, 2).toUpperCase()}
                        </span>
                        <h3>{p}</h3>
                        <p>Conexão</p>
                        <Toggle
                          label={
                            t.connections.includes(p)
                              ? 'Acesso liberado'
                              : 'Não liberado'
                          }
                          checked={t.connections.includes(p)}
                          disabled={!admin || Boolean(tenantId) || busy}
                          onChange={(v) =>
                            void mutate('tenant', {
                              ...t,
                              connections: v
                                ? [...t.connections, p]
                                : t.connections.filter((x) => x !== p),
                            })
                          }
                        />
                        <small>Integração operacional pendente</small>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          {view === 'domains' && (
            <div className="settings-list">
              {(tenant ? [tenant] : tenants).map((t) => (
                <section className="domain-row" key={t.id}>
                  <div className="tenant-name">
                    <Avatar tenant={t} />
                    <div>
                      <h2>{t.name}</h2>
                      <small>{t.slug}.tradingpro.io</small>
                    </div>
                  </div>
                  <div>
                    <span className="eyebrow">DOMÍNIO PERSONALIZADO</span>
                    <p>{t.domain || 'Ainda não configurado'}</p>
                    <Badge>
                      {t.domain ? 'Aguardando conexão DNS' : 'Não configurado'}
                    </Badge>
                  </div>
                  <button
                    className="secondary"
                    onClick={() => setEditTenant({ ...t })}
                  >
                    <Settings2 size={16} />
                    Configurar
                  </button>
                </section>
              ))}
            </div>
          )}
          {view === 'identity' && tenant && (
            <div className="identity-page">
              <div
                className="identity-preview"
                style={{ borderTopColor: tenant.color }}
              >
                <Avatar tenant={tenant} />
                <h2>{tenant.name}</h2>
                <p>{tenant.slug}.tradingpro.io</p>
                <span
                  className="brand-swatch"
                  style={{ background: tenant.color }}
                />
                {tenant.color.toUpperCase()}
              </div>
              <div>
                <h2>Identidade da operação</h2>
                <p>Nome, logo e cor principal</p>
                <button
                  className="primary"
                  onClick={() => setEditTenant({ ...tenant })}
                >
                  <Palette size={17} />
                  Personalizar identidade
                </button>
              </div>
            </div>
          )}
          {view === 'activity' && (
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
                  <Activity />
                  <h3>Nenhuma alteração registrada</h3>
                </div>
              )}
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
      {editor && (
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
