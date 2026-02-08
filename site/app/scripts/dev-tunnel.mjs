import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';
import { buildUrls, getBase, getHost, getPort } from './dev-utils.mjs';

const args = new Set(process.argv.slice(2));
const useLocaltunnel = args.has('--localtunnel') || args.has('--lt');

const host = getHost('0.0.0.0');
const port = getPort();
const base = getBase();
const { localUrl, networkUrl } = buildUrls({ host, port, base });

const log = (message) => console.log(`[tunnel] ${message}`);

const ensureBinary = (command, friendlyName) => {
  const result = spawnSync(command, ['--version'], { encoding: 'utf8', shell: true });
  if (result.status !== 0) {
    log(`${friendlyName} no está instalado o no está en PATH.`);
    return false;
  }
  return true;
};

const startDevServer = () => {
  log('iniciando servidor Astro (LAN).');
  const devProcess = spawn('astro', ['dev', '--host', host, '--port', port], {
    stdio: 'inherit',
    shell: true,
  });
  devProcess.on('exit', (code) => {
    process.exit(code ?? 0);
  });
};

const printUrls = () => {
  log(`Local   → ${localUrl}`);
  if (networkUrl) {
    log(`Network → ${networkUrl}`);
  }
};

const handleTunnelUrl = (url) => {
  if (!url) {
    return;
  }
  log(`Public  → ${url}`);
  log('Tip: copiá la URL en el celular o generá un QR con https://www.qr-code-generator.com/');
};

startDevServer();
printUrls();

if (useLocaltunnel) {
  log('levantando túnel con localtunnel.');
  const ltProcess = spawn(
    'npx',
    ['localtunnel', '--port', String(port)],
    { stdio: ['ignore', 'pipe', 'pipe'], shell: true },
  );

  ltProcess.stdout.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) {
      handleTunnelUrl(match[0]);
    }
    process.stdout.write(text);
  });

  ltProcess.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });
} else {
  if (!ensureBinary('cloudflared', 'cloudflared')) {
    log('Instalalo desde https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/');
    log('O ejecutá: npm run dev:tunnel:lt (usa localtunnel).');
    return;
  }

  log('levantando túnel con cloudflared.');
  const cfProcess = spawn(
    'cloudflared',
    ['tunnel', '--url', `http://localhost:${port}`],
    { stdio: ['ignore', 'pipe', 'pipe'], shell: true },
  );

  cfProcess.stdout.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) {
      handleTunnelUrl(match[0]);
    }
    process.stdout.write(text);
  });

  cfProcess.stderr.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) {
      handleTunnelUrl(match[0]);
    }
    process.stderr.write(text);
  });
}
