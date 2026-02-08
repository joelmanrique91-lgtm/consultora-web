import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { buildUrls, getBase, getHost, getPort } from './dev-utils.mjs';

const args = new Set(process.argv.slice(2));
const useLocaltunnel = args.has('--localtunnel') || args.has('--lt');
const skipDevServer = args.has('--no-dev');

const host = getHost('0.0.0.0');
const port = getPort();
const base = getBase();
const { localUrl, networkUrl } = buildUrls({ host, port, base });

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const devScript = path.join(appRoot, 'scripts', 'dev.mjs');

const isWin = process.platform === 'win32';
const NPX = isWin ? 'npx.cmd' : 'npx';

const log = (message) => console.log(`[tunnel] ${message}`);

const assertFileExists = (filePath, friendlyName) => {
  if (!fs.existsSync(filePath)) {
    log(`ERROR: no se encontró ${friendlyName}.`);
    log(`Path: ${filePath}`);
    log(`CWD : ${appRoot}`);
    process.exit(1);
  }
};

const ensureBinary = (command, friendlyName) => {
  // En Windows, algunos binarios se resuelven mejor con .cmd/.exe, pero cloudflared suele funcionar.
  const result = spawnSync(command, ['--version'], { encoding: 'utf8', shell: false });
  if (result.error) {
    log(`${friendlyName} no está instalado o no está en PATH.`);
    log(`Detalle: ${result.error.message}`);
    return false;
  }
  if (result.status !== 0) {
    log(`${friendlyName} no respondió correctamente (--version).`);
    if (result.stderr) process.stderr.write(result.stderr);
    return false;
  }
  return true;
};

const startDevServer = () => {
  log('iniciando servidor Astro (LAN).');

  assertFileExists(devScript, 'scripts/dev.mjs');

  // Usar Node actual + script, Windows-safe
  const command = process.execPath;
  const spawnArgs = [devScript, '--lan'];

  const devProcess = spawn(command, spawnArgs, {
    cwd: appRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false,
    shell: false,
  });

  devProcess.on('error', (error) => {
    log('ERROR spawn al iniciar el dev server.');
    console.error(error);
    log(`command: ${command}`);
    log(`args: ${spawnArgs.join(' ')}`);
    log(`cwd: ${appRoot}`);
    // No seguir, porque sin server el túnel no sirve.
    process.exit(1);
  });

  devProcess.stdout.on('data', (data) => process.stdout.write(data.toString()));
  devProcess.stderr.on('data', (data) => process.stderr.write(data.toString()));

  // IMPORTANTE: NO hacer process.exit() acá porque mata el túnel.
  // Solo loguear.
  devProcess.on('exit', (code) => {
    log(`dev server terminó (code=${code ?? 0}).`);
  });

  return devProcess;
};

const printUrls = () => {
  log(`Local   → ${localUrl}`);
  if (networkUrl) log(`Network → ${networkUrl}`);
};

const handleTunnelUrl = (url) => {
  if (!url) return;
  log(`Public  → ${url}`);
  log('Tip: compartí esta URL. Si querés QR, pegala en cualquier generador de QR.');
};

let devProcess = null;

if (!skipDevServer) {
  devProcess = startDevServer();
  printUrls();
}

// Cleanup limpio al cerrar
const cleanup = () => {
  try {
    if (devProcess && !devProcess.killed) devProcess.kill();
  } catch {}
};
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

if (useLocaltunnel) {
  log('levantando túnel con localtunnel (via npx).');

  const ltProcess = spawn(
    NPX,
    ['localtunnel', '--port', String(port)],
    { stdio: ['ignore', 'pipe', 'pipe'], cwd: appRoot, shell: false, windowsHide: false },
  );

  ltProcess.on('error', (error) => {
    log('ERROR spawn al iniciar localtunnel.');
    console.error(error);
    log(`command: ${NPX}`);
    log(`args: ${['localtunnel', '--port', String(port)].join(' ')}`);
    log(`cwd: ${appRoot}`);
    process.exit(1);
  });

  ltProcess.stdout.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) handleTunnelUrl(match[0]);
    process.stdout.write(text);
  });

  ltProcess.stderr.on('data', (data) => process.stderr.write(data.toString()));
} else {
  if (!ensureBinary('cloudflared', 'cloudflared')) {
    log('Instalalo y reintentá.');
    log('O ejecutá: npm run dev:tunnel:lt (usa localtunnel).');
    // En ESM no se puede return top-level
    process.exit(1);
  }

  log('levantando túnel con cloudflared.');

  const cfProcess = spawn(
    'cloudflared',
    ['tunnel', '--url', `http://localhost:${port}`],
    { stdio: ['ignore', 'pipe', 'pipe'], cwd: appRoot, shell: false, windowsHide: false },
  );

  cfProcess.on('error', (error) => {
    log('ERROR spawn al iniciar cloudflared.');
    console.error(error);
    log('command: cloudflared');
    log(`args: ${['tunnel', '--url', `http://localhost:${port}`].join(' ')}`);
    log(`cwd: ${appRoot}`);
    process.exit(1);
  });

  const onText = (text) => {
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) handleTunnelUrl(match[0]);
  };

  cfProcess.stdout.on('data', (data) => {
    const text = data.toString();
    onText(text);
    process.stdout.write(text);
  });

  cfProcess.stderr.on('data', (data) => {
    const text = data.toString();
    onText(text);
    process.stderr.write(text);
  });
}
