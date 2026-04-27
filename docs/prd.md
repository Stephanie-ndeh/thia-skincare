# Product Requirements Document — Thia Skincare E-Commerce

**Author:** Big Steph
**Date:** 2026-03-24
**Status:** Draft
**Source:** [Product Brief](./project-brief.md)

---

## 1. Executive Summary

### 1.1 Vision

Thia is a direct-to-consumer skincare e-commerce platform purpose-built for the Cameroonian market. It replaces fragmented social-media-based selling with a cohesive, brand-forward digital storefront — mobile money payments first, location-based shipping, and full admin self-service for the business owner.

### 1.2 Differentiator

- **Cameroon-native commerce** — MTN MoMo and Orange Money via NotchPay, not credit-card-first with mobile money as afterthought
- **Brand expression, not template** — Client's style guide drives every pixel; editorial aesthetic inspired by Almaye, explicitly avoiding generic mass-market layouts
- **Owner independence** — Non-technical business owner manages catalog, orders, promotions, and content without developer support

### 1.3 Target Users

| User | Description | Primary Goal |
|------|-------------|-------------|
| **Guest** | Unauthenticated visitor browsing the storefront | Discover products, evaluate brand trustworthiness |
| **Shopper** | Registered customer with account | Purchase products, track orders, leave reviews |
| **Admin** | Business owner (the client) | Manage catalog, orders, promotions, content, and view analytics |

### 1.4 Product Scope Overview

| Phase | Focus | Outcome |
|-------|-------|---------|
| Phase 1 | Foundation | Project scaffolding, DB schema, auth, base layout, design system |
| Phase 2 | Product Catalog | Categories, products, variants, PDP, PLP, search |
| Phase 3 | Shopping & Payments | Cart, checkout, NotchPay integration, shipping calculator |
| Phase 4 | Customer Features | Accounts, order history, reviews, testimonials gallery |
| Phase 5 | Admin Panel | Product CRUD, order management, promotions, review moderation, analytics |
| Phase 6 | Polish & Launch | SEO, performance optimization, testing, deployment, monitoring |

---

## 2. Success Criteria

| ID | Metric | Target | Measurement |
|----|--------|--------|-------------|
| SC-1 | Mobile page load (3G) | < 3s first contentful paint | Lighthouse on throttled 3G |
| SC-2 | Checkout completion | > 60% of users who add to cart | Analytics funnel tracking |
| SC-3 | Mobile usability | 95+ Lighthouse score | Lighthouse mobile audit |
| SC-4 | Admin independence | Owner completes all daily tasks without developer | Task completion observation |
| SC-5 | SEO indexing | Product pages indexed within 14 days of launch | Google Search Console |
| SC-6 | Uptime | 99.5%+ | Vercel/Railway monitoring |
| SC-7 | Payment success rate | > 95% of initiated payments complete | NotchPay dashboard + internal logs |
| SC-8 | Core Web Vitals | Pass all CWV thresholds | PageSpeed Insights |

---

## 3. User Journeys

### 3.1 Guest User Journeys

**UJ-G1: Product Discovery**
Guest lands on homepage → views hero and featured products → browses by category → views product detail page → sees product images, description, ingredients, price, and reviews → decides to add to cart or continue browsing.

**UJ-G2: Brand Evaluation**
Guest arrives from social media link → views homepage brand story section → scrolls through customer testimonials and photos → browses product catalog → gains trust in brand legitimacy and product quality.

**UJ-G3: Search & Find**
Guest enters search term → views search results with product cards → filters or refines → navigates to product detail page.

### 3.2 Shopper Journeys

**UJ-S1: First Purchase**
Guest adds product to cart → prompted to create account or checkout as guest → enters shipping address (Cameroonian locality) → sees calculated shipping cost → applies discount code (optional) → selects MTN MoMo or Orange Money → completes payment via NotchPay → receives order confirmation with order number → can view order in account.

**UJ-S2: Repeat Purchase**
Shopper logs in → browses or searches products → adds to cart → checkout pre-fills saved address → selects payment → completes purchase → views updated order history.

**UJ-S3: Order Tracking**
Shopper logs in → navigates to order history → selects order → views order status (confirmed, processing, shipped, delivered) → sees shipping details.

**UJ-S4: Product Review**
Shopper receives order → logs in → navigates to purchased product or order history → submits star rating (1-5) and text review → review enters moderation queue → approved review appears on product page.

**UJ-S5: Account Management**
Shopper logs in → updates profile information → manages saved addresses → views complete order history → changes password.

### 3.3 Admin Journeys

**UJ-A1: Product Management**
Admin logs into admin panel → navigates to products → creates new product (name, description, ingredients, usage, category, images, price, variants with size/scent and individual pricing) → publishes product → product appears on storefront.

**UJ-A2: Order Fulfillment**
Admin views incoming orders dashboard → opens order details (items, quantities, variants, customer info, shipping address, payment status) → updates order status through fulfillment stages → customer sees updated status.

**UJ-A3: Promotion Campaign**
Admin creates discount code → sets type (percentage or fixed), value, start/end dates, usage limits → activates promotion → customers apply code at checkout → admin views promotion performance.

**UJ-A4: Content Curation**
Admin uploads customer photos and testimonials → writes testimonial text or approves submitted content → manages display order → content appears in testimonials section on storefront.

**UJ-A5: Review Moderation**
Admin views pending reviews → approves or rejects each review → approved reviews appear on product pages → admin can remove previously approved reviews.

**UJ-A6: Business Intelligence**
Admin views analytics dashboard → sees sales totals, order counts, top-selling products, revenue trends → uses data to inform inventory and marketing decisions.

---

## 4. Domain-Specific Requirements

### 4.1 E-Commerce Domain

| ID | Requirement |
|----|-------------|
| DR-1 | Payment processing via NotchPay handles MTN Mobile Money and Orange Money with webhook-based confirmation |
| DR-2 | Inventory counts decrement on confirmed order, not on cart addition |
| DR-3 | Shipping cost calculated per Cameroonian region/city at checkout, not flat rate |
| DR-4 | Discount codes validate against usage limits, expiration dates, and minimum order amounts before applying |
| DR-5 | Product prices stored and displayed in XAF (Central African CFA Franc) |
| DR-6 | Order numbers generated as unique, sequential, human-readable identifiers |

### 4.2 Cameroon Market Requirements

| ID | Requirement |
|----|-------------|
| CM-1 | Phone numbers accept Cameroonian format: 6XXXXXXXX (9 digits) with optional +237 prefix |
| CM-2 | Shipping address includes region and city fields mapped to Cameroon's 10 regions |
| CM-3 | Payment UI presents Mobile Money as primary option (MTN MoMo first, Orange Money second) |
| CM-4 | All monetary amounts formatted in XAF with no decimal places (CFA franc has no subdivisions) |
| CM-5 | Site operates in English for V1 (French language support deferred to V2) |

---

## 5. Functional Requirements by Phase

### Phase 1: Foundation

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-1.1 | Nuxt 3 project with TypeScript, Tailwind CSS v4, shadcn-vue, and Pinia initialized with SSR enabled | Must | SC-1, SC-8 |
| FR-1.2 | Fastify 5 API server with TypeScript, structured route modules, and CORS configured for frontend origin | Must | Architecture |
| FR-1.3 | Supabase project configured with PostgreSQL database, Auth, and Storage buckets | Must | Architecture |
| FR-1.4 | Database schema covering: users, products, categories, product_variants, product_images, orders, order_items, addresses, reviews, testimonials, discount_codes, shipping_zones | Must | All FRs |
| FR-1.5 | Row Level Security policies on all Supabase tables restricting data access by user role (customer, admin) | Must | Security |
| FR-1.6 | Customer registration via email/password through Supabase Auth with email confirmation | Must | UJ-S1 |
| FR-1.7 | Customer login returning session token, with 30-day session persistence | Must | UJ-S2 |
| FR-1.8 | Password reset via email link with 1-hour token expiration | Must | UJ-S5 |
| FR-1.9 | Admin authentication with role-based access control; admin role assigned via Supabase user metadata | Must | UJ-A1 |
| FR-1.10 | Base storefront layout: header (logo, navigation, cart icon with count, account link), footer (brand info, contact, social links, navigation), responsive mobile menu | Must | UJ-G1 |
| FR-1.11 | Design system tokens (colors, fonts, spacing) implemented from client's brand style guide in Tailwind config | Must | Design Direction |
| FR-1.12 | API error handling returns consistent JSON error format with HTTP status codes and human-readable messages | Must | Architecture |

### Phase 2: Product Catalog

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-2.1 | Homepage displays: hero banner (configurable image + CTA), featured products section (admin-selectable), category grid, customer testimonials carousel, brand story section | Must | UJ-G1, UJ-G2 |
| FR-2.2 | Category listing page displays all 9 categories with name, image, and product count | Must | UJ-G1 |
| FR-2.3 | Product listing page (PLP) displays products in a category as a responsive grid of product cards (image, name, price, category badge) | Must | UJ-G1 |
| FR-2.4 | PLP supports sort by: price (low-high, high-low), newest, name (A-Z) | Should | UJ-G1 |
| FR-2.5 | Product detail page (PDP) displays: image gallery (multiple images with thumbnail navigation), product name, price, variant selector (size/scent dropdowns), quantity selector, add-to-cart button, tabbed content (description, ingredients, how to use), customer reviews section | Must | UJ-G1 |
| FR-2.6 | Variant selection on PDP updates displayed price and available stock in real-time without page reload | Must | UJ-G1 |
| FR-2.7 | Product images served via Supabase Storage with responsive srcset for mobile/desktop optimization | Must | SC-1 |
| FR-2.8 | Search bar in header accepts text input and returns matching products by name, description, and category within 500ms | Must | UJ-G3 |
| FR-2.9 | Search results page displays matching products as filterable grid with result count | Must | UJ-G3 |
| FR-2.10 | Empty states displayed for: no products in category, no search results, no reviews on product | Must | UX |
| FR-2.11 | Product pages render server-side (SSR) with structured data (JSON-LD Product schema) for SEO | Must | SC-5 |
| FR-2.12 | Breadcrumb navigation on PDP and PLP showing: Home > Category > Product | Should | SC-5 |

### Phase 3: Shopping & Payments

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-3.1 | Shopping cart persists across sessions: localStorage for guests, database for authenticated shoppers | Must | UJ-S1 |
| FR-3.2 | Cart page displays line items with: product image, name, selected variant, unit price, quantity control (increment/decrement/remove), line total | Must | UJ-S1 |
| FR-3.3 | Cart displays running subtotal, shipping estimate (after address entry), discount (if applied), and order total in XAF | Must | UJ-S1 |
| FR-3.4 | Cart merges guest cart into authenticated cart upon login without losing items | Must | UJ-S1 |
| FR-3.5 | Discount code input field in cart validates code against backend and displays: applied discount amount, or specific error (expired, invalid, usage limit reached, minimum not met) | Must | UJ-S1, DR-4 |
| FR-3.6 | Checkout flow collects: shipping address (name, phone, region, city, address line), shipping method selection with calculated cost, payment method selection | Must | UJ-S1 |
| FR-3.7 | Shipping cost calculated based on customer's selected region/city using admin-configured shipping zone pricing | Must | DR-3, UJ-S1 |
| FR-3.8 | Payment options displayed: MTN Mobile Money and Orange Money, each with icon and label | Must | CM-3 |
| FR-3.9 | NotchPay payment initiation sends order total in XAF, customer phone number, and order reference; redirects to NotchPay payment flow or handles inline | Must | DR-1 |
| FR-3.10 | NotchPay webhook endpoint receives payment confirmation/failure callbacks, updates order payment status, and triggers order confirmation flow | Must | DR-1 |
| FR-3.11 | Order confirmation page displays: order number, items summary, shipping address, payment status, estimated delivery information | Must | UJ-S1 |
| FR-3.12 | Order confirmation email sent to customer with order details upon successful payment | Must | UJ-S1 |
| FR-3.13 | Failed payment displays clear error message and allows retry without re-entering order details | Must | SC-7 |
| FR-3.14 | Cart validates product availability and variant stock before checkout submission; displays specific error if item became unavailable | Must | DR-2 |
| FR-3.15 | Checkout accessible to both authenticated shoppers and guest users (guest must provide email for order tracking) | Should | UJ-S1 |

### Phase 4: Customer Features

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-4.1 | Customer account dashboard displays: recent orders, saved addresses, profile summary | Must | UJ-S5 |
| FR-4.2 | Order history page lists all customer orders with: order number, date, status, total, item count; sorted newest first | Must | UJ-S3 |
| FR-4.3 | Order detail page displays: all items with variants, quantities, prices; shipping address; payment method and status; order status timeline (confirmed → processing → shipped → delivered) | Must | UJ-S3 |
| FR-4.4 | Address book allows customer to save up to 5 shipping addresses and set a default | Should | UJ-S2 |
| FR-4.5 | Profile page allows editing: name, email, phone number with Cameroonian format validation | Must | UJ-S5 |
| FR-4.6 | Product review submission: star rating (1-5, required), text review (10-1000 characters, required); available only for products in completed orders | Must | UJ-S4 |
| FR-4.7 | Product review display on PDP: average star rating, total review count, individual reviews sorted newest first with reviewer name, date, rating, and text | Must | UJ-G1, UJ-S4 |
| FR-4.8 | Customer can submit one review per product per order; edit allowed within 48 hours of submission | Should | UJ-S4 |
| FR-4.9 | Testimonials gallery page displays: customer photos in responsive masonry/grid layout, customer name, testimonial text; curated by admin | Must | UJ-G2, UJ-A4 |
| FR-4.10 | Testimonials carousel on homepage shows 3-6 featured testimonials auto-rotating with manual navigation | Must | UJ-G2 |

### Phase 5: Admin Panel

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-5.1 | Admin panel accessible at /admin route, protected by admin role authentication; redirects non-admin users | Must | UJ-A1 |
| FR-5.2 | Admin dashboard homepage displays: today's orders count, today's revenue, total products, pending reviews count, recent orders list | Must | UJ-A6 |
| FR-5.3 | Product management: list all products with search, filter by category, and sort; view product details | Must | UJ-A1 |
| FR-5.4 | Product creation form: name, slug (auto-generated, editable), description (rich text), ingredients, usage instructions, category selection, featured flag, published/draft status | Must | UJ-A1 |
| FR-5.5 | Product variant management: add/edit/delete variants with SKU, size label, scent label, price in XAF, stock quantity; at least one variant required per product | Must | UJ-A1 |
| FR-5.6 | Product image management: upload multiple images (up to 10) via Supabase Storage, reorder via drag-and-drop, set primary image, delete images; accepts JPEG, PNG, WebP under 5MB | Must | UJ-A1 |
| FR-5.7 | Category management: create, edit, delete categories with name, slug, description, and image; prevent deletion of category with assigned products | Must | UJ-A1 |
| FR-5.8 | Order management: list all orders with filters (status, date range, payment status), search by order number or customer name | Must | UJ-A2 |
| FR-5.9 | Order detail view: customer info, items, shipping address, payment status, order timeline; admin can update order status (confirmed → processing → shipped → delivered → cancelled) with timestamp | Must | UJ-A2 |
| FR-5.10 | Discount code management: create codes with type (percentage/fixed), value, minimum order amount, usage limit, start/end dates, active/inactive toggle | Must | UJ-A3 |
| FR-5.11 | Discount code list displays: code, type, value, usage count vs limit, status, date range | Must | UJ-A3 |
| FR-5.12 | Review moderation: list pending reviews, view review with associated product and customer, approve or reject with one click | Must | UJ-A5 |
| FR-5.13 | Testimonial management: create/edit/delete testimonials with customer name, photo upload, testimonial text, display order, featured flag | Must | UJ-A4 |
| FR-5.14 | Customer list: view all registered customers with name, email, phone, order count, total spent; search by name or email | Should | UJ-A6 |
| FR-5.15 | Shipping zone management: create/edit zones by region and city with shipping cost in XAF; set default shipping cost for unlisted areas | Must | DR-3 |
| FR-5.16 | Homepage content management: update hero banner image and CTA link, select featured products (up to 8), select featured testimonials | Should | UJ-A4 |
| FR-5.17 | Analytics dashboard: sales chart (daily/weekly/monthly), top 10 products by revenue, orders by status breakdown, revenue by category | Should | UJ-A6 |

### Phase 6: Polish & Launch

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-6.1 | All pages generate appropriate meta tags (title, description, og:image) via Nuxt SSR head management | Must | SC-5 |
| FR-6.2 | XML sitemap generated automatically including all published product and category URLs | Must | SC-5 |
| FR-6.3 | robots.txt configured to allow search engine crawling of storefront, block admin routes | Must | SC-5 |
| FR-6.4 | Structured data (JSON-LD) on product pages: Product schema with name, price, currency (XAF), availability, reviews aggregate | Must | SC-5 |
| FR-6.5 | Image optimization pipeline: WebP conversion, responsive sizes, lazy loading below the fold | Must | SC-1 |
| FR-6.6 | Lighthouse performance score ≥ 90 on mobile with simulated 3G throttling | Must | SC-1, SC-8 |
| FR-6.7 | All interactive elements have minimum 44x44px touch targets for mobile usability | Must | SC-3 |
| FR-6.8 | 404 page with brand styling and navigation back to homepage and categories | Must | UX |
| FR-6.9 | Loading states (skeleton screens) on all data-fetching pages: PLP, PDP, cart, checkout, admin lists | Must | UX |
| FR-6.10 | Error boundary pages for API failures with retry option and fallback content | Must | UX |
| FR-6.11 | Frontend deployed to Vercel with production environment variables and custom domain | Must | SC-6 |
| FR-6.12 | Backend deployed to Railway with production environment variables, health check endpoint, and auto-restart | Must | SC-6 |
| FR-6.13 | HTTPS enforced on all routes; HTTP requests redirect to HTTPS | Must | Security |
| FR-6.14 | Rate limiting on authentication endpoints (max 5 attempts per minute per IP) and API endpoints (100 requests per minute per user) | Must | Security |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Measurement |
|----|-------------|-------------|
| NFR-1 | First Contentful Paint < 2s on 4G, < 3s on 3G mobile connections | Lighthouse with network throttling |
| NFR-2 | Time to Interactive < 4s on 4G mobile connections | Lighthouse with network throttling |
| NFR-3 | API response time < 300ms for 95th percentile under normal load (< 100 concurrent users) | Server-side APM logging |
| NFR-4 | Product image page weight < 500KB per page on initial load (lazy load remainder) | Lighthouse performance audit |
| NFR-5 | JavaScript bundle size < 200KB gzipped for initial page load | Build output analysis |
| NFR-6 | Database queries complete in < 100ms for 95th percentile with proper indexing | Supabase query logs |

### 6.2 SEO

| ID | Requirement | Measurement |
|----|-------------|-------------|
| NFR-7 | All product and category pages server-side rendered with complete HTML for crawler consumption | View page source verification |
| NFR-8 | Unique meta title (< 60 chars) and description (< 160 chars) on every page | SEO audit tool |
| NFR-9 | Canonical URLs on all pages preventing duplicate content | SEO audit tool |
| NFR-10 | Clean URL structure: /products/:slug, /categories/:slug, no query parameters for primary content | URL inspection |
| NFR-11 | Image alt text required on all product images | Automated accessibility audit |

### 6.3 Mobile-First

| ID | Requirement | Measurement |
|----|-------------|-------------|
| NFR-12 | All pages responsive from 320px to 1440px viewport width without horizontal scroll | Manual testing across breakpoints |
| NFR-13 | Touch targets minimum 44x44px with 8px minimum spacing between interactive elements | Lighthouse accessibility audit |
| NFR-14 | No hover-dependent functionality; all interactions accessible via touch | Manual mobile testing |
| NFR-15 | Form inputs use appropriate mobile keyboard types: tel for phone, email for email, numeric for quantities | Mobile device testing |
| NFR-16 | Mobile navigation (hamburger menu) opens/closes within 1 animation frame (< 300ms) | Performance profiling |

### 6.4 Security

| ID | Requirement | Measurement |
|----|-------------|-------------|
| NFR-17 | All API endpoints validate and sanitize input; no raw user input in database queries | Code review + automated scanning |
| NFR-18 | Authentication tokens stored in httpOnly cookies, not localStorage | Browser dev tools inspection |
| NFR-19 | CSRF protection on all state-changing endpoints | Security audit |
| NFR-20 | Admin routes protected by server-side role verification on every request, not client-side only | Penetration testing |
| NFR-21 | File uploads validated by MIME type and size (max 5MB) on both client and server | Upload testing |
| NFR-22 | NotchPay webhook signatures verified on every callback to prevent payment spoofing | Integration testing |

### 6.5 Reliability & Scalability

| ID | Requirement | Measurement |
|----|-------------|-------------|
| NFR-23 | System handles 100 concurrent users without degradation | Load testing |
| NFR-24 | Payment webhook processing is idempotent — duplicate callbacks do not create duplicate orders | Integration testing with repeated webhooks |
| NFR-25 | Database connections pooled; max 20 concurrent connections to Supabase | Supabase dashboard monitoring |
| NFR-26 | Static assets served via CDN (Vercel Edge Network) with cache headers ≥ 1 year for hashed assets | Response header inspection |

### 6.6 Accessibility

| ID | Requirement | Measurement |
|----|-------------|-------------|
| NFR-27 | WCAG 2.1 Level AA compliance on all storefront pages | Axe/Lighthouse accessibility audit |
| NFR-28 | Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text | Contrast checker tool |
| NFR-29 | All form fields have associated labels; all form errors announced to screen readers | Accessibility audit |
| NFR-30 | Keyboard navigation functional for all interactive elements with visible focus indicators | Manual keyboard testing |

---

## 7. Epics and User Stories

### Epic 1: Authentication & User Management

> Covers customer registration, login, password reset, and admin access control.
> **Phase:** 1 | **Traces to:** FR-1.6 through FR-1.9

---

**Story 1.1: Customer Registration**
*As a guest, I want to create an account with my email and password so that I can track orders and leave reviews.*

Acceptance Criteria:
- [ ] Registration form collects: name, email, phone (Cameroonian format), password (min 8 chars)
- [ ] Email format validated client-side and server-side
- [ ] Phone number accepts 6XXXXXXXX or +237 6XXXXXXXX format
- [ ] Duplicate email returns specific error: "An account with this email already exists"
- [ ] Confirmation email sent via Supabase Auth upon registration
- [ ] User redirected to "check your email" page after submission
- [ ] Account activated upon email confirmation click

---

**Story 1.2: Customer Login**
*As a shopper, I want to log in with my email and password so that I can access my account and order history.*

Acceptance Criteria:
- [ ] Login form accepts email and password
- [ ] Successful login redirects to previous page or account dashboard
- [ ] Invalid credentials display: "Email or password is incorrect" (no field-specific hint)
- [ ] Session persists for 30 days with Supabase session token
- [ ] Login state reflected in header (account icon replaces login link)

---

**Story 1.3: Password Reset**
*As a shopper, I want to reset my password via email if I forget it.*

Acceptance Criteria:
- [ ] "Forgot password" link on login page leads to reset form
- [ ] User enters email; reset link sent regardless of whether account exists (prevents enumeration)
- [ ] Reset link expires after 1 hour
- [ ] New password form enforces minimum 8 characters
- [ ] Successful reset redirects to login page with success message

---

**Story 1.4: Admin Login & Access Control**
*As the admin, I want to log in and access the admin panel so that I can manage the store.*

Acceptance Criteria:
- [ ] Admin logs in via same auth system with admin role in Supabase user metadata
- [ ] /admin routes return 403 redirect to storefront for non-admin users
- [ ] Admin session subject to same 30-day persistence
- [ ] Admin panel has separate layout from storefront (sidebar navigation)

---

**Story 1.5: Logout**
*As a shopper or admin, I want to log out so that my session is terminated.*

Acceptance Criteria:
- [ ] Logout clears session token and Supabase auth state
- [ ] User redirected to homepage after logout
- [ ] Cart preserved in localStorage after logout (guest cart behavior resumes)

---

### Epic 2: Product Catalog & Display

> Covers product browsing, categories, product detail, and search.
> **Phase:** 2 | **Traces to:** FR-2.1 through FR-2.12

---

**Story 2.1: Homepage Layout**
*As a guest, I want to see a compelling homepage that showcases the brand and its products so I can understand what Thia offers.*

Acceptance Criteria:
- [ ] Hero section displays configurable banner image with CTA button linking to a category or product
- [ ] Featured products section shows up to 8 admin-selected products in responsive grid
- [ ] Category showcase displays all 9 categories with image and name, linking to PLP
- [ ] Testimonials carousel shows 3-6 featured testimonials with auto-rotation and manual controls
- [ ] Brand story section with text and image content
- [ ] All sections render server-side for SEO

---

**Story 2.2: Category Listing Page**
*As a guest, I want to browse all product categories so I can find the type of product I need.*

Acceptance Criteria:
- [ ] Displays all 9 categories in responsive grid
- [ ] Each card shows: category image, category name, product count
- [ ] Click navigates to PLP filtered to that category
- [ ] Page URL: /categories

---

**Story 2.3: Product Listing Page (PLP)**
*As a guest, I want to view all products in a category so I can browse and compare options.*

Acceptance Criteria:
- [ ] URL: /categories/:slug displays products in that category
- [ ] Product cards show: primary image, name, starting price ("From X XAF" if variants differ), category badge
- [ ] Responsive grid: 2 columns mobile, 3 tablet, 4 desktop
- [ ] Sort options: price low-high, price high-low, newest, name A-Z
- [ ] Empty category displays: "No products in this category yet" with link to browse all
- [ ] Page title and meta description set per category for SEO

---

**Story 2.4: Product Detail Page (PDP)**
*As a guest, I want to view complete product information so I can make a purchase decision.*

Acceptance Criteria:
- [ ] URL: /products/:slug
- [ ] Image gallery: primary image large, thumbnails below/side; click thumbnail swaps main image; mobile swipe supported
- [ ] Product name, current price in XAF (updates with variant selection)
- [ ] Variant selectors: size dropdown (if applicable), scent dropdown (if applicable)
- [ ] Selecting a variant updates price and stock status without page reload
- [ ] Quantity selector with +/- buttons (min 1, max = available stock)
- [ ] Add to cart button (disabled with "Out of Stock" text when stock = 0)
- [ ] Tabbed content: Description, Ingredients, How to Use
- [ ] Reviews section below tabs (see Story 4.5)
- [ ] Breadcrumb: Home > Category Name > Product Name
- [ ] JSON-LD Product structured data in page head
- [ ] SSR rendered with full meta tags

---

**Story 2.5: Product Search**
*As a guest, I want to search for products by name or keyword so I can quickly find what I'm looking for.*

Acceptance Criteria:
- [ ] Search input in header with magnifying glass icon
- [ ] Typing triggers search after 300ms debounce (minimum 2 characters)
- [ ] Results page (/search?q=term) shows matching products in grid layout
- [ ] Search matches against product name, description, and category name
- [ ] Results return within 500ms
- [ ] No results state: "No products found for '[term]'" with suggestion to browse categories
- [ ] Result count displayed: "X products found"

---

### Epic 3: Shopping Cart

> Covers cart management, persistence, and discount code application.
> **Phase:** 3 | **Traces to:** FR-3.1 through FR-3.5

---

**Story 3.1: Add to Cart**
*As a guest or shopper, I want to add products to my cart so I can purchase them.*

Acceptance Criteria:
- [ ] Add to cart button on PDP adds selected variant and quantity to cart
- [ ] Cart icon in header updates count immediately
- [ ] Toast notification confirms: "[Product Name] added to cart"
- [ ] Adding same variant again increments quantity (does not create duplicate line)
- [ ] If requested quantity exceeds stock, displays: "Only X available"

---

**Story 3.2: View & Edit Cart**
*As a guest or shopper, I want to view and modify my cart before checkout.*

Acceptance Criteria:
- [ ] Cart page (/cart) lists all items with: product image (thumbnail), product name, variant details, unit price, quantity control, line total, remove button
- [ ] Quantity +/- buttons update line total and cart total in real-time
- [ ] Remove button removes item with confirmation
- [ ] Subtotal, shipping estimate, and total displayed in XAF
- [ ] "Continue Shopping" link returns to last browsed category or homepage
- [ ] "Proceed to Checkout" button (disabled if cart empty)
- [ ] Empty cart state: "Your cart is empty" with CTA to browse products

---

**Story 3.3: Cart Persistence**
*As a guest or shopper, I want my cart to persist so I don't lose items when I leave the site.*

Acceptance Criteria:
- [ ] Guest cart stored in localStorage, survives browser close/reopen
- [ ] Authenticated shopper cart stored in database
- [ ] On login, guest cart items merge into database cart (higher quantity wins on conflict)
- [ ] On logout, database cart remains saved; localStorage cart resumes

---

**Story 3.4: Apply Discount Code**
*As a shopper, I want to apply a discount code so I can save money on my order.*

Acceptance Criteria:
- [ ] Discount code input field on cart page with "Apply" button
- [ ] Valid code: displays discount name, amount deducted, updated total
- [ ] Invalid code: "This discount code is not valid"
- [ ] Expired code: "This discount code has expired"
- [ ] Used-up code: "This discount code has reached its usage limit"
- [ ] Below minimum: "Minimum order of X XAF required for this discount"
- [ ] Only one code per order; applying new code replaces previous
- [ ] "Remove" link next to applied discount to clear it

---

### Epic 4: Checkout & Payments

> Covers the checkout flow, shipping calculation, and NotchPay mobile money integration.
> **Phase:** 3 | **Traces to:** FR-3.6 through FR-3.15

---

**Story 4.1: Checkout — Shipping Information**
*As a shopper, I want to enter my shipping address so my order can be delivered.*

Acceptance Criteria:
- [ ] Checkout page (/checkout) step 1: shipping address form
- [ ] Fields: full name, phone number (Cameroonian format), region (dropdown of 10 Cameroon regions), city (dropdown filtered by selected region), address line (street/neighborhood), additional notes (optional)
- [ ] Authenticated shopper can select from saved addresses or enter new
- [ ] Guest checkout collects email address for order confirmation
- [ ] All fields validated before proceeding; inline error messages
- [ ] "Save this address" checkbox for authenticated shoppers

---

**Story 4.2: Checkout — Shipping Cost Calculation**
*As a shopper, I want to see the shipping cost for my location before paying.*

Acceptance Criteria:
- [ ] Shipping cost calculated after region and city selected
- [ ] Cost pulled from admin-configured shipping zones table
- [ ] If exact city not in zones, default regional rate applied
- [ ] Shipping cost displayed with breakdown: "Shipping to [City], [Region]: X XAF"
- [ ] Order total updates to include shipping
- [ ] Free shipping threshold configurable by admin (if applicable)

---

**Story 4.3: Checkout — Payment Selection**
*As a shopper, I want to select my mobile money provider and complete payment.*

Acceptance Criteria:
- [ ] Payment step shows two options: MTN Mobile Money (with MTN logo), Orange Money (with Orange logo)
- [ ] Selected method highlighted with radio button or card selection UI
- [ ] Phone number for payment pre-filled from profile or shipping info (editable)
- [ ] Order summary sidebar visible throughout checkout: items, subtotal, shipping, discount, total
- [ ] "Place Order" button initiates NotchPay payment flow

---

**Story 4.4: Payment Processing via NotchPay**
*As a shopper, I want my mobile money payment processed securely so my order is confirmed.*

Acceptance Criteria:
- [ ] Backend creates NotchPay payment intent with: amount (XAF), currency, customer phone, payment method (momo/om), order reference
- [ ] Customer receives mobile money payment prompt on their phone
- [ ] UI shows "Waiting for payment confirmation..." with spinner
- [ ] NotchPay webhook received on backend: validates signature, updates order status
- [ ] Successful payment: order status → "confirmed", redirect to confirmation page
- [ ] Failed payment: display "Payment failed. Please try again." with retry button
- [ ] Timeout after 5 minutes: display "Payment timed out" with retry option
- [ ] Webhook processing is idempotent (duplicate callbacks don't create duplicate orders)

---

**Story 4.5: Order Confirmation**
*As a shopper, I want confirmation that my order was placed successfully.*

Acceptance Criteria:
- [ ] Confirmation page displays: order number, items summary, shipping address, payment method, total paid
- [ ] "Thank you for your order" messaging with estimated delivery timeframe
- [ ] Confirmation email sent to customer with same order details
- [ ] "Continue Shopping" and "View Order" CTAs
- [ ] Cart cleared after successful order

---

### Epic 5: Customer Account & Order Tracking

> Covers customer dashboard, order history, address management, and profile.
> **Phase:** 4 | **Traces to:** FR-4.1 through FR-4.5

---

**Story 5.1: Customer Dashboard**
*As a shopper, I want a dashboard showing my account overview.*

Acceptance Criteria:
- [ ] Account page (/account) displays: welcome message with name, recent orders (last 3), quick links to order history, addresses, profile
- [ ] Protected route: redirects to login if unauthenticated

---

**Story 5.2: Order History**
*As a shopper, I want to view all my past orders.*

Acceptance Criteria:
- [ ] Order history page (/account/orders) lists all orders: order number, date, item count, total, status badge (color-coded)
- [ ] Sorted newest first
- [ ] Click opens order detail page
- [ ] Empty state: "You haven't placed any orders yet" with CTA to browse products

---

**Story 5.3: Order Detail**
*As a shopper, I want to view the details of a specific order.*

Acceptance Criteria:
- [ ] Order detail page (/account/orders/:id) shows: status timeline (confirmed → processing → shipped → delivered), all items with image, name, variant, quantity, price, shipping address, payment method, subtotal/shipping/discount/total breakdown
- [ ] Status timeline visually highlights current stage

---

**Story 5.4: Address Book**
*As a shopper, I want to save and manage shipping addresses.*

Acceptance Criteria:
- [ ] Address book page (/account/addresses) lists saved addresses (max 5)
- [ ] Each address shows: name, phone, full address, default badge
- [ ] Add new, edit, delete, set as default actions
- [ ] Default address pre-selected at checkout

---

**Story 5.5: Profile Management**
*As a shopper, I want to update my personal information.*

Acceptance Criteria:
- [ ] Profile page (/account/profile) shows editable: name, email (read-only), phone
- [ ] "Change Password" section: current password, new password, confirm new password
- [ ] Successful update shows success toast
- [ ] Phone validated in Cameroonian format

---

### Epic 6: Reviews & Social Proof

> Covers product reviews and the testimonials/customer photo gallery.
> **Phase:** 4 | **Traces to:** FR-4.6 through FR-4.10

---

**Story 6.1: Submit Product Review**
*As a shopper, I want to review a product I've purchased so others can benefit from my experience.*

Acceptance Criteria:
- [ ] "Write a Review" button on PDP visible only to authenticated shoppers who have a completed order containing that product
- [ ] Review form: star rating (1-5, clickable stars, required), text review (10-1000 chars, required)
- [ ] Submission enters moderation queue (not immediately visible)
- [ ] Success message: "Thank you! Your review is being processed."
- [ ] One review per product per order enforced
- [ ] Edit allowed within 48 hours of submission

---

**Story 6.2: Display Product Reviews**
*As a guest, I want to read product reviews to help me decide whether to purchase.*

Acceptance Criteria:
- [ ] Reviews section on PDP shows: average rating (stars + number), total review count, list of approved reviews
- [ ] Each review displays: reviewer first name + last initial, star rating, date, text
- [ ] Reviews sorted newest first
- [ ] "No reviews yet" state for products without reviews
- [ ] Reviews paginated (10 per page) if more than 10

---

**Story 6.3: Testimonials Gallery Page**
*As a guest, I want to see customer testimonials and photos to build trust in the brand.*

Acceptance Criteria:
- [ ] Gallery page (/testimonials) displays customer photos in responsive grid/masonry layout
- [ ] Each item shows: customer photo, customer name, testimonial text
- [ ] Content curated by admin (not user-submitted)
- [ ] Photos optimized and lazy loaded

---

### Epic 7: Admin — Product Management

> Covers product CRUD, variant management, category management, and image uploads.
> **Phase:** 5 | **Traces to:** FR-5.3 through FR-5.7

---

**Story 7.1: Product List & Search (Admin)**
*As admin, I want to view and search all products so I can manage the catalog.*

Acceptance Criteria:
- [ ] /admin/products displays paginated product table: image thumbnail, name, category, price range, stock total, status (published/draft), actions
- [ ] Search by product name
- [ ] Filter by category (dropdown), status (published/draft)
- [ ] Sort by name, date created, price
- [ ] "Add Product" button prominently placed

---

**Story 7.2: Create/Edit Product (Admin)**
*As admin, I want to create and edit products with all their details.*

Acceptance Criteria:
- [ ] Product form: name, slug (auto-generated from name, editable), category (dropdown), description (rich text editor), ingredients (text area), how to use (text area), featured toggle, published/draft toggle
- [ ] Slug uniqueness validated on save
- [ ] Form validates required fields before save
- [ ] Edit mode loads existing product data
- [ ] Save shows success toast; redirects to product list

---

**Story 7.3: Manage Product Variants (Admin)**
*As admin, I want to manage size and scent variants for each product.*

Acceptance Criteria:
- [ ] Variant section within product form
- [ ] Add variant: SKU (auto-generated, editable), size label, scent label, price in XAF, stock quantity
- [ ] At least one variant required to publish product
- [ ] Edit existing variants inline
- [ ] Delete variant with confirmation (blocked if variant has pending orders)
- [ ] Variant prices and stock independently managed

---

**Story 7.4: Manage Product Images (Admin)**
*As admin, I want to upload and organize product images.*

Acceptance Criteria:
- [ ] Image upload section within product form
- [ ] Upload up to 10 images per product; accepts JPEG, PNG, WebP ≤ 5MB
- [ ] Drag-and-drop reordering
- [ ] Set primary image (displayed as main image on PDP and product cards)
- [ ] Delete image with confirmation
- [ ] Images uploaded to Supabase Storage; URLs stored in database

---

**Story 7.5: Category Management (Admin)**
*As admin, I want to manage product categories.*

Acceptance Criteria:
- [ ] /admin/categories displays all categories with: image, name, slug, product count
- [ ] Create category: name, slug, description, image upload
- [ ] Edit category: all fields editable
- [ ] Delete category: blocked if products assigned, with error: "Remove X products from this category first"

---

### Epic 8: Admin — Order Management

> Covers order viewing, status updates, and fulfillment workflow.
> **Phase:** 5 | **Traces to:** FR-5.8, FR-5.9

---

**Story 8.1: Order Dashboard (Admin)**
*As admin, I want to see all orders and their current status.*

Acceptance Criteria:
- [ ] /admin/orders displays paginated order table: order number, customer name, date, item count, total, payment status, order status, actions
- [ ] Filter by order status, payment status, date range
- [ ] Search by order number or customer name
- [ ] Sort by date (newest first default), total
- [ ] New orders highlighted or badged

---

**Story 8.2: Order Detail & Status Update (Admin)**
*As admin, I want to view order details and update fulfillment status.*

Acceptance Criteria:
- [ ] Order detail view: customer info (name, email, phone), shipping address, payment method and status, order timeline, all items (product, variant, quantity, price), subtotal/shipping/discount/total
- [ ] Status update dropdown: confirmed → processing → shipped → delivered (forward-only progression)
- [ ] Cancel order option with confirmation (only for confirmed/processing orders)
- [ ] Status change logged with timestamp
- [ ] Status change reflected in customer's order tracking

---

### Epic 9: Admin — Promotions & Content

> Covers discount code management, testimonial curation, review moderation, and homepage content.
> **Phase:** 5 | **Traces to:** FR-5.10 through FR-5.16

---

**Story 9.1: Discount Code Management (Admin)**
*As admin, I want to create and manage discount codes for promotions.*

Acceptance Criteria:
- [ ] /admin/promotions lists all discount codes: code, type, value, usage/limit, dates, status
- [ ] Create code: code string (auto-generate option), type (percentage/fixed), value, minimum order (optional), usage limit (optional), start date, end date, active toggle
- [ ] Edit existing codes
- [ ] Deactivate code (soft disable, preserves history)
- [ ] Delete code only if never used

---

**Story 9.2: Review Moderation (Admin)**
*As admin, I want to moderate customer reviews before they appear on the site.*

Acceptance Criteria:
- [ ] /admin/reviews lists pending reviews with: product name, customer name, rating, text preview, date
- [ ] One-click approve or reject
- [ ] Tab/filter for: pending, approved, rejected
- [ ] Approved reviews appear on PDP immediately
- [ ] Admin can remove previously approved review

---

**Story 9.3: Testimonial Management (Admin)**
*As admin, I want to manage the customer testimonials section.*

Acceptance Criteria:
- [ ] /admin/testimonials lists all testimonials: photo thumbnail, customer name, text preview, featured flag, display order
- [ ] Create: customer name, photo upload, testimonial text, featured toggle
- [ ] Edit all fields; delete with confirmation
- [ ] Drag-and-drop to set display order
- [ ] Featured testimonials appear in homepage carousel

---

**Story 9.4: Homepage Content Management (Admin)**
*As admin, I want to control what appears on the homepage.*

Acceptance Criteria:
- [ ] /admin/homepage or settings section for: hero banner image upload + CTA link, featured products selection (multi-select from published products, max 8), featured testimonials selection
- [ ] Changes reflect on storefront immediately upon save

---

**Story 9.5: Shipping Zone Management (Admin)**
*As admin, I want to configure shipping costs by region and city.*

Acceptance Criteria:
- [ ] /admin/shipping displays shipping zones: region, city (or "All cities"), cost in XAF
- [ ] Create zone: select region, enter city (optional — blank = default for region), cost in XAF
- [ ] Edit and delete zones
- [ ] Default fallback cost for regions/cities not explicitly configured
- [ ] Changes affect new checkouts immediately

---

### Epic 10: Admin — Analytics

> Covers the admin analytics dashboard.
> **Phase:** 5 | **Traces to:** FR-5.17

---

**Story 10.1: Sales Analytics Dashboard (Admin)**
*As admin, I want to see key business metrics to inform decisions.*

Acceptance Criteria:
- [ ] /admin/analytics displays: total revenue (today, this week, this month, all time), total orders with same time periods, average order value
- [ ] Sales chart: line/bar chart showing revenue over time (daily for last 30 days, weekly for last 12 weeks, monthly for last 12 months — toggle between views)
- [ ] Top 10 products by revenue (name, units sold, revenue)
- [ ] Orders by status pie/bar chart
- [ ] Revenue by category breakdown
- [ ] Data loads within 2 seconds

---

### Epic 11: SEO, Performance & Launch Readiness

> Covers SEO optimization, performance tuning, error handling, and deployment.
> **Phase:** 6 | **Traces to:** FR-6.1 through FR-6.14

---

**Story 11.1: SEO Meta & Structured Data**
*As a search engine crawler, product and category pages must have complete metadata for indexing.*

Acceptance Criteria:
- [ ] Every page has unique <title> and <meta description>
- [ ] Product pages include JSON-LD Product schema: name, description, image, price, priceCurrency (XAF), availability, aggregateRating
- [ ] Category pages include JSON-LD CollectionPage schema
- [ ] Open Graph tags (og:title, og:description, og:image) on all pages
- [ ] Canonical URL tag on every page

---

**Story 11.2: Sitemap & Crawl Configuration**
*As a search engine, I need a sitemap and robots.txt to discover and index pages.*

Acceptance Criteria:
- [ ] XML sitemap at /sitemap.xml auto-generated, includes all published products and categories
- [ ] Sitemap updates when products are published/unpublished
- [ ] robots.txt allows crawling of storefront, blocks /admin, /checkout, /account
- [ ] Sitemap referenced in robots.txt

---

**Story 11.3: Image Optimization**
*As a mobile user on a slow connection, images must load quickly.*

Acceptance Criteria:
- [ ] Product images served in WebP format with JPEG fallback
- [ ] Responsive srcset with sizes: 320w, 640w, 960w, 1280w
- [ ] Lazy loading on all images below the fold (native loading="lazy")
- [ ] Blur-up placeholder or skeleton while images load
- [ ] Total image payload per PLP page < 500KB on initial load

---

**Story 11.4: Loading & Error States**
*As a user, I want clear feedback when content is loading or errors occur.*

Acceptance Criteria:
- [ ] Skeleton loading states on PLP, PDP, cart, checkout, and all admin list pages
- [ ] API error responses display user-friendly message (not raw error)
- [ ] 404 page with brand styling: "Page not found" + navigation to home and categories
- [ ] Network error state: "Something went wrong. Please try again." with retry button
- [ ] Payment error states as specified in Story 4.4

---

**Story 11.5: Production Deployment**
*As the team, we need the application deployed and accessible on the production domain.*

Acceptance Criteria:
- [ ] Frontend deployed to Vercel with custom domain, HTTPS, environment variables
- [ ] Backend deployed to Railway with environment variables, health check at /health, auto-restart on crash
- [ ] Supabase project in production mode with RLS enabled on all tables
- [ ] NotchPay configured with production API keys
- [ ] HTTP → HTTPS redirect enforced
- [ ] Rate limiting active on auth (5/min/IP) and API (100/min/user) endpoints

---

## 8. Phase-Story Mapping

| Phase | Epics | Stories |
|-------|-------|---------|
| **Phase 1: Foundation** | Epic 1 | 1.1, 1.2, 1.3, 1.4, 1.5 |
| **Phase 2: Product Catalog** | Epic 2 | 2.1, 2.2, 2.3, 2.4, 2.5 |
| **Phase 3: Shopping & Payments** | Epic 3, Epic 4 | 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5 |
| **Phase 4: Customer Features** | Epic 5, Epic 6 | 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3 |
| **Phase 5: Admin Panel** | Epic 7, Epic 8, Epic 9, Epic 10 | 7.1–7.5, 8.1, 8.2, 9.1–9.5, 10.1 |
| **Phase 6: Polish & Launch** | Epic 11 | 11.1, 11.2, 11.3, 11.4, 11.5 |

---

## 9. Assumptions & Dependencies

### Assumptions
- Client provides all brand assets (style guide, colors, fonts, logos, product photography, copy) before Phase 2 begins
- Client provides complete product data (names, descriptions, ingredients, usage instructions, prices, variant details) before Phase 2 begins
- Client provides shipping zone pricing (cost per region/city) before Phase 3 begins
- NotchPay API supports both MTN MoMo and Orange Money for Cameroon
- Supabase free/pro tier sufficient for initial launch traffic (< 100 concurrent users)
- Single admin user for V1 (the business owner); multi-admin deferred

### Dependencies
- **NotchPay API** — Payment processing; requires approved merchant account and API keys
- **Supabase** — Database, auth, and storage; requires project setup and configuration
- **Vercel** — Frontend hosting; requires account and domain configuration
- **Railway** — Backend hosting; requires account and project setup
- **Client brand assets** — Design implementation blocked until style guide received
- **Client product data** — Catalog seeding blocked until product information received

---

## 10. Out of Scope (V1)

Explicitly excluded from this release to maintain focus:

- Multi-language support (French/English)
- Blog or content marketing
- Wishlist functionality
- Product bundles or kits
- Loyalty/rewards program
- Automated email marketing (beyond transactional)
- Live chat or chatbot
- Social media shop integration
- Supplier/inventory integration
- Advanced analytics (cohorts, LTV)
- Native mobile app
- Multi-admin with granular permissions
- Guest checkout without email
- International shipping
- Multiple currencies

---

## 11. Traceability Matrix

| Vision Goal | Success Criteria | User Journeys | Key FRs | Key NFRs |
|-------------|-----------------|---------------|---------|----------|
| Mobile-first Cameroon commerce | SC-1, SC-3 | UJ-G1, UJ-S1 | FR-2.7, FR-3.8 | NFR-1, NFR-12–16 |
| Mobile money payments | SC-7 | UJ-S1 | FR-3.8–3.13 | NFR-22, NFR-24 |
| Brand-forward experience | SC-3 | UJ-G1, UJ-G2 | FR-1.11, FR-2.1 | NFR-27–30 |
| Owner independence | SC-4 | UJ-A1–A6 | FR-5.1–5.17 | — |
| SEO discoverability | SC-5, SC-8 | UJ-G1 | FR-2.11, FR-6.1–6.4 | NFR-7–11 |
| Fast performance | SC-1, SC-8 | All | FR-6.5, FR-6.6 | NFR-1–6 |
| Social proof & trust | SC-2 | UJ-G2, UJ-S4 | FR-4.6–4.10 | — |
| Location-based shipping | SC-2 | UJ-S1 | FR-3.7, FR-5.15 | — |
