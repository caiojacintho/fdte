# Nosso Bairro — Consulta Popular da Habitação (PLANEHAB)

Plataforma com duas frentes:

- `formulario/` — jogo digital (login → onboarding → tabuleiro da casa → painel do bairro → envio)
- `formulario2/` — **Jogo do Bairro** (Etapa 2): tabuleiro do "Painel Nosso Bairro" acessado pelos links de grupo (`/acesso/<n>-<codigo>`). Cada grupo (1 a 6) abre o tabuleiro na sua cor. Ao clicar em **Enviar respostas**, o link é encerrado (bloqueado) e a resposta aparece no admin, na **Etapa 2** da sessão (via API `/api/bairro`). Só desktop.
- `admin/` — painel para gestores acompanharem as submissões
- `server/` — API compartilhada (Node + Express + SQLite embutido)

## Como rodar localmente

Abra 3 terminais:

```bash
# 1) API
cd server
npm install
npm run dev        # http://localhost:4000

# 2) Formulário (jogo)
cd formulario
npm install
npm run dev         # http://localhost:5173

# 3) Painel do gestor
cd admin
npm install
npm run dev          # http://localhost:5174

# 4) Jogo do Bairro (Etapa 2 — só desktop)
cd formulario2
npm install
npm run dev          # http://localhost:5176  (abra em /acesso/<codigo>)
```

Na primeira execução do servidor, um usuário administrador é criado automaticamente:

- **E-mail:** `admin@planehab.local`
- **Senha:** `admin123`

(pode ser sobrescrito com as variáveis de ambiente `ADMIN_EMAIL` e `ADMIN_PASSWORD` antes de rodar `npm run dev` no `server/`)

## Fluxo do jogo

1. Usuário cria conta (nome, entidade, cidade, e-mail, senha) ou faz login.
2. Onboarding explica o objetivo da consulta e como jogar.
3. **Etapa 1 — Tabuleiro da casa**: 3 passos (Como é hoje / Como mudar / O que minha casa precisa), arrastando cartas para os espaços.
4. **Etapa 2 — Painel Nosso Bairro**: favo hexagonal de 13 espaços, mesma mecânica de arrastar e soltar.
5. Resumo final com revisão de tudo que foi preenchido e envio (depois de enviado, a submissão fica bloqueada para edição).

Tudo é salvo automaticamente a cada carta solta (sem precisa clicar em "salvar").

## Decisões e simplificações assumidas

- **Drag-and-drop**: implementado com `@dnd-kit/core`, que cobre mouse (desktop) e touch (mobile/tablet) nativamente. Cada slot também tem um botão "×" para remover a carta sem precisar arrastar de volta.
- **Banco de dados**: usa o módulo nativo `node:sqlite` do Node 22+ (sem dependências nativas para compilar), gravando em `server/data/app.db`. Para produção/escala maior, trocar por Postgres é direto (a camada de acesso está isolada em `server/src/db.js`).
- **Categorias dos slots**: por ora os 12 espaços de "O que minha casa precisa" e os 13 hexágonos do painel aceitam qualquer carta (sem restrição por categoria), conforme combinado.
- **Cor dos painéis hexagonais**: o jogo usa um único layout/estilo de cor; as 6 variações de cor dos PDFs originais eram só identidade visual de mesas/grupos no jogo físico e não têm efeito funcional aqui.
- **Layout do favo hexagonal**: aproximação do arranjo original (13 espaços em 4 linhas intercaladas), não é um recorte pixel-a-pixel da arte original.
- **Painel admin sem imagens**: para não duplicar os ~220MB de assets do jogo, o admin mostra os nomes das cartas com uma cor por categoria, em vez das ilustrações.

## Próximos passos sugeridos

- Definir (se necessário) regras de categoria por slot.
- Adicionar recuperação de senha.
- Adicionar mais agregados/gráficos no dashboard do admin (por cidade, por entidade, por categoria).
- Deploy: build de produção dos dois frontends (`npm run build`) servidos como estático + API em um host Node com Postgres.
