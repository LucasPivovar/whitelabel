'use client';
import { useState } from 'react';
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
} from '@/components/icons';
export default function LoginForm({ invite, demo = false }: { invite?: string; demo?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <main className="login-page login-split">
      <section className="login-intro" aria-label="TradingPro White Label">
        <Link href="/login" className="brand">
          <Zap fill="currentColor" />
          <span className="login-brand-name">TradingPro<small>Controle da plataforma</small></span>
        </Link>
        <div className="login-intro-copy">
          <span className="login-eyebrow"><ShieldCheck size={14} /> GESTÃO WHITE LABEL</span>
          <h2>Uma visão clara<br />de toda a<br />operação.</h2>
          <p>Tenants, checkouts, conexões e acessos reunidos em uma área desenhada para decisões rápidas.</p>
        </div>
        <div className="login-platform"><Activity size={20} /><span>Plataforma central<small>Gestão do ecossistema TradingPro</small></span></div>
      </section>
      <div className="login-main">
        <form
          className="login-content"
          noValidate={demo}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              if (demo) {
                const response = await fetch('/api/demo/role', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ role: 'tenant' }),
                });
                if (!response.ok) throw Error('Não foi possível abrir a demonstração.');
                window.location.assign('/');
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
              const data = await r.json();
              if (!r.ok) throw Error(data.error);
              router.replace('/');
              router.refresh();
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
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
                title={visible ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? 'Entrando…' : invite ? 'Ativar conta' : 'Entrar'}
            <ArrowUpRight size={17} />
          </button>
          <p className="login-footnote">
            <LockKeyhole size={13} />
            Acesso restrito aos administradores da plataforma.
          </p>
          {demo && <p className="login-footnote">Demonstração com dados fictícios. As alterações podem ser apagadas.</p>}
        </form>
      </div>
    </main>
  );
}
