# Thia Deployment Guide

## Architecture
- Frontend: Vercel (free tier)
- Backend: Render.com (free tier)
- Database: Supabase (already live)
- Storage: Supabase Storage (already live)

---

## Step 1 — Deploy Backend to Render.com

1. Go to https://render.com and sign up (free)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `thia-api`
   - **Root Directory:** `apps/backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Add Environment Variables from `apps/backend/.env.production.example`
6. Click **Create Web Service**
7. Wait for deployment (~5 minutes)
8. Copy your URL: `https://thia-api.onrender.com`

> **Note:** Free tier Web Services on Render spin down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds. Upgrade to Starter ($7/month) when the client goes live for always-on performance.

---

## Step 2 — Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up (free)
2. Click **New Project** → Import from GitHub
3. Select your repository
4. Configure:
   - **Framework Preset:** Nuxt.js
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.output/public`
5. Add Environment Variables from `apps/frontend/.env.production.example`:
   ```
   NUXT_PUBLIC_SUPABASE_URL=https://fudrvtugylvtnplykczs.supabase.co
   NUXT_PUBLIC_SUPABASE_KEY=your-anon-key
   NUXT_PUBLIC_API_BASE_URL=https://thia-api.onrender.com
   NUXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   NUXT_PUBLIC_APP_NAME=Thia
   ```
6. Click **Deploy**
7. Wait for deployment (~3 minutes)
8. Copy your URL: `https://thia.vercel.app`

---

## Step 3 — Update CORS on Backend

After Vercel deployment, go to Render → Environment → update:
```
FRONTEND_URL=https://thia.vercel.app
```
Trigger a manual redeploy on Render.

---

## Step 4 — Update Supabase Auth Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   https://thia.vercel.app/**
   ```
4. Set **Site URL** to: `https://thia.vercel.app`

---

## Step 5 — Update NotchPay Webhook URL

In the NotchPay dashboard, update the webhook URL from your ngrok URL to:
```
https://thia-api.onrender.com/payments/webhook
```

---

## Step 6 — Smoke Test Production

After deployment, verify each item:

- [ ] `https://thia.vercel.app` — homepage loads
- [ ] `https://thia.vercel.app/categories` — categories display
- [ ] `https://thia.vercel.app/products/[slug]` — product page loads
- [ ] `https://thia.vercel.app/auth/login` — login page renders
- [ ] `https://thia-api.onrender.com/health` — returns `{ status: "ok", timestamp: "...", environment: "production" }`
- [ ] Login / register works on production
- [ ] Add to cart works and persists
- [ ] Admin panel accessible at `/admin`
- [ ] Images load from Supabase Storage

---

## Adding a Custom Domain (when ready)

### Vercel (frontend):
1. Dashboard → Project → **Settings** → **Domains**
2. Add domain: `thia.cm`
3. Update DNS at your registrar:
   - `A` record: `76.76.21.21`
   - `CNAME www`: `cname.vercel-dns.com`

### After domain is live:
- Update Vercel env var: `NUXT_PUBLIC_SITE_URL=https://thia.cm`
- Update Render env var: `FRONTEND_URL=https://thia.cm`
- Add `https://thia.cm/**` to Supabase Redirect URLs

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Vercel (frontend) | Free | $0/month |
| Render.com (backend) | Free | $0/month |
| Supabase (database + storage) | Free tier | $0/month |
| **Total** | | **$0/month** |

### When the client is ready to go live:
Upgrade Render to **Starter ($7/month)** for:
- Always-on (no cold-start sleep)
- Better performance
- Custom domain SSL auto-provisioned
