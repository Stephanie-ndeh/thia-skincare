import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  ssr: true,

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    'shadcn-nuxt',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
  ],

  image: {
    domains: ['fudrvtugylvtnplykczs.supabase.co'],
  },

  css: ['~/assets/css/main.css'],

  build: {
    transpile: ['@thia/shared'],
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@thia/shared': resolve(__dirname, '../../packages/shared/index.ts'),
      },
    },
  },

  components: {
    dirs: [
      { path: '~/components', extensions: ['vue'], pathPrefix: false },
    ],
  },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#2C2C2A' },
        { property: 'og:site_name', content: 'Thia' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_CM' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@thia_cm' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: '',  // overridden by NUXT_PUBLIC_API_BASE_URL
      siteUrl: '',     // overridden by NUXT_PUBLIC_SITE_URL
    },
  },

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
  },

  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/*'],
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  i18n: {
    restructureDir: '',
    locales: [
      { code: 'en', name: 'English', language: 'en-CM', file: 'en.json' },
      { code: 'fr', name: 'Français', language: 'fr-CM', file: 'fr.json' },
    ],
    defaultLocale: 'en',
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'thia-locale',
      redirectOn: 'root',
    },
  },

  sitemap: {
    exclude: ['/admin/**', '/account/**', '/cart', '/checkout', '/auth/**'],
    urls: async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NUXT_PUBLIC_SUPABASE_URL ?? ''
      const supabaseKey = process.env.SUPABASE_KEY ?? process.env.NUXT_PUBLIC_SUPABASE_KEY ?? ''
      if (!supabaseUrl || !supabaseKey) return []
      const supabase = createClient(supabaseUrl, supabaseKey)
      const [{ data: categories }, { data: products }] = await Promise.all([
        supabase.from('categories').select('slug'),
        supabase.from('products').select('slug').eq('is_published', true),
      ])
      return [
        '/',
        '/categories',
        '/about',
        '/faq',
        '/contact',
        ...(categories ?? []).map((c: { slug: string }) => `/categories/${c.slug}`),
        ...(products ?? []).map((p: { slug: string }) => `/products/${p.slug}`),
      ]
    },
  },
})
