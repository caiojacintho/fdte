# Nosso Bairro — Consulta Popular da Habitação (PLANEHAB)

Plataforma com duas frentes:

- `formulario/` — jogo digital (identificação → onboarding → tabuleiro da casa → painel do bairro → envio)
- `formulario2/` — **Jogo do Bairro** (Etapa 2): tabuleiro do "Painel Nosso Bairro" acessado pelos links de grupo (`/acesso/<n>-<codigo>`). Cada grupo (1 a 6) abre o tabuleiro na sua cor. Ao clicar em **Enviar respostas**, o link é encerrado (bloqueado) e a resposta aparece no admin, na **Etapa 2** da sessão (via API `/api/bairro`). Só desktop.
- `admin/` — painel para gestores acompanharem as submissões
- `server/` — API compartilhada (Node + Hono + Postgres via Drizzle ORM)

## Como rodar localmente

O repositório usa **npm workspaces**: um único `npm install` na raiz instala as 4 apps (`server`, `admin`, `formulario`, `formulario2`) num só `node_modules`, sem precisar entrar em cada pasta separadamente.

```bash
npm install     # instala tudo, a partir da raiz do repositório
npm run dev     # sobe as 4 apps em paralelo
```

Cada app fica disponível em:

- **API** — http://localhost:4000
- **Formulário (jogo)** — http://localhost:5173
- **Painel do gestor** — http://localhost:5174
- **Jogo do Bairro** (Etapa 2 — só desktop) — http://localhost:5176 (abra em `/acesso/<codigo>`)

Para rodar só uma app específica: `npm run dev -w server` (ou `-w admin`, `-w formulario`, `-w formulario2`).

Na primeira execução do servidor, um usuário administrador é criado automaticamente:

- **E-mail:** `admin@planehab.local`
- **Senha:** `admin123`

(pode ser sobrescrito com as variáveis de ambiente `ADMIN_EMAIL` e `ADMIN_PASSWORD` antes de rodar `npm run dev` no `server/`)

## Fluxo do jogo

1. Participante se identifica (nome, cidade, entidade) — sem criar conta nem senha. O formulário gera um token anônimo de submissão, salvo no navegador, que identifica as respostas dali em diante.
2. Onboarding explica o objetivo da consulta e como jogar.
3. **Etapa 1 — Tabuleiro da casa**: 3 passos (Como é hoje / Como mudar / O que minha casa precisa), arrastando cartas para os espaços.
4. **Etapa 2 — Painel Nosso Bairro**: favo hexagonal de 13 espaços, mesma mecânica de arrastar e soltar.
5. Resumo final com revisão de tudo que foi preenchido e envio (depois de enviado, a submissão fica bloqueada para edição).

Tudo é salvo automaticamente a cada carta solta (sem precisa clicar em "salvar").

## Decisões e simplificações assumidas

- **Drag-and-drop**: implementado com `@dnd-kit/core`, que cobre mouse (desktop) e touch (mobile/tablet) nativamente. Cada slot também tem um botão "×" para remover a carta sem precisar arrastar de volta.
- **Banco de dados**: Postgres via Drizzle ORM (`server/src/db/schema.ts` + migrations em `server/drizzle/`), rodando localmente via `docker compose up -d` (serviços `postgres` + `adminer`). O schema é aplicado com `npm run db:migrate -w server` e populado com `npm run db:seed -w server` (usuário admin) e `npm run db:seed:fake -w server` (dados de exemplo).
- **Categorias dos slots**: por ora os 12 espaços de "O que minha casa precisa" e os 13 hexágonos do painel aceitam qualquer carta (sem restrição por categoria), conforme combinado.
- **Cor dos painéis hexagonais**: o jogo usa um único layout/estilo de cor; as 6 variações de cor dos PDFs originais eram só identidade visual de mesas/grupos no jogo físico e não têm efeito funcional aqui.
- **Layout do favo hexagonal**: aproximação do arranjo original (13 espaços em 4 linhas intercaladas), não é um recorte pixel-a-pixel da arte original.
- **Painel admin sem imagens**: para não duplicar os ~220MB de assets do jogo, o admin mostra os nomes das cartas com uma cor por categoria, em vez das ilustrações.

## Próximos passos sugeridos

- Definir (se necessário) regras de categoria por slot.
- Adicionar recuperação de senha.
- Adicionar mais agregados/gráficos no dashboard do admin (por cidade, por entidade, por categoria).
- Deploy: build de produção dos dois frontends (`npm run build`) servidos como estático + API em um host Node com Postgres.
