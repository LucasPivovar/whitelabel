# GitHub e Vercel

O diretorio `painel` e a raiz da aplicacao Next.js. A publicacao nao depende de Sites ou Cloudflare Workers.

Frontend React e backend ficam neste mesmo repositorio e no mesmo projeto Vercel. As paginas sao servidas por `app/` e as APIs por `app/api/`, no mesmo dominio. Nao e necessario hospedar Express, configurar CORS ou criar um segundo deploy. Apenas o banco persistente fica no Turso.

## GitHub

Crie o repositorio com o conteudo desta pasta na raiz. O arquivo `.github/workflows/ci.yml` instala dependencias, verifica TypeScript, executa testes unitarios, compila e testa o navegador. Se usar o repositorio pai `trade`, configure `painel` como Root Directory na Vercel e ajuste o working-directory do workflow.

O `.gitignore` exclui credenciais, bancos locais, builds e capturas. Nao inclua `.env.local`, `data/`, `test-results/` ou `outputs/` no commit. O lockfile deve ser incluido.

## Banco

Crie um banco Turso e obtenha sua URL `libsql://...` e um token de acesso. Em producao, os registros e imagens usam esse banco remoto. O SQLite local e apenas para desenvolvimento: o filesystem das functions Vercel nao e armazenamento persistente.

O esquema inicial e aplicado de forma idempotente pelo servidor em `lib/database.ts`. Nenhuma senha ou conta de demonstracao e fixa no codigo. Para versoes futuras, adicione migracoes versionadas antes de alterar tabelas existentes.

## Vercel

1. Importe o repositorio, com framework **Next.js** e Node.js **24.x**.
2. Configure as variaveis abaixo em Production e, se necessario, Preview.
3. Execute o deploy com `npm run build`; o start e gerenciado pela Vercel.
4. Acesse `/login`. A primeira tentativa de login inicializa a conta de super admin definida no ambiente.

| Variavel | Valor |
| --- | --- |
| `TURSO_DATABASE_URL` | URL remota do banco |
| `TURSO_AUTH_TOKEN` | Token do banco |
| `ADMIN_EMAIL` | E-mail do super admin |
| `ADMIN_PASSWORD` | Senha inicial forte, entre 12 e 128 caracteres |

Use bancos distintos para Preview e Production. Alterar `ADMIN_PASSWORD` depois que a conta foi criada nao redefine a senha existente. A senha e armazenada como hash scrypt; para reset administrativo use o procedimento controlado no banco ou implemente um fluxo de recuperacao antes da abertura comercial.

## Validar o deploy

- Login e logout; tentativa incorreta rejeitada.
- Nova operacao; gerar convite em **Acesso e dominio** e ativar a conta em outra sessao.
- Tenant sem acesso de super admin e sem dados de outras operacoes.
- Salvar layout, recarregar, publicar e conferir `/checkout/<id>` em celular e desktop.
- Enviar um banner e confirmar que persiste apos novo deploy.

Os convites sao de uso unico, expiram em 24h e precisam ser compartilhados manualmente. Nenhum e-mail e enviado automaticamente.

## Limites do MVP

O projeto permite demonstrar a administracao e a montagem/publicacao visual de ofertas. Gateway e webhooks, execucao de conexoes, DNS customizado, disparo de pixels, e-mails e recuperacao de senha ainda precisam das integracoes reais da TradingPro. A pagina publicada informa que o gateway nao esta conectado e nao envia dados do comprador.

Imagens PNG/JPEG/WebP limitadas a 400 KB ficam no banco para simplificar o deploy. Para maior volume, migre o adapter de midia para object storage. Cada workspace tem limite aproximado de 1,7 MB de configuracoes; ate 40 blocos por checkout e 12 campos por formulario. Os dados gerenciais sao um documento JSON com revisao otimista: edicoes concorrentes conflitantes sao rejeitadas.
