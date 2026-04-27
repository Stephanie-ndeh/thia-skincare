# Product Brief: Thia — Skincare E-Commerce Platform

## Executive Summary

Thia is a direct-to-consumer skincare e-commerce platform built for the Cameroonian market. The brand offers 30 products across 9 categories — from cleansers and serums to body scrubs and scents — and needs a digital storefront that matches the quality and intentionality of its product line. The platform will serve as both the primary sales channel and brand experience, with mobile money payments (MTN MoMo and Orange Money via NotchPay), nationwide shipping with location-based pricing, and a self-service admin panel so the business owner can manage everything independently.

The Cameroonian beauty and personal care market is growing rapidly, driven by increasing digital adoption and a young, mobile-first population. Most local skincare brands still rely on social media and in-person sales — Thia's investment in a purpose-built e-commerce experience positions it to capture customers who are ready to buy online but underserved by existing options. The inspiration is the editorial elegance of [Almaye](https://www.almaye.com) — premium, warm, and intentional — while explicitly avoiding the cluttered, generic aesthetic of mass-market skincare shops.

## The Problem

Skincare consumers in Cameroon face a fragmented purchasing experience. Discovery happens on Instagram or WhatsApp, ordering is manual (DM-based), payment requires coordination, and there's no centralized place to browse a full catalog, read reviews, or trust that a brand is legitimate. For the business owner, this means lost sales from friction, no analytics on customer behavior, and hours spent manually processing orders.

The cost of the status quo: every sale requires a conversation. There's no passive revenue, no cart recovery, no discount code campaigns, and no scalable way to build social proof through reviews and testimonials.

## The Solution

A full-featured, beautifully designed e-commerce website that handles the entire customer journey — from discovery to delivery — while giving the business owner complete control through an admin panel.

**For the customer:**
- Browse 30 products across 9 categories with variant selection (sizes, scents)
- Add to cart, apply discount codes, and check out with MTN Mobile Money or Orange Money
- Read and leave product reviews
- See real customer photos and testimonials
- Get location-based shipping costs calculated automatically at checkout

**For the business owner:**
- Manage products, categories, variants, and inventory through an admin dashboard
- Create and manage discount codes and promotions
- View and process orders
- Manage customer reviews and testimonials
- Upload and organize all brand assets (images, photos, copy)

## What Makes This Different

1. **Built for Cameroon, not adapted from a Western template.** Payment is mobile money first (not credit cards with mobile money bolted on). Shipping is by Cameroonian locality, not zip code. The entire UX is designed for the mobile-first browsing patterns of the target market.

2. **Brand-forward, not marketplace-generic.** The client has a defined brand identity — colors, fonts, style guide — and the platform will be a faithful expression of that identity, not a Shopify theme with a logo swap.

3. **Owner-operated independence.** The admin panel is designed for a non-technical business owner to manage day-to-day operations without developer intervention — product updates, order management, promotions, content.

4. **Modern, performant tech stack.** Nuxt 3 with SSR for SEO and fast first-paint, Supabase for real-time data and auth, and edge deployment via Vercel means the site will be fast even on slower Cameroonian mobile networks.

## Who This Serves

### Primary User: The Skincare Customer
- Cameroonian women (primarily) aged 18-40
- Mobile-first — most traffic will come from smartphones
- Familiar with mobile money payments
- Discovers brands through social media, expects a polished online experience
- Values product information, reviews, and social proof before purchasing
- **Success looks like:** Finding products easily, trusting the brand, checking out in under 2 minutes with mobile money, and receiving orders reliably

### Secondary User: The Business Owner (Admin)
- Non-technical entrepreneur managing the brand end-to-end
- Needs to update products, process orders, run promotions, and manage content
- Currently handles sales manually via social channels
- **Success looks like:** Managing the entire store independently, spending less time on order processing, and having visibility into sales and customer behavior

## Product Catalog Structure

### Categories (9)
| # | Category | Description |
|---|----------|-------------|
| 1 | Cleansers | Facial cleansing products |
| 2 | Moisturizers | Hydrating facial and skin products |
| 3 | Serums | Concentrated treatment products |
| 4 | Sunscreens | Sun protection products |
| 5 | Body Lotions | Body hydration and care |
| 6 | Body Scrubs | Exfoliating body products |
| 7 | Shower Gels | Body wash products |
| 8 | Bar Soaps | Traditional soap products |
| 9 | Scents | Fragrances and scented products |

### Product Details
- **Total products:** ~30
- **Variants:** Size and scent options per product (no bundles)
- **Assets:** Professional product photography provided by client
- **Content:** Product descriptions, ingredients, usage instructions provided by client

## Feature Scope — V1

### Included (MVP)

**Storefront**
- Homepage with hero, featured products, categories, testimonials, and brand story sections
- Product listing pages with category filtering
- Product detail pages with variant selection, image gallery, reviews, and add-to-cart
- Full shopping cart with quantity management
- Checkout flow with shipping address, location-based shipping cost calculation, discount code application, and mobile money payment
- Customer account (order history, saved addresses, profile)
- Customer photo gallery / testimonials section
- Search functionality
- Responsive design (mobile-first)
- SEO optimization via Nuxt SSR

**Payments**
- NotchPay integration for MTN Mobile Money
- NotchPay integration for Orange Money
- Order confirmation and payment status tracking
- Webhook handling for payment callbacks

**Shipping**
- Nationwide Cameroon shipping
- Location-based pricing (by region/city)
- Shipping cost calculation at checkout
- Order tracking status updates

**Promotions**
- Discount codes (percentage and fixed amount)
- Promotion management (start/end dates, usage limits)

**Reviews & Social Proof**
- Product review submission and display (rating + text)
- Customer photos/testimonials section (curated by admin)

**Admin Panel**
- Product CRUD (create, read, update, delete) with variant management
- Category management
- Order management (view, update status, fulfillment tracking)
- Customer management
- Discount code and promotion management
- Review moderation
- Testimonial/customer photo management
- Basic analytics dashboard (sales, orders, top products)
- Image/asset upload and management via Supabase Storage

**Authentication**
- Customer registration and login (Supabase Auth)
- Admin authentication with role-based access
- Password reset flow

### Explicitly Out of V1
- Multi-language support (French/English) — evaluate for V2
- Blog or content marketing section
- Wishlist functionality
- Product bundles or kits
- Loyalty/rewards program
- Automated email marketing (beyond transactional emails)
- Live chat or chatbot
- Integration with social media shops (Instagram, Facebook)
- Inventory management with supplier integration
- Advanced analytics (cohort analysis, customer LTV)
- Mobile app (native iOS/Android)

## Technical Architecture

### Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Nuxt 3 + Vue 3 + TypeScript | SSR application framework |
| Styling | Tailwind CSS v4 + shadcn-vue | Utility-first CSS + component library |
| State | Pinia | Client-side state management |
| Backend | Fastify 5 + Node.js + TypeScript | REST API server |
| Database | Supabase (PostgreSQL) | Primary data store |
| Auth | Supabase Auth | Customer and admin authentication |
| Storage | Supabase Storage | Images, assets, product photos |
| Payments | NotchPay API | Mobile money processing |
| Frontend Hosting | Vercel | Edge deployment, SSR |
| Backend Hosting | Railway | API server hosting |

### Key Architecture Decisions
- **SSR via Nuxt 3** — Critical for SEO (product pages must be indexable) and fast first-paint on mobile networks
- **Separate backend (Fastify)** — Keeps business logic, payment processing, and admin operations decoupled from the frontend; enables API-first design
- **Supabase** — Provides PostgreSQL, auth, storage, and real-time capabilities in one managed service; Row Level Security for data protection
- **NotchPay** — Purpose-built for Cameroonian mobile money; handles MTN MoMo and Orange Money with a single integration
- **Tailwind + shadcn-vue** — Rapid UI development with full design control; shadcn-vue components are customizable (not opaque like Vuetify)

## Design Direction

### Inspiration
- **Follow:** [Almaye](https://www.almaye.com) — editorial, premium, warm, generous whitespace, elegant typography, lifestyle imagery that elevates the product
- **Avoid:** [The Skincare Shop](https://theskincareshop.com) — cluttered, generic, mass-market e-commerce aesthetic

### Design Principles
1. **Brand-faithful** — All colors, fonts, and visual elements must come from the client's style guide. No off-brand colors.
2. **Mobile-first** — Design for smartphone screens first, then scale up. Most users will browse on mobile.
3. **Premium but approachable** — The design should feel luxurious without being intimidating. Skincare is personal.
4. **Photography-forward** — Let the product images and customer photos do the heavy lifting. The UI should frame, not compete.
5. **Fast and frictionless** — Minimize steps to purchase. Every extra tap is a potential drop-off.

### Key Pages
1. **Homepage** — Hero banner, featured/new products, category showcase, testimonials, brand story, Instagram-style customer photos
2. **Category/Collection pages** — Filtered product grids with sort options
3. **Product Detail Page** — Image gallery, variant selector, price, add-to-cart, description tabs (details, ingredients, how to use), reviews
4. **Cart** — Line items with quantity controls, discount code input, shipping estimate, order summary
5. **Checkout** — Multi-step or single-page: shipping address → shipping method → payment (mobile money) → confirmation
6. **Customer Account** — Order history, addresses, profile settings
7. **Testimonials/Gallery** — Curated customer photos and testimonials
8. **Admin Dashboard** — Product management, orders, promotions, reviews, analytics

## Success Criteria

| Metric | Target | Rationale |
|--------|--------|-----------|
| Page load (mobile, 3G) | < 3 seconds | Cameroonian mobile networks vary; fast load = lower bounce |
| Checkout completion rate | > 60% of cart initiators | Mobile money should remove payment friction |
| Mobile usability score | 95+ (Lighthouse) | Mobile-first audience |
| Admin task completion | Owner can manage products, orders, promotions independently | No developer dependency for daily operations |
| SEO | Product pages indexed within 2 weeks of launch | SSR + structured data |
| Uptime | 99.5%+ | Vercel + Railway managed infrastructure |

## Contact Information

- **Business:** Thia
- **Phone:** +237 670 076 224 / +237 676 328 226
- **Assets:** Brand colors, fonts, style guide, product photography, copy, and logos to be provided by client

## Vision

If Thia succeeds as a digital-first skincare brand in Cameroon, the platform can evolve to support:

- **Multi-language** (French + English) to reach all of Cameroon and expand to neighboring francophone markets
- **Content and education** — A skincare blog with routines, ingredient deep-dives, and brand storytelling
- **Community features** — Wishlists, skincare routine builders, loyalty/rewards programs
- **Regional expansion** — Shipping to neighboring countries (Nigeria, Gabon, Equatorial Guinea)
- **Social commerce** — Direct integration with Instagram and WhatsApp shopping
- **Subscription boxes** — Recurring shipments for replenishment products (moisturizers, cleansers)
- **Mobile app** — Native experience for the most engaged customers

The long-term play is to become the go-to online destination for premium skincare in Central and West Africa — not just a shop, but a brand that customers trust, recommend, and return to.
