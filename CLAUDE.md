# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Thia is a Cameroonian skincare e-commerce platform. It is a monorepo with three packages:

- `apps/frontend` — Nuxt 3 SSR storefront + admin panel
- `apps/backend` — Fastify 5 REST API (most routes are stubs awaiting implementation)
- `packages/shared` — Shared TypeScript types, constants, and validators consumed by both apps

## Git Workflow

Every fix, feature, or story follows this exact sequence — no exceptions.

**Before starting any work:**
```bash
git checkout develop
git pull origin develop
git rebase origin/develop        # resolve any conflicts here
git checkout -b <branch-name>    # e.g. feat/us-2.4-pdp, fix/cart-summary-props
```

Branch naming convention:
- `feat/us-<id>-<short-description>` — new feature tied to a user story
- `fix/<short-description>` — bug fix
- `chore/<short-description>` — tooling, config, dependency updates

**When work is complete and approved:**
```bash
git checkout develop
git pull origin develop
git checkout <branch-name>
git rebase develop               # resolve conflicts if any, then git rebase --continue
# push and open PR
git push origin <branch-name>
gh pr create --base develop --title "..." --body "..."
```

PRs always target `develop`, never `main`. Merge into `main` is a separate deliberate step for releases only.

## Approval Gate — No Push Without Confirmation

After completing any fix or story implementation, **stop and wait for the user to confirm the fix works** before pushing or creating a PR. The sequence is:

1. Apply the fix / finish the implementation
2. Run typecheck and report the result
3. **Tell the user what to test and wait for their explicit "it works" / approval**
4. Only after approval: checkout develop → pull → checkout branch → rebase → push → PR

This prevents orphaned branches from fixes that need further iteration.

## Commands

All commands must be run from the relevant app directory, not the root.

**Frontend (`apps/frontend/`)**
```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run generate     # Static site generation
npm run typecheck    # Nuxt type check
```

**Backend (`apps/backend/`)**
```bash
npm run dev          # tsx watch (hot reload)
npm run build        # tsc → dist/
npm run start        # Run compiled dist/server.js
```

**Shared (`packages/shared/`)**
```bash
npm run typecheck:shared   # Run from repo root
```

**Database**
```bash
npx supabase start         # Local Supabase instance
npx supabase db push       # Apply migrations
```

There is no lint or test runner configured yet.

## Architecture

### Frontend (Nuxt 3)

**Routing** is file-based under `pages/`. Route rendering strategy is set in `nuxt.config.ts` `routeRules`:
- SWR (ISR): `/`, `/categories/**`, `/products/**`, `/testimonials`
- Client-only SPA: `/cart`, `/checkout`, `/auth/**`, `/account/**`, `/admin/**`, `/order-confirmation/**`

**Layouts** (`layouts/`) — pages opt in via `definePageMeta({ layout: '...' })`:
- `default` — storefront with `AppHeader`, `MobileMenu`, `AppFooter`
- `auth` — centered card with logo
- `checkout` — minimal header with back-to-cart link
- `admin` — `AdminSidebar` + top bar

**Route Middleware** (`middleware/`):
- `auth.ts` — requires `useSupabaseUser()`, redirects to `/auth/login?redirect=...`
- `admin.ts` — requires login AND `role === 'admin'` from the `profiles` table, redirects to `/`

**Pinia Stores** (`stores/`):
- `auth.ts` — wraps `@nuxtjs/supabase`; auto-fetches profile on user change; exposes `isAdmin` (checks `profile.role === 'admin'`)
- `cart.ts` — guest cart persists to `localStorage` (`thia-cart`); on login calls `mergeGuestCart()` which syncs to backend (backend sync is TODO)
- `ui.ts` — mobile menu toggle, global loading, toast queue

**Components** (`components/`) are auto-imported. The `ui/` subdirectory contains shadcn-vue primitives (no prefix). Feature components live in subdirectories: `layout/`, `admin/`, `cart/`, `checkout/`, `product/`, `review/`, `testimonial/`.

**Styling** uses Tailwind CSS v4 via `@tailwindcss/vite`. Theme tokens (brand colors, semantic colors, fonts) are defined in `assets/css/main.css`.

### Backend (Fastify 5)

Entry: `src/server.ts` → `src/app.ts` (`buildApp`).

Plugins are registered in order:
1. `cors` — allows `FRONTEND_URL`, credentials enabled
2. `rate-limit` — 100 req/min by IP
3. `error-handler` — normalizes `AppError`, `ZodError`, and unknown errors into `{ error: { code, message, details } }`
4. `auth` — decorates `request.user` (null or User); provides `fastify.authenticate()` and `fastify.requireAdmin()` preHandler hooks

**Supabase clients** (`config/supabase.ts`): two instances — `supabaseAdmin` (service role key, bypasses RLS) and `supabaseClient` (anon key, respects RLS).

**API response envelope:**
- Success: `{ data: T, meta?: PaginationMeta }`
- Error: `{ error: { code, message, details: [{ field?, message }] } }`

**Routes** (`routes/`) — `health.ts` is implemented; all other routes are stubs pending implementation.

**Services** (`services/`) — all stubs: cart, discount, email, order, payment, shipping.

### Shared Package

`packages/shared` exports:
- **Types** — `Product`, `ProductWithVariants`, `Order`, `OrderItem`, `CartItem`, `Profile`, `ApiResponse`, `PaginatedResponse`, etc.
- **Constants** — Cameroon regions, order status mappings, payment channels (MTN Mobile Money, Orange Money via NotchPay)
- **Validators** — Cameroon phone number format, currency formatting

### Auth Flow

1. Frontend: Supabase handles session via `@nuxtjs/supabase`. The auth store watches `useSupabaseUser()` and fetches the user's row from the `profiles` table (which adds `role`, `phone`, `fullName`).
2. Backend: Token is extracted from `Authorization: Bearer <token>`, validated with `supabaseAdmin.auth.getUser(token)`, attached to `request.user`.

### Payment Integration

NotchPay (MTN Mobile Money + Orange Money). Constants in `packages/shared/constants/payment-channels.ts`. Backend routes `payments.ts` and `payments.webhook.ts` are stubs.

## Environment Variables

Copy `.env.example` in each app. Required variables (validated with Zod in `apps/backend/src/config/env.ts`):

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY   # Backend only
SUPABASE_ANON_KEY
NOTCHPAY_PUBLIC_KEY
NOTCHPAY_PRIVATE_KEY
NOTCHPAY_WEBHOOK_SECRET
FRONTEND_URL                # Backend CORS origin
```

Frontend also needs `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_KEY` (anon) as Nuxt public runtime config.

## Implementation Status

Most backend routes and services are intentional stubs. The cart store has TODO comments where it will call backend endpoints that don't exist yet. Composables directory is empty — expected to house Supabase query abstractions.
