import { spawn } from 'node:child_process';

const defaultHost = 'localhost';
const defaultPort = '4321';
const defaultBase = '/';

const host = process.env.HOST || defaultHost;
const port = process.env.PORT || defaultPort;
const basePath = process.env.PUBLIC_BASE_PATH || defaultBase;
const shouldOpen = process.argv.includes('--open');

const normalizeBase = (value) => {
  if (!value || value === '/') {
    return '/';
  }

  const trimmed = value.replace(/\/+$/g, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const normalizedBase = normalizeBase(basePath);
const displayHost = host === '0.0.0.0' ? defaultHost : host;
const displayPath = normalizedBase === '/' ? '/' : `${normalizedBase}/`;
const url = `http://${displayHost}:${port}${displayPath}`;

console.log(`\n[dev] URL: ${url}\n`);

const args = ['dev', '--host', host, '--port', port];
if (shouldOpen) {
  args.push('--open');
}

const devProcess = spawn('astro', args, { stdio: 'inherit', shell: true });
devProcess.on('exit', (code) => {
  process.exit(code ?? 0);
});
