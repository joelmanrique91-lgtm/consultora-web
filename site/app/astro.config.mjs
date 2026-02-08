// @ts-check
import { defineConfig } from 'astro/config';

const isProd = import.meta.env.PROD;
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '4321';

const normalizeBase = (value) => {
  if (!value || value === '/') {
    return '/';
  }

  const trimmed = value.replace(/\/+$/g, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const base = normalizeBase(process.env.PUBLIC_BASE_PATH ?? (isProd ? '/consultora' : '/'));
const baseSuffix = base === '/' ? '/' : `${base}/`;
const defaultSite = isProd
  ? `https://dominio.com${baseSuffix}`
  : `http://${host}:${port}${baseSuffix}`;
const site = process.env.PUBLIC_SITE_URL ?? defaultSite;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  vite: {
    server: {
      allowedHosts: ['.trycloudflare.com'],
    },
  },
});
