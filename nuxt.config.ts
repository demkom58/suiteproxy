// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    preset: "bun", 
    watchOptions: {
      ignored: ['**/accounts.sqlite*']
    },
    typescript: {
      tsConfig: {
        compilerOptions: {
          lib: ["ESNext", "DOM", "DOM.Iterable"]
        }
      }
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@primevue/nuxt-module',
    '@vueuse/nuxt'
  ],
  typescript: {
    strict: true,
    includeWorkspace: true,
    hoist: ['puppeteer', 'bun'],
    tsConfig: {
      compilerOptions: {
        lib: ['ESNext', 'DOM', 'DOM.Iterable']
      }
    }
  }
})
