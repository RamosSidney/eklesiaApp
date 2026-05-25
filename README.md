# ✦ EklēsiaApp

Sistema completo de gestão de membros para igrejas — web + mobile.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend web | Next.js 14 + React 18 |
| App mobile | React Native (Expo) |
| Backend API | Node.js + Fastify |
| Banco de dados | PostgreSQL via Supabase |
| Autenticação | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Deploy frontend | Vercel |
| Deploy backend | Railway |

## Estrutura do projeto

```
eklesiaapp/
├── database/
│   └── schema.sql          # Schema completo + RLS + views
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js       # Entry point Fastify
│       ├── modules/
│       │   ├── auth/       # Login, JWT, middleware
│       │   ├── members/    # CRUD membros
│       │   ├── ministries/ # CRUD ministérios
│       │   └── events/     # CRUD eventos + frequência
│       └── shared/
│           ├── middleware/  # Auth guard, RLS helper
│           └── utils/       # Helpers, validações
└── frontend/
    ├── package.json
    ├── .env.example
    └── src/
        ├── app/            # Next.js App Router
        ├── components/     # UI, layout, domínio
        ├── hooks/          # Custom hooks
        └── lib/            # Supabase client, fetchers
```

## Instalação rápida

### 1. Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute `database/schema.sql`
3. Copie a **Project URL** e a **anon/service_role key**

### 2. Backend

```bash
cd backend
cp .env.example .env      # preencha as variáveis
npm install
npm run dev               # porta 3001
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local  # preencha as variáveis
npm install
npm run dev               # porta 3000
```

## Variáveis de ambiente

### Backend `.env`
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=sua-chave-secreta-minimo-32-chars
PORT=3001
NODE_ENV=development
```

### Frontend `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Roles e permissões

| Role | Pode fazer |
|---|---|
| `super_admin` | Tudo |
| `admin` | CRUD completo da iglesia |
| `pastor` | CRUD membros + eventos |
| `leader` | Ver + editar membros do ministério |
| `secretary` | CRUD membros |
| `viewer` | Somente leitura |

## Deploy em produção

### Frontend → Vercel
```bash
vercel deploy
```

### Backend → Railway
```bash
railway up
```

## Licença
MIT
