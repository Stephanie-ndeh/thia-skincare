# Thia Skincare

E-commerce platform for Thia — a Cameroonian skincare brand. Built with Nuxt 3 (frontend), Fastify 5 (backend), and Supabase (database + auth + storage). Payments via NotchPay (MTN Mobile Money + Orange Money).

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase CLI (for local database development)

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd thia

# 2. Install all workspace dependencies
npm install

# 3. Configure environment variables
cp .env.example apps/frontend/.env
cp .env.example apps/backend/.env
# Fill in the real values in each .env file

# 4. Start local Supabase (requires Docker)
npx supabase start

# 5. Run database migrations
npx supabase db push

# 6. Start development servers (from their respective directories)
cd apps/frontend && npm run dev   # http://localhost:3000
cd apps/backend  && npm run dev   # http://localhost:3001
```

## Workspace Structure

```
thia/
├── apps/
│   ├── frontend/     # Nuxt 3 SSR storefront + admin panel
│   └── backend/      # Fastify 5 REST API
├── packages/
│   └── shared/       # Types, constants, validators shared by both apps
├── supabase/
│   └── migrations/   # PostgreSQL migration files
└── docs/             # Project documentation (PRD, architecture, stories)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3, Vue 3, TypeScript, Tailwind CSS v4, shadcn-vue, Pinia |
| Backend | Fastify 5, TypeScript, Zod |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Payments | NotchPay (MTN MoMo + Orange Money) |
| Hosting | Vercel (frontend) + Railway (backend) |
