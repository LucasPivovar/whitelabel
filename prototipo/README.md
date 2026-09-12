# TradingPro - protótipo visual

Versão estática extraída do pacote fornecido e adaptada para demonstração.

- Não depende do servidor original.
- Não envia credenciais, ordens ou dados para APIs de trading.
- O botão **Entrar** aceita campos vazios e abre a plataforma.
- `/prototipo` abre diretamente o login, sem landing page.
- Login, recuperação e redefinição de senha usam o template e a identidade escolhidos no painel.
- A paleta de tons e contraste é compartilhada com o painel. A prévia renderiza o próprio login, sem vídeos ou chamadas ao backend.
- Saldo, gráfico, operações, robô, histórico, configurações, checkout e suporte usam dados simulados no navegador.

Para abrir localmente:

```powershell
node serve.mjs
```

Depois acesse `http://127.0.0.1:4173/prototipo`.

Com o painel em execução (`npm run dev` na raiz), use `http://127.0.0.1:5173/prototipo` para compartilhar as alterações de identidade em tempo real.

`auth.js` e `auth.css` contêm os cinco templates. `palette.js` é gerado de `lib/brand-palette.ts` por `scripts/assets.mjs`. As adaptações do bundle arquivado ficam em `scripts/patch-bundle.mjs`.
