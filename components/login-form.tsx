'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowUpRight,
  Eye,
  EyeOff,
  Zap,
  LockKeyhole,
} from '@/components/icons';
export default function LoginForm({ invite }: { invite?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <main className="login-page">
      <header className="login-top">
        <Link href="/login" className="brand">
          <Zap fill="currentColor" />
          TradingPro<span>console</span>
        </Link>
        <span>White Label</span>
      </header>
      <div className="login-main">
        <form
          className="login-content"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
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
          <div className="login-symbol">
            <ShieldCheck size={25} />
          </div>
          <h1>{invite ? 'Ative sua conta' : 'Bem-vindo de volta'}</h1>
          <p>
            {invite
              ? 'Defina sua senha para acessar a operação.'
              : 'Entre para gerenciar sua plataforma.'}
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
        </form>
      </div>
      <footer className="login-footer">
        <span>TradingPro © {new Date().getFullYear()}</span>
        <span>White Label Console</span>
      </footer>
    </main>
  );
}
