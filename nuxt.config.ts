// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync } from 'node:fs'
const isDocker = !!process.env.DOCKER || !!process.env.container || existsSync('/.dockerenv')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: !!process.env.NUXT_DEVTOOLS },

  // ── Nitro (server) ───────────────────────────────────────────────────
  nitro: {
    preset: 'bun',
    watchOptions: {
      ignored: ['**/accounts.sqlite*'],
    },
    typescript: {
      tsConfig: {
        compilerOptions: {
          lib: ['ESNext', 'DOM', 'DOM.Iterable'],
        },
      },
    },
  },

  // ── Vite ─────────────────────────────────────────────────────────────
  vite: {
    cacheDir: '.nuxt/.vite',

    optimizeDeps: {
      include: ['vue', 'vue-router'],
    },

    server: {
      ...(isDocker && {
        watch: {
          usePolling: true,
          interval: 2000,
        },
      }),
    },
  },

  // ── Modules ──────────────────────────────
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
  ],

  // ── TypeScript ───────────────────────────────────────────────────────
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        lib: ['ESNext', 'DOM', 'DOM.Iterable'],
      },
      exclude: ['../data/**'],
    },
  },
})
