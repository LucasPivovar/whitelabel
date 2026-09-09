# TradingPro White Label

MVP de demonstracao em React 19 + Next.js 16, TypeScript, Bootstrap Icons e componentes acessiveis Base UI. Visual TradingPro com Inter/Sora e acento verde. Hospedagem preparada para Vercel com Turso remoto, SQLite local e autenticacao por senha.

## Rodar localmente

```sh
npm ci
npm run setup
npm run dev
```

Acesse `http://127.0.0.1:5173/login`. O setup cria `.env.local` com `ADMIN_EMAIL=admin@tradingpro.io` e uma senha aleatoria em `ADMIN_PASSWORD`. O arquivo e ignorado pelo Git. O banco em `data/` e persistente. O setup preserva configuracoes existentes.

## Funcionalidades

- Login, sessao HttpOnly, logout, convite de tenant e hash scrypt.
- Super admin: cadastrar/editar operacoes, suspender, liberar conexoes e gerar convites.
- Abas Super admin/Tenant no topo; menus e dados contextualizados pela operacao.
- Tenant: checkouts, identidade, dominio reservado e leitura das conexoes liberadas.
- Builder componentizado em editor, controles reutilizaveis, documento visual e modelo validado.
- Blocos reordenaveis por arraste ou setas, regioes de desktop e ordem independente no mobile.
- Formulario reposicionavel; ordem, visibilidade, obrigatoriedade e largura dos campos.
- Fonte, peso, tamanho, altura de linha, cores, largura, altura, margens, padding e cantos por elemento e dispositivo.
- Banners desktop/mobile, imagens extras, textos livres, divisores, beneficios, avaliacoes e order bump.
- Personalizacao do botao, previa interativa, zoom, desfazer/refazer, rascunho e snapshot publicado.
- Preferencias de upsell, pixels, metadados e notificacoes por checkout.

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `app/panel.tsx` | Estado e rotas visuais do painel |
| `components/checkout-builder.tsx` | Camadas, inspector e historico |
| `components/checkout-document.tsx` | Renderizador compartilhado de previa e publicacao |
| `components/editor-controls.tsx` | Controles reutilizaveis |
| `components/role-toolbar.tsx` | Alternancia de contextos |
| `components/login-form.tsx` | Login e ativacao |
| `lib/checkout-design.ts` | Schema, defaults e validacao de layouts |
| `lib/auth.ts`, `lib/server.ts` | Identidade, sessao e autorizacao |
| `lib/database.ts` | Persistencia local/remota |
| `app/api/` | Operacoes validadas no servidor |
| `tests/` | Testes unitarios e Playwright |

## Verificacao

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

O Playwright usa a porta 5174, um banco de teste separado e credenciais efemeras. O servidor da apresentacao continua na porta 5173. Capturas sao gravadas em `outputs/`; falhas incluem traces e screenshots em `test-results/`.

## Publicacao

Veja [docs/DEPLOY.md](docs/DEPLOY.md) para GitHub, variaveis Vercel, banco e roteiro de validacao. Nenhum deploy externo ou push e feito pelos scripts locais.

Este MVP demonstra administracao e checkout visual. Pagamentos, execucao das conexoes, provisionamento DNS, envio de notificacoes e disparo de pixels exigem as APIs reais; os controles desses itens persistem configuracoes, sem simular sucesso de operacoes financeiras. A autenticacao nao depende de uma aba selecionada: permissoes e isolamento sao aplicados no servidor.
