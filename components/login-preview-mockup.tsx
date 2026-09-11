'use client';

import type { Tenant, LoginTemplate } from '@/lib/model';
import {
  ShieldCheck,
  Zap,
  Check,
  Activity,
  ArrowUpRight,
  LockKeyhole,
} from './icons';

interface Props {
  draft: Tenant;
  isMobile?: boolean;
}

export default function LoginPreviewMockup({ draft, isMobile = false }: Props) {
  const template: LoginTemplate = draft.loginTemplate || 'split';
  const color = draft.color || '#96d600';
  const name = draft.name || 'TradingPro';
  const logo = draft.logo;
  const font = draft.font || 'Inter';

  // Shared inner dummy form
  const DummyForm = ({ isCompact = false }: { isCompact?: boolean }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isCompact ? 12 : 18,
        width: '100%',
        maxWidth: isCompact ? '100%' : 400,
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span
          style={{
            width: isCompact ? 24 : 28,
            height: isCompact ? 24 : 28,
            borderRadius: 7,
            background: color + '24',
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={isCompact ? 14 : 16} />
        </span>
        <span style={{ fontSize: isCompact ? 10 : 12, letterSpacing: 0.9, color: '#99a', fontWeight: 700 }}>
          PAINEL DA PLATAFORMA
        </span>
      </div>

      <div>
        <h3 style={{ fontSize: isCompact ? 18 : 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.3 }}>
          Entre na sua conta
        </h3>
        <p style={{ fontSize: isCompact ? 12 : 14, color: '#889', margin: '4px 0 0' }}>
          Use suas credenciais de administrador.
        </p>
      </div>

      {/* Dummy input: Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: isCompact ? 11 : 13, color: '#aaa', fontWeight: 500 }}>E-mail</span>
        <div
          style={{
            height: isCompact ? 34 : 42,
            background: '#141713',
            border: '1px solid #ffffff1c',
            borderRadius: 8,
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            color: '#778',
            fontSize: isCompact ? 12 : 14,
          }}
        >
          voce@empresa.com
        </div>
      </div>

      {/* Dummy input: Password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: isCompact ? 11 : 13, color: '#aaa', fontWeight: 500 }}>Senha</span>
        <div
          style={{
            height: isCompact ? 34 : 42,
            background: '#141713',
            border: '1px solid #ffffff1c',
            borderRadius: 8,
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#778',
            fontSize: isCompact ? 12 : 14,
          }}
        >
          <span>••••••••••••</span>
        </div>
      </div>

      {/* Dummy submit button */}
      <div
        style={{
          height: isCompact ? 36 : 44,
          background: color,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#0d130a',
          fontWeight: 800,
          fontSize: isCompact ? 12 : 14,
          boxShadow: `0 6px 20px ${color}45`,
          marginTop: 4,
        }}
      >
        <span>Entrar no Console</span>
        <ArrowUpRight size={isCompact ? 14 : 17} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          color: '#667',
          fontSize: isCompact ? 10 : 12,
          marginTop: 2,
        }}
      >
        <LockKeyhole size={isCompact ? 11 : 13} />
        <span>Acesso restrito aos administradores</span>
      </div>
    </div>
  );


  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        fontFamily: `${font}, sans-serif`,
        userSelect: 'none',
        pointerEvents: 'none',
        background: '#090b09',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* ── TEMPLATE A: SPLIT ────────────────────────────────────────────── */}
      {template === 'split' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr',
            gap: isMobile ? 12 : 20,
            padding: isMobile ? 16 : 24,
            boxSizing: 'border-box',
          }}
        >
          {/* Left Hero (Hidden or minimal on mobile) */}
          {!isMobile ? (
            <div
              style={{
                borderRadius: 14,
                border: '1px solid #ffffff12',
                padding: '32px 28px',
                background: `radial-gradient(circle at 15% 15%, ${color}1a 0%, transparent 65%), #111410`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: color,
                      color: '#0d130a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${color}40`,
                    }}
                  >
                    {logo ? (
                      <img src={logo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                    ) : (
                      <Zap size={18} fill="currentColor" />
                    )}
                  </div>
                  <div>
                    <strong style={{ color: '#fff', fontSize: 14, display: 'block' }}>{name}</strong>
                    <span style={{ fontSize: 9, color: '#778' }}>Console White Label</span>
                  </div>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, marginBottom: 12 }}>
                  <ShieldCheck size={12} /> GESTÃO WHITE LABEL
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: '0 0 12px' }}>
                  Uma visão clara<br />de toda a operação.
                </h2>
                <p style={{ fontSize: 12, color: '#889', lineHeight: 1.5, margin: '0 0 20px', maxWidth: 280 }}>
                  Tenants, checkouts de alta conversão, domínios próprios e conexões em uma só infraestrutura.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Multi-tenant Isolado', 'SSL Wildcard Dedicado', 'Snapshots SHA-256'].map((pill) => (
                    <div
                      key={pill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#ffffff08',
                        padding: '4px 8px',
                        borderRadius: 6,
                        width: 'fit-content',
                        fontSize: 10,
                        color: '#bbb',
                        border: '1px solid #ffffff0a',
                      }}
                    >
                      <Check size={11} style={{ color }} />
                      <span>{pill}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: '#ffffff06',
                  borderRadius: 8,
                  border: '1px solid #ffffff0a',
                }}
              >
                <Activity size={16} style={{ color }} />
                <div>
                  <div style={{ fontSize: 10, color: '#ddd', fontWeight: 600 }}>Infraestrutura da Plataforma</div>
                  <div style={{ fontSize: 9, color: '#777' }}>100% Operacional · Latência ~15ms</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: color,
                  color: '#0d130a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {logo ? (
                  <img src={logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                ) : (
                  <Zap size={16} fill="currentColor" />
                )}
              </div>
              <strong style={{ color: '#fff', fontSize: 14 }}>{name}</strong>
            </div>
          )}

          {/* Right Panel: Form */}
          <div
            style={{
              borderRadius: 14,
              border: '1px solid #ffffff12',
              padding: isMobile ? '16px 12px' : '28px 24px',
              background: '#111410',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DummyForm isCompact={isMobile} />
          </div>
        </div>
      )}

      {/* ── TEMPLATE B: CENTERED ────────────────────────────────────────── */}
      {template === 'centered' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? 12 : 24,
            background: `radial-gradient(ellipse at 50% 0%, ${color}22 0%, transparent 65%), #0a0c0a`,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? 320 : 380,
              background: '#111410',
              border: '1px solid #ffffff16',
              borderRadius: 18,
              padding: isMobile ? '20px 16px' : '32px 28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Centered Brand Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div
                style={{
                  width: isMobile ? 44 : 52,
                  height: isMobile ? 44 : 52,
                  borderRadius: 14,
                  background: color,
                  color: '#0d130a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 20px ${color}50`,
                }}
              >
                {logo ? (
                  <img src={logo} alt="" style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, objectFit: 'contain' }} />
                ) : (
                  <Zap size={isMobile ? 24 : 28} fill="currentColor" />
                )}
              </div>
              <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                {name}
              </h2>
              <span style={{ fontSize: 10, color: '#778', marginTop: -4 }}>Console · White Label</span>
            </div>

            <DummyForm isCompact={true} />
          </div>
        </div>
      )}

      {/* ── TEMPLATE C: HERO ────────────────────────────────────────────── */}
      {template === 'hero' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Hero (Fullscreen feel) */}
          {!isMobile ? (
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '36px 32px',
                background: `radial-gradient(ellipse at 15% 25%, ${color}24 0%, transparent 60%), linear-gradient(135deg, #0d120d 0%, #080a08 100%)`,
              }}
            >
              {/* Ambient orb & circle */}
              <div
                style={{
                  position: 'absolute',
                  width: 280,
                  height: 280,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                  opacity: 0.18,
                  filter: 'blur(30px)',
                  top: '50%',
                  left: '20%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`,
                  top: '50%',
                  left: '20%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: color,
                      color: '#0d130a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 6px 20px ${color}45`,
                    }}
                  >
                    {logo ? (
                      <img src={logo} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    ) : (
                      <Zap size={22} fill="currentColor" />
                    )}
                  </div>
                  <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{name}</span>
                </div>

                <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: -0.8, maxWidth: 440 }}>
                  Gerencie sua<br />operação com<br />
                  <span style={{ color }}>total controle.</span>
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: '0 0 22px', maxWidth: 400 }}>
                  Tenants, checkouts de alta conversão, domínios próprios e conexões em um só lugar.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Multi-tenant Isolado', 'Alta Conversão', 'Domínio Próprio'].map((pill) => (
                    <div
                      key={pill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 11,
                        color: '#d4dad2',
                        fontWeight: 500,
                      }}
                    >
                      <Check size={12} style={{ color }} />
                      <span>{pill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          ) : (
            <div
              style={{
                padding: '16px 16px 0',
                background: `radial-gradient(ellipse at 50% 0%, ${color}24 0%, transparent 80%), #0c100c`,
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: color,
                    color: '#0d130a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {logo ? (
                    <img src={logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  ) : (
                    <Zap size={14} fill="currentColor" />
                  )}
                </div>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{name}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                Gerencie com <span style={{ color }}>controle.</span>
              </h3>
            </div>
          )}

          {/* Right Panel: Form */}
          <div
            style={{
              background: '#111410',
              borderLeft: isMobile ? 'none' : '1px solid #ffffff12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '16px 12px' : '28px 24px',
            }}
          >
            <DummyForm isCompact={isMobile} />
          </div>
        </div>
      )}

      {/* ── TEMPLATE D: GLASSMORPHISM ────────────────────────────────────── */}
      {template === 'glassmorphism' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            background: '#070908',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? 12 : 24,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Glowing Orbs */}
          <div
            style={{
              position: 'absolute',
              top: '5%',
              left: '15%',
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: color,
              opacity: 0.22,
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '15%',
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: color,
              opacity: 0.16,
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '40%',
              right: '35%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: '#38bdf8',
              opacity: 0.12,
              filter: 'blur(45px)',
              pointerEvents: 'none',
            }}
          />

          {/* Frosted Glass Card */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: isMobile ? 320 : 390,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: 18,
              padding: isMobile ? '20px 16px' : '32px 28px',
              backdropFilter: 'blur(16px)',
              boxShadow: `0 24px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Glass Brand Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div
                style={{
                  width: isMobile ? 42 : 50,
                  height: isMobile ? 42 : 50,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${color}66`,
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${color}33`,
                }}
              >
                {logo ? (
                  <img src={logo} alt="" style={{ width: isMobile ? 22 : 28, height: isMobile ? 22 : 28, objectFit: 'contain' }} />
                ) : (
                  <Zap size={isMobile ? 20 : 26} fill="currentColor" />
                )}
              </div>
              <strong style={{ color: '#fff', fontSize: isMobile ? 15 : 18, letterSpacing: -0.2 }}>{name}</strong>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 }}>Plataforma White Label</span>
            </div>

            <DummyForm isCompact={isMobile} />
          </div>
        </div>
      )}

      {/* ── TEMPLATE E: MINIMAL ──────────────────────────────────────────── */}
      {template === 'minimal' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#0a0c0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? 12 : 24,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? 320 : 380,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Minimal Header */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#141714',
                  border: '1px solid #ffffff18',
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {logo ? (
                  <img src={logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                ) : (
                  <Zap size={16} fill="currentColor" />
                )}
              </div>
              <strong style={{ color: '#fff', fontSize: 17, letterSpacing: -0.2 }}>{name}</strong>
              <span style={{ color: '#778', fontSize: 11 }}>Acesse o console de gerenciamento</span>
            </div>

            {/* Minimal Card */}
            <div
              style={{
                background: '#111411',
                border: '1px solid #ffffff14',
                borderRadius: 12,
                padding: isMobile ? '20px 16px' : '28px 24px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
              }}
            >
              <DummyForm isCompact={isMobile} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
