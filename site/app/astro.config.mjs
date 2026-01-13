// @ts-check
import { defineConfig } from 'astro/config';

const isProd = import.meta.env.PROD;

// https://astro.build/config
export default defineConfig({
  site: isProd ? 'https://dominio.com/consultora/' : 'http://localhost:4321/consultora/',
  base: '/consultora',
});
