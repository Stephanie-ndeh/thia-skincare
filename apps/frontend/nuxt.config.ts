import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },

  ssr: true,

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    'shadcn-nuxt',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
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
})
