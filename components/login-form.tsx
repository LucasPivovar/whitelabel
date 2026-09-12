'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/app/login.css';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowUpRight,
  Eye,
  EyeOff,
  Zap,
  LockKeyhole,
  Activity,
  Check,
} from '@/components/icons';
import type { LoginTemplate } from '@/lib/model';

interface Branding {
  name: string;
  color: string;
  logo: string;
  loginTemplate: LoginTemplate;
}

// ── Shared form logic ──────────────────────────────────────────────────────
function useLoginForm(invite?: string) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function getTarget() {
    if (typeof window === 'undefined') return '/dashboard';
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '/dashboard';
  }

  function setPrototypeAuth() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tradingpro_token', 'prototype-token');
      } catch {}
    }
  }

  async function submit(demo: boolean) {
    setBusy(true);
    setError('');
    const target = getTarget();
    setPrototypeAuth();
    try {
      if (demo) {
        const response = await fetch('/api/demo/role', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'tenant' }),
        });
        if (!response.ok) throw Error('Não foi possível abrir a demonstração.');
        window.location.assign(target);
        return;
      }
      const r = await fetch(
        invite ? '/api/auth/invite' : '/api/auth/login',
        {
          method: invite ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            invite ? { token: invite, password } : { email, password },
          ),
        },
      );
      const data = await r.json() as { error?: string };
      if (!r.ok) throw Error(data.error);
      router.replace(target);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function quickLogin() {
    setBusy(true);
    setError('');
    const target = getTarget();
    setPrototypeAuth();
    try {
      const r = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await r.json() as { error?: string };
      if (!r.ok) throw Error(data.error || 'Não foi possível entrar.');
      window.location.assign(target);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return { email, setEmail, password, setPassword, visible, setVisible, busy, error, submit, quickLogin };
}

// ── Shared form fields ─────────────────────────────────────────────────────
function LoginFields({
  invite, demo, branding, form,
}: {
  invite?: string;
  demo: boolean;
  branding: Branding;
  form: ReturnType<typeof useLoginForm>;
}) {
  const { email, setEmail, password, setPassword, visible, setVisible, busy, error, submit } = form;
  return (
    <form
      className="login-content"
      noValidate={demo}
      onSubmit={(e) => { e.preventDefault(); void submit(demo); }}
    >
      <div className="login-form-heading">
        <span className="login-symbol"><ShieldCheck size={20} /></span>
        <span className="login-eyebrow">PAINEL DA PLATAFORMA</span>
      </div>
      <h1>{invite ? 'Ative sua conta' : 'Entre na sua conta'}</h1>
      <p>
        {invite
          ? 'Defina sua senha para acessar a operação.'
          : 'Use suas credenciais de administrador.'}
      </p>
      {!invite && (
        <label className="field">
          <span>E-mail</span>
          <input
            autoComplete="username"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
          />
        </label>
      )}
      <label className="field">
        <span>{invite ? 'Crie uma senha' : 'Senha'}</span>
        <div className="password-field">
          <input
            type={visible ? 'text' : 'password'}
            required
            minLength={invite ? 12 : undefined}
            maxLength={128}
            autoComplete={invite ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={invite ? 'Mínimo de 12 caracteres' : 'Sua senha'}
          />
          <button
            type="button"
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="primary" disabled={busy}>
        {busy ? 'Autenticando…' : invite ? 'Ativar conta' : 'Entrar no Console'}
        <ArrowUpRight size={17} />
      </button>
      {!invite && (
        <div className="quick-autofill-row">
          <span>Ambiente local:</span>
          <button
            type="button"
            className="autofill-link"
            onClick={() => { setEmail('admin@whitelabel.local'); setPassword('BY7Nt7AxjCeJTo4iBUqS'); }}
          >
            Preencher credenciais de teste
          </button>
        </div>
      )}
      <p className="login-footnote">
        <LockKeyhole size={13} />
        Acesso restrito aos administradores da plataforma.
      </p>
      {demo && <p className="login-footnote">Demonstração com dados fictícios. As alterações podem ser apagadas.</p>}
    </form>
  );
}

// ── Template A: Split (padrão) ─────────────────────────────────────────────
function TemplateSplit({ invite, demo, branding }: { invite?: string; demo: boolean; branding: Branding }) {
  const form = useLoginForm(invite);
  return (
    <main className="login-page login-split">
      <section className="login-intro" aria-label={branding.name}>
        <Link href="/login" className="brand">
          {branding.logo
            ? <img src={branding.logo} alt={branding.name} style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 10 }} />
            : <Zap fill="currentColor" />}
          <span className="login-brand-name">{branding.name}<small>Console White Label</small></span>
        </Link>
        <div className="login-intro-copy">
          <span className="login-eyebrow"><ShieldCheck size={14} /> GESTÃO WHITE LABEL</span>
          <h2>Uma visão clara<br />de toda a<br />operação.</h2>
          <p>Tenants, checkouts de alta conversão, domínios próprios e conexões de corretoras reunidos em uma infraestrutura desenhada para decisões rápidas.</p>
          <div className="login-feature-pills">
            <span className="feature-pill"><Check size={13} /> Multi-tenant Isolado</span>
            <span className="feature-pill"><Check size={13} /> SSL Wildcard Dedicado</span>
            <span className="feature-pill"><Check size={13} /> Snapshots SHA-256</span>
          </div>
        </div>
        <div className="login-platform">
          <Activity size={20} />
          <div>
            <span>Infraestrutura da Plataforma</span>
            <small>Status 100% Operacional · Latência ~15ms</small>
          </div>
        </div>
      </section>
      <div className="login-main">
        <LoginFields invite={invite} demo={demo} branding={branding} form={form} />
      </div>
    </main>
  );
}

// ── Template B: Centered ───────────────────────────────────────────────────
function TemplateCentered({ invite, demo, branding }: { invite?: string; demo: boolean; branding: Branding }) {
  const form = useLoginForm(invite);
  return (
    <main
      className="login-page login-centered"
      style={{ '--brand-color': branding.color, '--brand-color-alpha': branding.color + '1e', '--brand-shadow': branding.color + '59' } as React.CSSProperties}
    >
      <div className="login-card">
        <div className="brand-center">
          <div className="brand-logo-wrap">
            {branding.logo
              ? <img src={branding.logo} alt={branding.name} />
              : <Zap size={32} fill="currentColor" />}
          </div>
          <h2>{branding.name}</h2>
          <p>Console · White Label</p>
        </div>
        <LoginFields invite={invite} demo={demo} branding={branding} form={form} />
      </div>
    </main>
  );
}

// ── Template C: Hero ───────────────────────────────────────────────────────
function TemplateHero({ invite, demo, branding }: { invite?: string; demo: boolean; branding: Branding }) {
  const form = useLoginForm(invite);
  return (
    <main
      className="login-page login-hero"
      style={{
        '--brand-color': branding.color,
        '--brand-color-alpha': branding.color + '26',
        '--brand-shadow': branding.color + '55',
      } as React.CSSProperties}
    >
      <div className="login-hero-bg">
        <div className="hero-ambient-orb" />
        <div className="hero-circle-accent" />
        <div className="hero-copy">
          <Link href="/login" className="hero-brand">
            <span className="brand-icon">
              {branding.logo ? (
                <img src={branding.logo} alt={branding.name} />
              ) : (
                <Zap size={26} fill="currentColor" />
              )}
            </span>
            <span className="hero-brand-name">{branding.name}</span>
          </Link>
          <h2>
            Gerencie sua<br />operação com<br /><span>total controle.</span>
          </h2>
          <p>Tenants, checkouts de alta conversão, domínios próprios e conexões de corretoras em um só lugar.</p>
          <div className="hero-feature-pills">
            <span className="hero-pill"><Check size={13} /> Multi-tenant Isolado</span>
            <span className="hero-pill"><Check size={13} /> Alta Conversão</span>
            <span className="hero-pill"><Check size={13} /> Domínio Próprio</span>
          </div>
        </div>
      </div>
      <div className="login-hero-panel">
        <LoginFields invite={invite} demo={demo} branding={branding} form={form} />
      </div>
    </main>
  );
}

// ── Template D: Glassmorphism ──────────────────────────────────────────────
function TemplateGlassmorphism({ invite, demo, branding }: { invite?: string; demo: boolean; branding: Branding }) {
  const form = useLoginForm(invite);
  return (
    <main
      className="login-page login-glassmorphism"
      style={{
        '--brand-color': branding.color,
        '--brand-color-alpha': branding.color + '26',
        '--brand-shadow': branding.color + '50',
      } as React.CSSProperties}
    >
      <div className="glass-orb-1" />
      <div className="glass-orb-2" />
      <div className="glass-orb-3" />
      <div className="glass-container">
        <div className="glass-card">
          <div className="glass-brand-header">
            <div className="glass-brand-icon">
              {branding.logo ? (
                <img src={branding.logo} alt={branding.name} />
              ) : (
                <Zap size={24} fill="currentColor" />
              )}
            </div>
            <h2>{branding.name}</h2>
            <span>Plataforma White Label</span>
          </div>
          <LoginFields invite={invite} demo={demo} branding={branding} form={form} />
        </div>
      </div>
    </main>
  );
}

// ── Template E: Minimal ────────────────────────────────────────────────────
function TemplateMinimal({ invite, demo, branding }: { invite?: string; demo: boolean; branding: Branding }) {
  const form = useLoginForm(invite);
  return (
    <main
      className="login-page login-minimal"
      style={{
        '--brand-color': branding.color,
        '--brand-shadow': branding.color + '40',
      } as React.CSSProperties}
    >
      <div className="minimal-container">
        <div className="minimal-header">
          <div className="minimal-brand-mark">
            {branding.logo ? (
              <img src={branding.logo} alt={branding.name} />
            ) : (
              <Zap size={20} fill="currentColor" />
            )}
          </div>
          <h2>{branding.name}</h2>
          <p>Acesse o console de gerenciamento</p>
        </div>
        <div className="minimal-card">
          <LoginFields invite={invite} demo={demo} branding={branding} form={form} />
        </div>
      </div>
    </main>
  );
}

// ── Entry point ────────────────────────────────────────────────────────────
export default function LoginForm({
  invite,
  demo = false,
  initialTemplate,
}: {
  invite?: string;
  demo?: boolean;
  initialTemplate?: LoginTemplate;
}) {
  const [branding, setBranding] = useState<Branding>({
    name: 'Plataforma',
    color: '#96d600',
    logo: '',
    loginTemplate: initialTemplate || 'split',
  });

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const qTemplate = (params?.get('template') || params?.get('loginTemplate')) as LoginTemplate | null;
    const qName = params?.get('name');
    const qColor = params?.get('color');
    const qLogo = params?.get('logo');

    let stored: Partial<Branding> = {};
    if (typeof window !== 'undefined') {
      try {
        stored = JSON.parse(localStorage.getItem('whitelabel_tenant_branding') || '{}');
      } catch {}
    }

    const applyBranding = (b: Branding) => {
      setBranding(b);
      if (typeof document !== 'undefined' && b.color) {
        document.documentElement.style.setProperty('--lime', b.color);
        document.documentElement.style.setProperty('--brand-primary', b.color);
      }
    };

    fetch('/api/branding')
      .then((r) => r.json())
      .then((d: Record<string, unknown>) => {
        const resolvedTemplate = qTemplate || initialTemplate || (d?.loginTemplate as LoginTemplate) || (stored.loginTemplate as LoginTemplate) || 'split';
        const resolvedName = qName || (d?.name as string) || (stored.name as string) || 'Plataforma';
        const resolvedColor = qColor || (d?.color as string) || (stored.color as string) || '#96d600';
        const resolvedLogo = qLogo || (d?.logo as string) || (stored.logo as string) || '';
        applyBranding({
          name: resolvedName,
          color: resolvedColor,
          logo: resolvedLogo,
          loginTemplate: resolvedTemplate,
        });
      })
      .catch(() => {
        const resolvedTemplate = qTemplate || initialTemplate || (stored.loginTemplate as LoginTemplate) || 'split';
        const resolvedName = qName || (stored.name as string) || 'Plataforma';
        const resolvedColor = qColor || (stored.color as string) || '#96d600';
        const resolvedLogo = qLogo || (stored.logo as string) || '';
        applyBranding({
          name: resolvedName,
          color: resolvedColor,
          logo: resolvedLogo,
          loginTemplate: resolvedTemplate,
        });
      });
  }, [initialTemplate]);

  if (branding.loginTemplate === 'centered') {
    return <TemplateCentered invite={invite} demo={demo} branding={branding} />;
  }
  if (branding.loginTemplate === 'hero') {
    return <TemplateHero invite={invite} demo={demo} branding={branding} />;
  }
  if (branding.loginTemplate === 'glassmorphism') {
    return <TemplateGlassmorphism invite={invite} demo={demo} branding={branding} />;
  }
  if (branding.loginTemplate === 'minimal') {
    return <TemplateMinimal invite={invite} demo={demo} branding={branding} />;
  }
  return <TemplateSplit invite={invite} demo={demo} branding={branding} />;
}

