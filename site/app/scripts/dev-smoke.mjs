import { execFileSync } from 'node:child_process';

const normalizeBase = (value) => {
  if (!value || value === '/') {
    return '';
  }

  const trimmed = value.replace(/^\/+|\/+$/g, '');
  return `/${trimmed}`;
};

const basePath = normalizeBase(process.env.PUBLIC_BASE_PATH ?? '/consultora');
const port = process.env.PORT ?? '4321';
const host = process.env.SMOKE_HOST ?? '127.0.0.1';
const baseUrl = `http://${host}:${port}${basePath}`;

const routes = ['/', '/servicios', '/sobre', '/posts'];

let hasError = false;

const runCurl = (url) => {
  try {
    const status = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '-I', url], {
      encoding: 'utf8',
    }).trim();

    const ok = status.startsWith('2') || status.startsWith('3');
    if (!ok) {
      hasError = true;
      console.error(`[dev:smoke] ${url} -> ${status}`);
    } else {
      console.log(`[dev:smoke] ${url} -> ${status}`);
    }
  } catch (error) {
    hasError = true;
    console.error(`[dev:smoke] ${url} -> error`, error);
  }
};

routes.forEach((route) => {
  const url = route === '/' ? baseUrl : `${baseUrl}${route}`;
  runCurl(url);
});

if (hasError) {
  process.exitCode = 1;
}
