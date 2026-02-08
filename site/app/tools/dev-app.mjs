import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';
import { buildUrls, getBase, getHost, getPort } from '../scripts/dev-utils.mjs';

const args = new Set(process.argv.slice(2));
const shouldOpen = args.has('--open');
const disableTunnel = args.has('--no-tunnel');
const useLocaltunnel = args.has('--localtunnel') || args.has('--lt');

const host = getHost('0.0.0.0');
const port = getPort();
const base = getBase();
const { localUrl, networkUrl } = buildUrls({ host, port, base });

const log = (message) => console.log(`[app] ${message}`);

const ensureBinary = (command, friendlyName) => {
  const result = spawnSync(command, ['--version'], { encoding: 'utf8', shell: true });
  if (result.status !== 0) {
    log(`${friendlyName} no está instalado o no está en PATH.`);
    return false;
  }
  return true;
};

log('Starting dev server...');
const devArgs = ['dev', '--host', host, '--port', port];
if (shouldOpen) {
  devArgs.push('--open');
}
const devProcess = spawn('astro', devArgs, { stdio: 'inherit', shell: true });

log(`Local URL: ${localUrl}`);
if (networkUrl) {
  log(`Network URL: ${networkUrl}`);
}

const handleTunnelUrl = (url) => {
  if (!url) {
    return;
  }
  log(`Public URL: ${url}`);
  log('Tip: copiá la URL en el celular o generá un QR con https://www.qr-code-generator.com/');
};

if (!disableTunnel) {
  if (useLocaltunnel) {
    log('Starting tunnel (localtunnel)...');
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
  } else if (ensureBinary('cloudflared', 'cloudflared')) {
    log('Starting tunnel (cloudflared)...');
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
  } else {
    log('No se pudo iniciar el túnel. Instalá cloudflared o usá --localtunnel.');
  }
} else {
  log('Public tunnel disabled (--no-tunnel).');
}

devProcess.on('exit', (code) => {
  process.exit(code ?? 0);
});
