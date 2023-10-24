import { fileURLToPath } from 'url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/scss/_main.scss'],
  modules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss',
  ],
  alias: {
    '@': fileURLToPath(new URL('./', import.meta.url)),
    '@components': fileURLToPath(new URL('./components', import.meta.url)),
  },
});
