# Architecture Decision Document — Thia Skincare E-Commerce

**Author:** Big Steph
**Date:** 2026-03-24
**Status:** Draft
**Source:** [PRD](./prd.md) | [Product Brief](./project-brief.md)

---

## 1. Project Context

### 1.1 System Overview

Thia is a skincare e-commerce platform for the Cameroonian market. The system consists of three deployment units:

1. **Storefront + Admin SPA** — Nuxt 3 SSR application (Vercel)
2. **API Server** — Fastify 5 REST API (Railway)
3. **Data Layer** — Supabase (PostgreSQL + Auth + Storage)

External integration: **NotchPay** for MTN Mobile Money and Orange Money payments.

### 1.2 Scale & Constraints

| Dimension | Value | Implication |
|-----------|-------|-------------|
| Products | ~30 | No need for complex search (full-text PostgreSQL sufficient) |
| Categories | 9 | Static enough for aggressive caching |
| Concurrent users | < 100 | Single Fastify instance sufficient |
| Traffic pattern | Mobile-first, 3G/4G | SSR critical, minimize JS payload |
| Currency | XAF (no decimals) | Integer arithmetic only, no floating point |
| Admin users | 1 (V1) | No multi-tenant complexity |
| Language | English (V1) | No i18n infrastructure needed yet |

### 1.3 Cross-Cutting Concerns

| Concern | Approach |
|---------|----------|
| Authentication | Supabase Auth (JWT) — shared between frontend and backend |
| Authorization | RLS on Supabase + middleware guards on Fastify |
| Error handling | Consistent JSON error envelope on all API responses |
| Logging | Structured JSON logs via pino (Fastify default) |
| Validation | Zod schemas shared between frontend and backend |
| Currency | All monetary values stored as integers (XAF has no subdivisions) |

---

## 2. Monorepo Structure

```
thia/
├── apps/
│   ├── frontend/                    # Nuxt 3 SSR application
│   │   ├── app.vue
│   │   ├── nuxt.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   │   └── main.css         # Tailwind directives + brand tokens
│   │   │   ├── fonts/               # Brand fonts (self-hosted)
│   │   │   └── images/              # Static brand assets (logo, icons)
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn-vue components (generated)
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppFooter.vue
│   │   │   │   ├── MobileMenu.vue
│   │   │   │   └── AdminSidebar.vue
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.vue
│   │   │   │   ├── ProductGrid.vue
│   │   │   │   ├── ProductImageGallery.vue
│   │   │   │   ├── VariantSelector.vue
│   │   │   │   └── ProductTabs.vue
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.vue
│   │   │   │   ├── CartSummary.vue
│   │   │   │   └── DiscountCodeInput.vue
│   │   │   ├── checkout/
│   │   │   │   ├── ShippingForm.vue
│   │   │   │   ├── PaymentSelector.vue
│   │   │   │   └── OrderSummary.vue
│   │   │   ├── review/
│   │   │   │   ├── ReviewList.vue
│   │   │   │   ├── ReviewForm.vue
│   │   │   │   └── StarRating.vue
│   │   │   ├── testimonial/
│   │   │   │   ├── TestimonialCard.vue
│   │   │   │   └── TestimonialCarousel.vue
│   │   │   └── admin/
│   │   │       ├── AdminProductForm.vue
│   │   │       ├── AdminOrderTable.vue
│   │   │       ├── AdminDiscountForm.vue
│   │   │       ├── AdminReviewList.vue
│   │   │       ├── AdminShippingZoneForm.vue
│   │   │       ├── AdminTestimonialForm.vue
│   │   │       ├── AdminStatsCard.vue
│   │   │       └── AdminSalesChart.vue
│   │   ├── composables/
│   │   │   ├── useAuth.ts            # Auth state and methods
│   │   │   ├── useCart.ts            # Cart operations
│   │   │   ├── useProducts.ts        # Product fetching
│   │   │   ├── useCheckout.ts        # Checkout flow state
│   │   │   └── useAdmin.ts           # Admin panel helpers
│   │   ├── layouts/
│   │   │   ├── default.vue           # Storefront layout (header + footer)
│   │   │   ├── auth.vue              # Login/register (centered card)
│   │   │   ├── admin.vue             # Admin layout (sidebar + header)
│   │   │   └── checkout.vue          # Minimal header, no footer
│   │   ├── middleware/
│   │   │   ├── auth.ts               # Requires authenticated user
│   │   │   └── admin.ts              # Requires admin role
│   │   ├── pages/
│   │   │   ├── index.vue                     # Homepage
│   │   │   ├── categories/
│   │   │   │   ├── index.vue                 # Category listing
│   │   │   │   └── [slug].vue                # PLP by category
│   │   │   ├── products/
│   │   │   │   └── [slug].vue                # PDP
│   │   │   ├── search.vue                    # Search results
│   │   │   ├── cart.vue                      # Shopping cart
│   │   │   ├── checkout.vue                  # Checkout flow
│   │   │   ├── order-confirmation/
│   │   │   │   └── [id].vue                  # Order confirmation
│   │   │   ├── testimonials.vue              # Testimonials gallery
│   │   │   ├── auth/
│   │   │   │   ├── login.vue
│   │   │   │   ├── register.vue
│   │   │   │   ├── forgot-password.vue
│   │   │   │   ├── reset-password.vue
│   │   │   │   └── confirm.vue               # Email confirmation landing
│   │   │   ├── account/
│   │   │   │   ├── index.vue                 # Dashboard
│   │   │   │   ├── orders/
│   │   │   │   │   ├── index.vue             # Order history
│   │   │   │   │   └── [id].vue              # Order detail
│   │   │   │   ├── addresses.vue             # Address book
│   │   │   │   └── profile.vue               # Profile settings
│   │   │   └── admin/
│   │   │       ├── index.vue                 # Admin dashboard
│   │   │       ├── products/
│   │   │       │   ├── index.vue             # Product list
│   │   │       │   ├── new.vue               # Create product
│   │   │       │   └── [id].vue              # Edit product
│   │   │       ├── categories/
│   │   │       │   └── index.vue             # Category management
│   │   │       ├── orders/
│   │   │       │   ├── index.vue             # Order list
│   │   │       │   └── [id].vue              # Order detail
│   │   │       ├── promotions/
│   │   │       │   └── index.vue             # Discount code management
│   │   │       ├── reviews/
│   │   │       │   └── index.vue             # Review moderation
│   │   │       ├── testimonials/
│   │   │       │   └── index.vue             # Testimonial management
│   │   │       ├── shipping/
│   │   │       │   └── index.vue             # Shipping zones
│   │   │       ├── customers/
│   │   │       │   └── index.vue             # Customer list
│   │   │       ├── analytics/
│   │   │       │   └── index.vue             # Analytics dashboard
│   │   │       └── settings/
│   │   │           └── index.vue             # Homepage content management
│   │   ├── plugins/
│   │   │   └── supabase.client.ts            # Supabase client (if not using @nuxtjs/supabase)
│   │   ├── server/
│   │   │   └── api/                          # Nuxt server routes (BFF proxy if needed)
│   │   ├── stores/
│   │   │   ├── auth.ts                       # Auth state (Pinia)
│   │   │   ├── cart.ts                       # Cart state (Pinia)
│   │   │   └── ui.ts                         # UI state (mobile menu, toasts)
│   │   ├── types/
│   │   │   └── index.ts                      # Frontend-specific types
│   │   └── utils/
│   │       ├── formatCurrency.ts             # XAF formatting (no decimals)
│   │       ├── formatPhone.ts                # Cameroonian phone formatting
│   │       └── validators.ts                 # Client-side validation helpers
│   │
│   └── backend/                     # Fastify 5 API server
│       ├── src/
│       │   ├── app.ts                        # Fastify app factory
│       │   ├── server.ts                     # Entry point (listen)
│       │   ├── config/
│       │   │   ├── env.ts                    # Environment variable parsing (Zod)
│       │   │   └── supabase.ts               # Supabase client (service role)
│       │   ├── plugins/
│       │   │   ├── cors.ts                   # CORS configuration
│       │   │   ├── auth.ts                   # Auth decorator (JWT verification)
│       │   │   ├── rate-limit.ts             # Rate limiting
│       │   │   └── error-handler.ts          # Global error handler
│       │   ├── routes/
│       │   │   ├── health.ts                 # GET /health
│       │   │   ├── auth/
│       │   │   │   └── index.ts              # POST /auth/register, POST /auth/login, etc.
│       │   │   ├── products/
│       │   │   │   └── index.ts              # GET /products, GET /products/:slug
│       │   │   ├── categories/
│       │   │   │   └── index.ts              # GET /categories, GET /categories/:slug
│       │   │   ├── cart/
│       │   │   │   └── index.ts              # GET/POST/PUT/DELETE /cart
│       │   │   ├── checkout/
│       │   │   │   └── index.ts              # POST /checkout
│       │   │   ├── orders/
│       │   │   │   └── index.ts              # GET /orders, GET /orders/:id
│       │   │   ├── payments/
│       │   │   │   ├── index.ts              # POST /payments/initialize
│       │   │   │   └── webhook.ts            # POST /payments/webhook (NotchPay)
│       │   │   ├── reviews/
│       │   │   │   └── index.ts              # GET/POST /reviews
│       │   │   ├── shipping/
│       │   │   │   └── index.ts              # GET /shipping/calculate
│       │   │   ├── search/
│       │   │   │   └── index.ts              # GET /search?q=
│       │   │   ├── discount-codes/
│       │   │   │   └── index.ts              # POST /discount-codes/validate
│       │   │   ├── testimonials/
│       │   │   │   └── index.ts              # GET /testimonials
│       │   │   └── admin/
│       │   │       ├── products.ts           # Admin product CRUD
│       │   │       ├── categories.ts         # Admin category CRUD
│       │   │       ├── orders.ts             # Admin order management
│       │   │       ├── promotions.ts         # Admin discount code CRUD
│       │   │       ├── reviews.ts            # Admin review moderation
│       │   │       ├── testimonials.ts       # Admin testimonial CRUD
│       │   │       ├── shipping.ts           # Admin shipping zone CRUD
│       │   │       ├── customers.ts          # Admin customer list
│       │   │       ├── analytics.ts          # Admin analytics queries
│       │   │       ├── settings.ts           # Admin homepage settings
│       │   │       └── upload.ts             # Admin file upload proxy
│       │   ├── services/
│       │   │   ├── payment.service.ts        # NotchPay integration
│       │   │   ├── order.service.ts          # Order creation and status management
│       │   │   ├── cart.service.ts           # Server-side cart operations
│       │   │   ├── shipping.service.ts       # Shipping cost calculation
│       │   │   ├── discount.service.ts       # Discount validation logic
│       │   │   └── email.service.ts          # Transactional email sending
│       │   ├── middleware/
│       │   │   ├── authenticate.ts           # Verify JWT, attach user to request
│       │   │   └── authorize-admin.ts        # Verify admin role
│       │   ├── schemas/
│       │   │   ├── product.schema.ts         # Zod schemas for product endpoints
│       │   │   ├── order.schema.ts
│       │   │   ├── checkout.schema.ts
│       │   │   ├── review.schema.ts
│       │   │   ├── discount.schema.ts
│       │   │   └── common.schema.ts          # Shared types (pagination, etc.)
│       │   └── utils/
│       │       ├── order-number.ts           # Sequential order number generator
│       │       ├── webhook-verify.ts         # NotchPay signature verification
│       │       └── phone.ts                  # Cameroonian phone validation
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                      # Shared code between frontend and backend
│       ├── types/
│       │   ├── product.ts                    # Product, Variant, Category types
│       │   ├── order.ts                      # Order, OrderItem types
│       │   ├── user.ts                       # User, Address types
│       │   ├── cart.ts                       # Cart, CartItem types
│       │   ├── review.ts                     # Review types
│       │   ├── payment.ts                    # Payment types and enums
│       │   ├── shipping.ts                   # ShippingZone, Region types
│       │   ├── discount.ts                   # DiscountCode types
│       │   ├── testimonial.ts                # Testimonial types
│       │   ├── api.ts                        # API response envelope types
│       │   └── index.ts                      # Re-exports
│       ├── constants/
│       │   ├── regions.ts                    # Cameroon regions and cities
│       │   ├── order-status.ts               # Order status enum and transitions
│       │   └── payment-channels.ts           # NotchPay channel codes
│       ├── validators/
│       │   ├── phone.ts                      # Phone number validation (CM format)
│       │   └── currency.ts                   # XAF formatting/parsing
│       ├── package.json
│       └── tsconfig.json
│
├── supabase/
│   ├── migrations/                  # SQL migration files (sequential)
│   │   ├── 00001_create_profiles.sql
│   │   ├── 00002_create_categories.sql
│   │   ├── 00003_create_products.sql
│   │   ├── 00004_create_orders.sql
│   │   ├── 00005_create_reviews.sql
│   │   ├── 00006_create_shipping_zones.sql
│   │   ├── 00007_create_discount_codes.sql
│   │   ├── 00008_create_testimonials.sql
│   │   ├── 00009_create_site_settings.sql
│   │   └── 00010_create_rls_policies.sql
│   ├── seed.sql                     # Seed data (categories, shipping zones, admin user)
│   └── config.toml                  # Supabase local dev config
│
├── docs/
│   ├── project-brief.md
│   ├── prd.md
│   ├── architecture.md              # This document
│   └── stories/                     # Individual story files (future)
│
├── package.json                     # Workspace root (npm workspaces)
├── tsconfig.base.json               # Shared TypeScript config
├── .env.example                     # Environment variable template
├── .gitignore
└── README.md
```

### 2.1 Workspace Configuration

Root `package.json` uses npm workspaces:

```json
{
  "name": "thia",
  "private": true,
  "workspaces": [
    "apps/frontend",
    "apps/backend",
    "packages/shared"
  ]
}
```

The `shared` package is referenced in both apps via workspace protocol:
- Frontend: `"@thia/shared": "workspace:*"` in `package.json`
- Backend: `"@thia/shared": "workspace:*"` in `package.json`

---

## 3. Frontend Architecture (Nuxt 3)

### 3.1 Rendering Strategy

Nuxt 3 hybrid rendering with route-level control:

| Route Pattern | Render Mode | Rationale |
|---------------|-------------|-----------|
| `/` (homepage) | SSR + SWR (60s) | SEO + cached for performance |
| `/categories/**` | SSR + SWR (60s) | SEO + category data changes infrequently |
| `/products/**` | SSR + SWR (30s) | SEO critical; product data updates occasionally |
| `/search` | SSR | Dynamic query, no caching |
| `/testimonials` | SSR + SWR (300s) | SEO + rarely changes |
| `/cart` | CSR (SPA) | User-specific, no SEO value |
| `/checkout` | CSR (SPA) | User-specific, sensitive data |
| `/auth/**` | CSR (SPA) | No SEO value |
| `/account/**` | CSR (SPA) | User-specific, protected |
| `/admin/**` | CSR (SPA) | Protected, no SEO value |
| `/order-confirmation/**` | CSR (SPA) | User-specific |

**nuxt.config.ts route rules:**
```typescript
export default defineNuxtConfig({
  routeRules: {
    '/': { swr: 60 },
    '/categories/**': { swr: 60 },
    '/products/**': { swr: 30 },
    '/testimonials': { swr: 300 },
    '/cart': { ssr: false },
    '/checkout': { ssr: false },
    '/auth/**': { ssr: false },
    '/account/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/order-confirmation/**': { ssr: false },
  }
})
```

### 3.2 State Management (Pinia)

Three stores with clear boundaries:

| Store | Scope | Persistence |
|-------|-------|-------------|
| `auth` | User session, profile, role | Supabase session (httpOnly cookie via @nuxtjs/supabase) |
| `cart` | Cart items, discount code | localStorage (guest) / DB (authenticated) |
| `ui` | Mobile menu, toast queue, loading states | None (ephemeral) |

**Cart store merge strategy on login:**
1. Load server cart for authenticated user
2. Load localStorage cart
3. Merge: for matching variant IDs, keep higher quantity
4. Sync merged cart to server
5. Clear localStorage cart

### 3.3 Data Fetching Pattern

All storefront data fetching uses Nuxt's `useFetch` / `useAsyncData` composables to leverage SSR data transfer:

```typescript
// Composable pattern example
export function useProducts(categorySlug: string) {
  return useFetch(`/api/categories/${categorySlug}/products`, {
    baseURL: useRuntimeConfig().public.apiBaseUrl,
    key: `products-${categorySlug}`,
  })
}
```

Admin pages use standard `$fetch` calls (CSR-only, no SSR payload needed).

### 3.4 Component Architecture

**Layer hierarchy:**
1. **shadcn-vue primitives** — Button, Input, Select, Dialog, Table, Tabs, etc.
2. **Domain components** — ProductCard, CartItem, ReviewForm (compose shadcn primitives)
3. **Page sections** — HeroSection, FeaturedProducts, CategoryGrid (compose domain components)
4. **Pages** — Assemble sections, handle data fetching via composables

**Naming conventions:**
- Components: PascalCase (`ProductCard.vue`)
- Composables: camelCase with `use` prefix (`useCart.ts`)
- Stores: camelCase (`auth.ts`, `cart.ts`)
- Pages: kebab-case for multi-word directories (`order-confirmation/`)

### 3.5 Design System Integration

Tailwind CSS v4 configured with brand tokens:

```css
/* assets/css/main.css */
@import "tailwindcss";

@theme {
  /* Brand colors — populated from client style guide */
  --color-brand-primary: /* from style guide */;
  --color-brand-secondary: /* from style guide */;
  --color-brand-accent: /* from style guide */;
  --color-brand-dark: /* from style guide */;
  --color-brand-light: /* from style guide */;

  /* Semantic tokens */
  --color-surface: var(--color-brand-light);
  --color-text-primary: var(--color-brand-dark);
  --color-text-muted: /* from style guide */;

  /* Brand fonts — self-hosted */
  --font-heading: /* from style guide */;
  --font-body: /* from style guide */;
}
```

shadcn-vue components configured to use brand tokens via the CSS variables layer so all primitives inherit the brand identity automatically.

---

## 4. Backend Architecture (Fastify 5)

### 4.1 Plugin Architecture

Fastify plugins registered in order of dependency:

```
app.ts
├── 1. @fastify/cors          — CORS (frontend origin)
├── 2. @fastify/rate-limit     — Rate limiting
├── 3. @fastify/multipart      — File upload handling
├── 4. plugins/error-handler   — Global error envelope
├── 5. plugins/auth            — JWT verification decorator
├── 6. routes/health           — GET /health (no auth)
├── 7. routes/payments/webhook — POST /payments/webhook (no auth, signature verified)
├── 8. routes/products         — Public product routes
├── 9. routes/categories       — Public category routes
├── 10. routes/search          — Public search route
├── 11. routes/testimonials    — Public testimonial route
├── 12. routes/shipping        — Public shipping calculator
├── 13. routes/auth            — Registration/login routes
├── 14. routes/cart             — Authenticated cart routes
├── 15. routes/checkout        — Authenticated checkout route
├── 16. routes/orders          — Authenticated order routes
├── 17. routes/reviews         — Authenticated review routes
├── 18. routes/discount-codes  — Public validation route
└── 19. routes/admin/*         — Admin routes (auth + admin role required)
```

### 4.2 Auth Plugin

The auth plugin decorates Fastify's request with user context:

```typescript
// plugins/auth.ts
fastify.decorateRequest('user', null)

fastify.decorate('authenticate', async (request, reply) => {
  const token = request.headers.authorization?.replace('Bearer ', '')
  if (!token) return reply.code(401).send({ error: 'Unauthorized' })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return reply.code(401).send({ error: 'Invalid token' })

  request.user = user
})

fastify.decorate('requireAdmin', async (request, reply) => {
  await fastify.authenticate(request, reply)
  if (request.user?.app_metadata?.role !== 'admin') {
    return reply.code(403).send({ error: 'Forbidden' })
  }
})
```

### 4.3 API Response Envelope

All API responses follow a consistent format:

**Success:**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 45
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone number must be in Cameroonian format",
    "details": [
      { "field": "phone", "message": "Expected format: 6XXXXXXXX or +237 6XXXXXXXX" }
    ]
  }
}
```

### 4.4 Request Validation

All route inputs validated via Zod schemas integrated with Fastify's validation:

```typescript
// schemas/checkout.schema.ts
import { z } from 'zod'

export const checkoutBodySchema = z.object({
  shippingAddress: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^(\+237)?6[0-9]{8}$/),
    region: z.string(),
    city: z.string(),
    addressLine: z.string().min(5).max(200),
    notes: z.string().max(500).optional(),
  }),
  paymentChannel: z.enum(['cm.mtn', 'cm.orange']),
  paymentPhone: z.string().regex(/^\+237[0-9]{9}$/),
  discountCode: z.string().optional(),
})
```

### 4.5 Service Layer

Business logic encapsulated in services, keeping routes thin:

| Service | Responsibility |
|---------|---------------|
| `payment.service` | NotchPay API calls (initialize, process, verify), webhook signature verification |
| `order.service` | Order creation, status transitions, order number generation, confirmation emails |
| `cart.service` | Server-side cart CRUD, stock validation, guest-to-auth merge |
| `shipping.service` | Zone lookup by region/city, cost calculation |
| `discount.service` | Code validation (expiry, usage limits, minimum order), discount calculation |
| `email.service` | Order confirmation, password reset (via Supabase or transactional email provider) |

---

## 5. Database Schema (Supabase PostgreSQL)

### 5.1 Entity Relationship Diagram

```
profiles ──────────────── orders ──────────────── order_items
    │                        │                        │
    │                        │                        │
    ├── addresses             ├── (payment fields)     └── product_variants
    │                        │                              │
    ├── reviews              └── discount_codes             │
    │       │                                          products
    │       └── products ────── product_images              │
    │               │                                  categories
    │               └── product_variants
    │
    └── cart_items ──── product_variants

testimonials (standalone)
shipping_zones (standalone)
site_settings (standalone)
```

### 5.2 Table Definitions

#### `profiles`
Extends Supabase `auth.users` with application-specific data.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### `categories`

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
```

#### `products`

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  ingredients TEXT,
  usage_instructions TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_published ON public.products(is_published) WHERE is_published = true;

-- Full-text search index
ALTER TABLE public.products ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX idx_products_search ON public.products USING gin(search_vector);
```

#### `product_variants`

```sql
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  size_label TEXT,
  scent_label TEXT,
  price INT NOT NULL CHECK (price > 0),          -- XAF, no decimals
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_variants_product ON public.product_variants(product_id);
```

#### `product_images`

```sql
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,                     -- Supabase Storage path
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_images_product ON public.product_images(product_id);
```

#### `addresses`

```sql
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  address_line TEXT NOT NULL,
  notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user ON public.addresses(user_id);
```

#### `orders`

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,              -- Human-readable: THIA-000001
  user_id UUID REFERENCES public.profiles(id),    -- Nullable for guest checkout
  guest_email TEXT,                                -- For guest orders
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_channel TEXT,                            -- 'cm.mtn' or 'cm.orange'
  payment_phone TEXT,
  payment_reference TEXT,                          -- NotchPay transaction reference
  notchpay_reference TEXT,                         -- NotchPay internal reference
  subtotal INT NOT NULL CHECK (subtotal >= 0),
  shipping_cost INT NOT NULL DEFAULT 0,
  discount_amount INT NOT NULL DEFAULT 0,
  total INT NOT NULL CHECK (total >= 0),
  discount_code_id UUID REFERENCES public.discount_codes(id),
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_region TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_address_line TEXT NOT NULL,
  shipping_notes TEXT,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_ref ON public.orders(payment_reference);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- Sequential order number generator
CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'THIA-' || lpad(nextval('order_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();
```

#### `order_items`

```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  product_name TEXT NOT NULL,                     -- Snapshot at purchase time
  variant_label TEXT NOT NULL,                    -- Snapshot: "50ml / Rose"
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price > 0), -- Snapshot at purchase time
  line_total INT NOT NULL CHECK (line_total > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
```

#### `cart_items`

```sql
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, variant_id)
);

CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);
```

#### `reviews`

```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL CHECK (char_length(text) >= 10 AND char_length(text) <= 1000),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id, order_id)
);

CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);
```

#### `shipping_zones`

```sql
CREATE TABLE public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT,                                       -- NULL = default for entire region
  cost INT NOT NULL CHECK (cost >= 0),             -- XAF
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(region, city)
);
```

#### `discount_codes`

```sql
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value INT NOT NULL CHECK (value > 0),            -- Percentage (1-100) or fixed XAF
  minimum_order INT DEFAULT 0,                     -- Minimum order amount in XAF
  usage_limit INT,                                 -- NULL = unlimited
  usage_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_discount_code ON public.discount_codes(upper(code));
```

#### `testimonials`

```sql
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  text TEXT NOT NULL,
  photo_url TEXT,
  storage_path TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### `site_settings`

```sql
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pre-seed with homepage settings
INSERT INTO public.site_settings (key, value) VALUES
  ('homepage_hero', '{"image_url": "", "cta_link": "/categories", "cta_text": "Shop Now"}'),
  ('featured_product_ids', '[]'),
  ('featured_testimonial_ids', '[]'),
  ('default_shipping_cost', '2000');
```

### 5.3 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ========================
-- PUBLIC READ (storefront)
-- ========================

-- Categories: anyone can read
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

-- Products: anyone can read published products
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (is_published = true);

-- Variants: anyone can read (via product)
CREATE POLICY "variants_public_read" ON public.product_variants
  FOR SELECT USING (true);

-- Product images: anyone can read
CREATE POLICY "images_public_read" ON public.product_images
  FOR SELECT USING (true);

-- Reviews: anyone can read approved reviews
CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (status = 'approved');

-- Shipping zones: anyone can read
CREATE POLICY "shipping_zones_public_read" ON public.shipping_zones
  FOR SELECT USING (true);

-- Discount codes: anyone can read active codes (for validation)
CREATE POLICY "discount_codes_public_read" ON public.discount_codes
  FOR SELECT USING (is_active = true);

-- Testimonials: anyone can read
CREATE POLICY "testimonials_public_read" ON public.testimonials
  FOR SELECT USING (true);

-- Site settings: anyone can read
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

-- ========================
-- AUTHENTICATED USER
-- ========================

-- Profiles: users read/update own profile
CREATE POLICY "profiles_own_read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Addresses: users manage own addresses
CREATE POLICY "addresses_own_select" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_insert" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_own_update" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_delete" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Cart: users manage own cart
CREATE POLICY "cart_own_select" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_own_insert" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_own_update" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_own_delete" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Orders: users read own orders
CREATE POLICY "orders_own_read" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Order items: users read items of own orders
CREATE POLICY "order_items_own_read" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Reviews: users can insert own reviews, read pending own reviews
CREATE POLICY "reviews_own_insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_read" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reviews_own_update" ON public.reviews
  FOR UPDATE USING (
    auth.uid() = user_id
    AND created_at > now() - interval '48 hours'
  );

-- ========================
-- ADMIN (full access)
-- ========================

-- Helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Admin policies for all tables (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL USING (is_admin());
CREATE POLICY "admin_all_categories" ON public.categories FOR ALL USING (is_admin());
CREATE POLICY "admin_all_products" ON public.products FOR ALL USING (is_admin());
CREATE POLICY "admin_all_variants" ON public.product_variants FOR ALL USING (is_admin());
CREATE POLICY "admin_all_images" ON public.product_images FOR ALL USING (is_admin());
CREATE POLICY "admin_all_orders" ON public.orders FOR ALL USING (is_admin());
CREATE POLICY "admin_all_order_items" ON public.order_items FOR ALL USING (is_admin());
CREATE POLICY "admin_all_reviews" ON public.reviews FOR ALL USING (is_admin());
CREATE POLICY "admin_all_shipping" ON public.shipping_zones FOR ALL USING (is_admin());
CREATE POLICY "admin_all_discounts" ON public.discount_codes FOR ALL USING (is_admin());
CREATE POLICY "admin_all_testimonials" ON public.testimonials FOR ALL USING (is_admin());
CREATE POLICY "admin_all_settings" ON public.site_settings FOR ALL USING (is_admin());
```

**Note:** The backend uses the Supabase **service role key** for operations like order creation, payment webhook processing, and inventory updates that need to bypass RLS. The frontend Supabase client uses the **anon key** and respects RLS policies.

---

## 6. Authentication Flow

### 6.1 Architecture

```
Browser ─── @nuxtjs/supabase ──→ Supabase Auth (JWT)
                                      │
Frontend reads session from cookie ◄──┘
                                      │
Backend ──── supabase.auth.getUser(token) ──→ Validates JWT
```

**@nuxtjs/supabase** handles:
- Session persistence via httpOnly cookie (server-accessible)
- Automatic token refresh
- SSR-compatible: session available on server during SSR
- Client-side auth state via `useSupabaseUser()` composable

### 6.2 Registration Flow

```
1. User fills registration form (name, email, phone, password)
2. Frontend calls Supabase Auth: supabase.auth.signUp({
     email, password,
     options: { data: { full_name, phone } }
   })
3. Supabase creates auth.users row
4. Database trigger creates profiles row with full_name, phone
5. Supabase sends confirmation email
6. User clicks confirmation link → redirected to /auth/confirm
7. Session established → user redirected to homepage
```

### 6.3 Login Flow

```
1. User enters email + password
2. Frontend: supabase.auth.signInWithPassword({ email, password })
3. Supabase validates → returns session (JWT)
4. @nuxtjs/supabase stores session in httpOnly cookie
5. Auth store updated → header reflects logged-in state
6. Cart merge triggered (localStorage → DB)
7. User redirected to previous page or /account
```

### 6.4 Admin Authentication

Admin is a regular user with `role: 'admin'` in profiles table. Set via:
1. Direct database update: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
2. Also reflected in `auth.users.raw_app_meta_data` for JWT claims

Admin middleware on Nuxt checks role from profile before rendering admin pages. Backend `requireAdmin` decorator re-validates on every API call.

---

## 7. NotchPay Payment Flow

### 7.1 Payment Sequence

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │     │ Backend  │     │ NotchPay │     │ Customer │
│  (Nuxt)  │     │(Fastify) │     │   API    │     │  Phone   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                 │
     │ POST /checkout │                │                 │
     │───────────────>│                │                 │
     │                │ Validate cart, │                 │
     │                │ stock, discount│                 │
     │                │ Create order   │                 │
     │                │ (status:pending│                 │
     │                │                │                 │
     │                │ POST /payments │                 │
     │                │───────────────>│                 │
     │                │                │                 │
     │                │  { reference,  │                 │
     │                │  authorization │                 │
     │                │    _url }      │                 │
     │                │<───────────────│                 │
     │                │                │                 │
     │                │ PUT /payments/ │                 │
     │                │ {ref}          │                 │
     │                │ channel:cm.mtn │                 │
     │                │ phone:+237...  │                 │
     │                │───────────────>│                 │
     │                │                │  USSD prompt /  │
     │                │                │  App push       │
     │                │                │────────────────>│
     │                │                │                 │
     │  "Awaiting     │                │                 │ User confirms
     │   payment..."  │                │                 │ with PIN
     │<───────────────│                │                 │────────────>│
     │                │                │                 │
     │                │  POST /payments│/webhook         │
     │                │  event:        │                 │
     │                │  payment.      │                 │
     │                │  complete      │                 │
     │                │<───────────────│                 │
     │                │                │                 │
     │                │ Verify signature                 │
     │                │ Update order   │                 │
     │                │ (confirmed)    │                 │
     │                │ Decrement stock│                 │
     │                │ Send email     │                 │
     │                │                │                 │
     │  Poll: GET     │                │                 │
     │  /orders/{id}  │                │                 │
     │───────────────>│                │                 │
     │                │                │                 │
     │  { status:     │                │                 │
     │    confirmed } │                │                 │
     │<───────────────│                │                 │
     │                │                │                 │
     │  Redirect to   │                │                 │
     │  /order-       │                │                 │
     │  confirmation  │                │                 │
     │                │                │                 │
```

### 7.2 NotchPay API Integration

**Step 1: Initialize Payment**
```
POST https://api.notchpay.co/payments
Authorization: {NOTCHPAY_PUBLIC_KEY}
Content-Type: application/json

{
  "amount": 25000,
  "currency": "XAF",
  "customer": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+237670076224"
  },
  "description": "Thia Order THIA-000042",
  "reference": "THIA-000042",
  "metadata": {
    "order_id": "uuid-here"
  }
}

Response: {
  "transaction": {
    "reference": "trx.xxxxx",
    "status": "pending",
    "authorization_url": "https://pay.notchpay.co/..."
  }
}
```

**Step 2: Process with Mobile Money Channel**
```
PUT https://api.notchpay.co/payments/{trx.reference}
Authorization: {NOTCHPAY_PUBLIC_KEY}

{
  "channel": "cm.mtn",
  "data": {
    "phone": "+237670076224"
  }
}
```

**Step 3: Webhook Confirmation**
```
POST /payments/webhook (your server)
Header: x-notch-signature: {hmac-sha256}

{
  "event": "payment.complete",
  "data": {
    "reference": "trx.xxxxx",
    "status": "complete",
    "amount": 25000,
    "currency": "XAF",
    "fee": 500,
    ...
  }
}
```

**Step 4: Signature Verification**
```typescript
import crypto from 'node:crypto'

function verifyWebhookSignature(payload: string, signature: string, apiKey: string): boolean {
  const hash = crypto.createHmac('sha256', apiKey).update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
}
```

### 7.3 Payment Error Handling

| Scenario | Backend Action | Frontend Display |
|----------|---------------|-----------------|
| NotchPay API unreachable | Return 503, do not create order | "Payment service temporarily unavailable. Please try again." |
| Payment timeout (5 min) | Order stays pending, cron job checks after 10 min | "Payment timed out. Please try again." + retry button |
| Payment failed (webhook) | Update order payment_status = 'failed' | "Payment was not completed. Please try again." |
| Duplicate webhook | Idempotency check on payment_reference — skip if already processed | N/A |
| Invalid signature | Reject webhook, log alert | N/A |

### 7.4 Frontend Polling Strategy

After initiating payment, frontend polls `GET /orders/{id}` every 3 seconds for up to 5 minutes:

```typescript
async function pollPaymentStatus(orderId: string) {
  const maxAttempts = 100  // 3s × 100 = 5 minutes
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await $fetch(`/api/orders/${orderId}`)
    if (data.payment_status === 'completed') {
      return navigateTo(`/order-confirmation/${orderId}`)
    }
    if (data.payment_status === 'failed') {
      throw new Error('Payment failed')
    }
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
  throw new Error('Payment timeout')
}
```

---

## 8. File Storage (Supabase Storage)

### 8.1 Bucket Structure

```
Storage Buckets:
├── product-images/           # Product photos
│   └── {product_id}/
│       ├── {uuid}.webp       # Optimized images
│       └── {uuid}_thumb.webp # Thumbnails (auto-generated)
├── category-images/          # Category cover images
│   └── {category_id}.webp
├── testimonial-photos/       # Customer photos
│   └── {uuid}.webp
└── site-assets/              # Hero banners, misc
    └── {key}.webp
```

### 8.2 Upload Flow (Admin)

```
1. Admin selects image in form
2. Frontend validates: MIME (image/jpeg, image/png, image/webp), size (< 5MB)
3. Frontend sends file to: POST /admin/upload
4. Backend validates again (MIME + size)
5. Backend uploads to Supabase Storage via service role client
6. Backend returns public URL
7. Frontend stores URL in form state
8. On product save, URL persisted to product_images table
```

### 8.3 Bucket Policies

```sql
-- product-images: public read, admin write
CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

-- Same pattern for category-images, testimonial-photos, site-assets
```

### 8.4 Image Optimization Strategy

Images are processed on upload via the backend before storing:
1. Convert to WebP format (sharp library)
2. Generate responsive sizes: 320w, 640w, 960w, 1280w
3. Generate thumbnail: 200x200 cropped
4. Store all sizes in Supabase Storage under the same product directory
5. Frontend uses `<img srcset>` for responsive delivery

---

## 9. API Contract

### 9.1 Public Endpoints (No Auth)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/health` | Health check | `{ status: "ok" }` |
| GET | `/categories` | List all categories | `{ data: Category[] }` |
| GET | `/categories/:slug` | Category with products | `{ data: { category, products } }` |
| GET | `/products/:slug` | Product detail with variants, images, reviews | `{ data: Product }` |
| GET | `/search?q=term` | Full-text product search | `{ data: Product[], meta: { total } }` |
| GET | `/testimonials` | Published testimonials | `{ data: Testimonial[] }` |
| GET | `/shipping/calculate?region=X&city=Y` | Shipping cost lookup | `{ data: { cost: number } }` |
| POST | `/discount-codes/validate` | Validate discount code | `{ data: { valid, type, value, message } }` |
| GET | `/site-settings/:key` | Homepage settings | `{ data: { key, value } }` |

### 9.2 Authenticated Endpoints (Shopper)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/cart` | Get user's cart | `{ data: CartItem[] }` |
| POST | `/cart` | Add item to cart | `{ data: CartItem }` |
| PUT | `/cart/:itemId` | Update quantity | `{ data: CartItem }` |
| DELETE | `/cart/:itemId` | Remove item | `{ data: null }` |
| POST | `/cart/merge` | Merge guest cart into user cart | `{ data: CartItem[] }` |
| POST | `/checkout` | Create order + initiate payment | `{ data: { order, paymentRef } }` |
| GET | `/orders` | List user's orders | `{ data: Order[], meta }` |
| GET | `/orders/:id` | Order detail (includes items) | `{ data: Order }` |
| GET | `/account/profile` | Get profile | `{ data: Profile }` |
| PUT | `/account/profile` | Update profile | `{ data: Profile }` |
| GET | `/account/addresses` | List addresses | `{ data: Address[] }` |
| POST | `/account/addresses` | Add address | `{ data: Address }` |
| PUT | `/account/addresses/:id` | Update address | `{ data: Address }` |
| DELETE | `/account/addresses/:id` | Delete address | `{ data: null }` |
| POST | `/reviews` | Submit review | `{ data: Review }` |
| PUT | `/reviews/:id` | Edit review (within 48h) | `{ data: Review }` |

### 9.3 Admin Endpoints

All admin endpoints prefixed with `/admin`. Require admin role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard stats (today's orders, revenue, counts) |
| GET/POST | `/admin/products` | List / create products |
| GET/PUT/DELETE | `/admin/products/:id` | Get / update / delete product |
| POST | `/admin/products/:id/variants` | Add variant |
| PUT/DELETE | `/admin/products/:id/variants/:vid` | Update / delete variant |
| POST | `/admin/products/:id/images` | Upload product image |
| PUT/DELETE | `/admin/products/:id/images/:iid` | Reorder / delete image |
| GET/POST | `/admin/categories` | List / create categories |
| PUT/DELETE | `/admin/categories/:id` | Update / delete category |
| GET | `/admin/orders` | List all orders (filterable) |
| GET/PUT | `/admin/orders/:id` | Get / update order status |
| GET/POST | `/admin/promotions` | List / create discount codes |
| PUT/DELETE | `/admin/promotions/:id` | Update / delete discount code |
| GET | `/admin/reviews` | List reviews (filterable by status) |
| PUT | `/admin/reviews/:id` | Approve / reject review |
| GET/POST | `/admin/testimonials` | List / create testimonials |
| PUT/DELETE | `/admin/testimonials/:id` | Update / delete testimonial |
| GET/POST | `/admin/shipping` | List / create shipping zones |
| PUT/DELETE | `/admin/shipping/:id` | Update / delete shipping zone |
| GET | `/admin/customers` | List customers |
| GET | `/admin/analytics` | Analytics data (revenue, top products, etc.) |
| PUT | `/admin/settings/:key` | Update site settings |
| POST | `/admin/upload` | Upload file to Supabase Storage |

### 9.4 Webhook Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/webhook` | NotchPay payment confirmation callback (no auth, signature-verified) |

---

## 10. Deployment Architecture

### 10.1 Infrastructure Diagram

```
                    ┌─────────────────────────────────────┐
                    │             Internet                 │
                    └──────────┬──────────┬───────────────┘
                               │          │
                    ┌──────────▼──┐  ┌────▼────────────┐
                    │   Vercel    │  │    Railway       │
                    │   (Edge)    │  │   (Container)    │
                    │             │  │                  │
                    │  Nuxt 3 SSR │  │  Fastify 5 API   │
                    │  + Static   │  │                  │
                    │  Assets CDN │  │  PORT: 3001      │
                    │             │  │                  │
                    └──────┬──────┘  └───────┬──────────┘
                           │                 │
                           │    ┌────────────┘
                           │    │
                    ┌──────▼────▼──────────────────────┐
                    │         Supabase (Cloud)          │
                    │                                   │
                    │  ┌───────────┐  ┌──────────────┐ │
                    │  │PostgreSQL │  │   Auth        │ │
                    │  │  (DB)     │  │   (JWT)       │ │
                    │  └───────────┘  └──────────────┘ │
                    │  ┌───────────┐  ┌──────────────┐ │
                    │  │  Storage  │  │  Realtime     │ │
                    │  │  (S3)     │  │  (optional)   │ │
                    │  └───────────┘  └──────────────┘ │
                    └──────────────────────────────────┘
                                     │
                    ┌────────────────┐│
                    │   NotchPay     ││
                    │   (Payments)   │◄── Webhook to Railway
                    └────────────────┘
```

### 10.2 Environment Variables

**Frontend (Vercel):**
```env
NUXT_PUBLIC_API_BASE_URL=https://api.thia.cm      # Railway backend URL
NUXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NUXT_PUBLIC_SITE_URL=https://thia.cm
```

**Backend (Railway):**
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://thia.cm                       # For CORS
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...                   # Service role (bypasses RLS)
SUPABASE_ANON_KEY=eyJ...
NOTCHPAY_PUBLIC_KEY=pk_...
NOTCHPAY_PRIVATE_KEY=sk_...                        # For webhook verification
NOTCHPAY_WEBHOOK_SECRET=whk_...
```

### 10.3 Deployment Strategy

| Component | Platform | Trigger | Strategy |
|-----------|----------|---------|----------|
| Frontend | Vercel | Git push to `main` | Auto-deploy, preview on PR |
| Backend | Railway | Git push to `main` | Auto-deploy from `/apps/backend` |
| Database | Supabase | Manual migrations | `supabase db push` or migration files |

**Vercel configuration** — Root directory: `apps/frontend`, Build command: `npm run build`, Output: `.output`

**Railway configuration** — Root directory: `apps/backend`, Build command: `npm run build`, Start command: `node dist/server.js`, Health check: `GET /health`

### 10.4 Database Migration Strategy

Migrations managed via Supabase CLI:
- Migration files in `supabase/migrations/` (sequential numbered SQL)
- Local development: `supabase start` (local Docker)
- Deploy to production: `supabase db push` (runs pending migrations)
- Seed data: `supabase db seed` from `supabase/seed.sql`

---

## 11. Implementation Patterns & Conventions

### 11.1 Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Database tables | snake_case, plural | `product_variants` |
| Database columns | snake_case | `is_published`, `created_at` |
| API endpoints | kebab-case, plural | `/discount-codes/validate` |
| API request/response | camelCase | `{ shippingCost, orderNumber }` |
| TypeScript types | PascalCase | `ProductVariant`, `OrderStatus` |
| Vue components | PascalCase | `ProductCard.vue` |
| Composables | camelCase, use prefix | `useCart.ts` |
| Pinia stores | camelCase | `auth.ts`, `cart.ts` |
| CSS classes | Tailwind utilities | `text-brand-primary` |
| Env variables | SCREAMING_SNAKE | `NOTCHPAY_PUBLIC_KEY` |

### 11.2 API-Database Field Mapping

Database uses `snake_case`, API responses use `camelCase`. Transform at the service layer:

```typescript
// Backend: transform DB row to API response
function toApiProduct(row: DbProduct): ApiProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
  }
}
```

### 11.3 Error Handling Pattern

```typescript
// Backend: Custom error class
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
  }
}

// Usage in routes
throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found')
throw new AppError(400, 'VALIDATION_ERROR', 'Invalid phone number', [
  { field: 'phone', message: 'Expected Cameroonian format' }
])

// Global error handler plugin catches and formats response
```

### 11.4 Currency Handling

All monetary values are **integers in XAF** (CFA franc has no subdivisions):

```typescript
// Shared utility
export function formatXAF(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
// formatXAF(25000) → "25 000 FCFA"
```

- No floating point math — all calculations are integer arithmetic
- Percentage discounts: `Math.floor(subtotal * percentage / 100)` (round down in customer's favor)

### 11.5 Order Status Transitions

```
pending → confirmed → processing → shipped → delivered
   │                      │
   └──→ cancelled ←───────┘
```

Only forward transitions allowed (plus cancel from pending/confirmed/processing). Enforced in `order.service.ts`.

---

## 12. Security Architecture

### 12.1 Defense Layers

| Layer | Mechanism |
|-------|----------|
| Transport | HTTPS enforced (Vercel + Railway both default to HTTPS) |
| Authentication | Supabase Auth JWTs, httpOnly cookie storage |
| Authorization | RLS (database level) + middleware (API level) |
| Input validation | Zod schemas on every endpoint |
| Rate limiting | @fastify/rate-limit: 5/min on auth, 100/min on API |
| Payment security | NotchPay webhook HMAC-SHA256 signature verification |
| File uploads | MIME type + size validation (client + server) |
| CORS | Restricted to frontend origin only |
| SQL injection | Parameterized queries via Supabase client (never raw SQL in app code) |
| XSS | Vue's default template escaping + no v-html with user content |

### 12.2 Sensitive Data Handling

| Data | Storage | Access |
|------|---------|--------|
| Passwords | Supabase Auth (bcrypt hashed) | Never exposed |
| API keys (NotchPay) | Railway env vars | Backend only, never in frontend |
| Supabase service role key | Railway env vars | Backend only |
| Customer phone numbers | profiles + orders tables | RLS restricted |
| Payment phone | orders table | RLS restricted |

---

## 13. Architectural Decisions Record

| # | Decision | Rationale | Trade-off |
|---|----------|-----------|-----------|
| ADR-1 | Separate Fastify backend instead of Nuxt server routes for all API | Payment webhooks, admin operations, and complex business logic benefit from a dedicated API server with its own middleware stack. Nuxt server routes are thin and better suited for BFF proxying. | Extra deployment unit, but cleaner separation of concerns. |
| ADR-2 | Supabase RLS + backend middleware (dual authorization) | RLS provides database-level security as a safety net. Backend middleware provides application-level authorization with richer error messages. Belt-and-suspenders approach. | Slightly more complex policy management. |
| ADR-3 | Integer-only currency (no decimals) | XAF has no subdivisions. Using integers eliminates floating-point rounding errors entirely. | Team must remember to never use floats for money. |
| ADR-4 | PostgreSQL full-text search instead of external search service | 30 products does not justify Algolia/Meilisearch complexity. PostgreSQL tsvector with weights on name (A) and description (B) is sufficient. | Would need to migrate if catalog grows to 1000+ products. |
| ADR-5 | NotchPay Direct Charge (two-step) instead of hosted checkout | Direct charge keeps customer on Thia's domain for a seamless brand experience. Hosted checkout redirects away. | Requires handling payment UI and polling on our side. |
| ADR-6 | Polling for payment status instead of WebSocket | Simpler implementation, no persistent connection needed. Payment confirmation takes 5-30 seconds. Polling at 3s intervals is adequate. | Slightly higher latency than real-time push (~1.5s average). |
| ADR-7 | npm workspaces (no Turborepo) | Two apps + one shared package is not complex enough to justify Turborepo overhead. npm workspaces handles dependency linking cleanly. | Would benefit from Turborepo if more packages are added. |
| ADR-8 | Image processing on upload (not on-the-fly) | Pre-generating responsive sizes avoids latency on first request and keeps serving fast. With ~30 products × ~5 images, storage cost is negligible. | Re-upload needed if responsive breakpoints change. |
| ADR-9 | SWR caching on product/category pages | Balances SSR freshness with performance. 30-60s stale-while-revalidate means product updates appear within a minute without sacrificing page speed. | Admin must understand there's a brief delay after edits. |
| ADR-10 | Guest cart in localStorage, auth cart in DB | Avoids DB writes for anonymous browsers. Merge on login preserves both carts. | Cart recovery for abandoned guest sessions requires cookie-based identification (V2). |
