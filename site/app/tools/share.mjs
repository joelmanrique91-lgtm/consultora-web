import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { buildUrls, getBase, getHost, getPort, resolveBin } from '../scripts/dev-utils.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const astroBin = resolveBin('astro', appRoot);

const host = getHost('0.0.0.0');
const port = getPort();
const base = getBase();
const { localUrl } = buildUrls({ host, port, base });

const log = (message) => console.log(`[share] ${message}`);
const warn = (message) => console.warn(`[share] ⚠️ ${message}`);

const ensureBinary = (command, args = ['--version']) => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return result.status === 0;
};

const waitForServer = async (url, timeoutMs = 20000) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok || response.status === 404) {
        return true;
      }
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return false;
};

const copyToClipboard = (text) => {
  const platform = process.platform;
  if (platform === 'win32') {
    const escaped = text.replace(/'/g, "''");
    const result = spawnSync('powershell', [
      '-NoProfile',
      '-Command',
      `Set-Clipboard '${escaped}'`,
    ]);
    return result.status === 0;
  }
  if (platform === 'darwin') {
    const result = spawnSync('pbcopy', [], { input: text });
    return result.status === 0;
  }
  const xclip = spawnSync('xclip', ['-selection', 'clipboard'], { input: text });
  if (xclip.status === 0) {
    return true;
  }
  const xsel = spawnSync('xsel', ['--clipboard', '--input'], { input: text });
  return xsel.status === 0;
};

const extractUrl = (text, pattern) => {
  const match = text.match(pattern);
  return match ? match[0] : null;
};

let devProcess;
let tunnelProcess;
let shareReady = false;

const killProcess = (proc) => {
  if (!proc || proc.killed) {
    return;
  }
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(proc.pid), '/t', '/f']);
  } else {
    proc.kill('SIGTERM');
  }
};

const shutdown = () => {
  log('cerrando procesos...');
  killProcess(tunnelProcess);
  killProcess(devProcess);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

log('levantando servidor Astro...');
devProcess = spawn(astroBin, ['dev', '--host', host, '--port', port], { stdio: 'inherit' });

const isReady = await waitForServer(localUrl);
if (!isReady) {
  warn(`no se pudo confirmar el servidor en ${localUrl}`);
}

const startCloudflared = () => {
  log('iniciando túnel con cloudflared...');
  tunnelProcess = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return tunnelProcess;
};

const startNgrok = () => {
  log('iniciando túnel con ngrok...');
  tunnelProcess = spawn('ngrok', ['http', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return tunnelProcess;
};

const cloudflaredAvailable = ensureBinary('cloudflared', ['--version']);
const ngrokAvailable = ensureBinary('ngrok', ['version']);

if (!cloudflaredAvailable && !ngrokAvailable) {
  warn('cloudflared o ngrok no encontrados.');
  warn('Instalá cloudflared (recomendado):');
  warn('  winget install Cloudflare.cloudflared');
  warn('  choco install cloudflared');
  process.exit(1);
}

const publicUrlPattern = cloudflaredAvailable
  ? /https?:\/\/[^\s]*trycloudflare\.com[^\s]*/i
  : /https?:\/\/[^\s]*ngrok[^\s]*/i;

const processOutput = (data) => {
  const text = data.toString();
  const url = extractUrl(text, publicUrlPattern);
  if (url && !shareReady) {
    shareReady = true;
    console.log('\n==============================');
    console.log('✅ SHARE READY');
    console.log(`Local : ${localUrl}`);
    console.log(`Public: ${url}`);
    console.log('==============================\n');

    const copied = copyToClipboard(url);
    if (copied) {
      log('Public URL copiada al portapapeles.');
    } else {
      warn('no se pudo copiar la URL al portapapeles.');
    }
  }
  process.stdout.write(text);
};

const attachListeners = (proc) => {
  proc.stdout.on('data', processOutput);
  proc.stderr.on('data', processOutput);
};

const tunnel = cloudflaredAvailable ? startCloudflared() : startNgrok();
attachListeners(tunnel);
