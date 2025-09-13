// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
        || 'https://amadeus-api-fuatdkgxcsgydych.brazilsouth-01.azurewebsites.net/api'
    }
  }
})
