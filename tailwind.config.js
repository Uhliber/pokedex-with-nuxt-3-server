const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
export default {
    content: [],
    theme: {
      extend: {
        colors: {
          pokered: {
            DEFAULT: colors.red["500"],
            light: colors.red["300"],
            dark: colors.red["900"],
          },
          pokeblue: {
            DEFAULT: colors.sky["500"],
            light: colors.sky["300"],
            dark: colors.sky["900"],
          },
          pokeyellow: {
            DEFAULT: colors.yellow["500"],
            light: colors.yellow["300"],
            dark: colors.amber["700"],
          },
          pokegreen: {
            DEFAULT: colors.lime["500"],
            light: colors.lime["400"],
            dark: colors.lime["800"],
          },
          pokeblack: {
            DEFAULT: colors.stone["900"],
            light: colors.stone["600"],
            dark: colors.stone["800"],
          },
          pokebrown: {
            DEFAULT: colors.orange["700"],
            light: colors.orange["600"],
            dark: colors.orange["800"],
          },
          pokepurple: {
            DEFAULT: colors.purple["500"],
            light: colors.purple["300"],
            dark: colors.purple["900"],
          },
          pokegray: {
            DEFAULT: colors.neutral["500"],
            light: colors.neutral["300"],
            dark: colors.neutral["800"],
          },
          pokewhite: {
            DEFAULT: colors.slate["100"],
            light: colors.white,
            dark: colors.slate["400"],
          },
          pokepink: {
            DEFAULT: colors.pink["500"],
            light: colors.pink["300"],
            dark: colors.pink["900"],
          },
        },
        dropShadow: {
          light: '8px 8px rgba(226, 232, 240, 0.4)',
        }
      },
    },
    plugins: [],
  }
  