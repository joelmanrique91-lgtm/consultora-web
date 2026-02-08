import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { buildUrls, getBase, getHost, getPort } from '../scripts/dev-utils.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const devScript = path.join(appRoot, 'scripts', 'dev.mjs');
const tunnelScript = path.join(appRoot, 'scripts', 'dev-tunnel.mjs');

const host = getHost('0.0.0.0');
const port = getPort();
const base = getBase();
const { localUrl } = buildUrls({ host, port, base });

const log = (message) => console.log(`[share] ${message}`);
const warn = (message) => console.warn(`[share] ⚠️ ${message}`);


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
devProcess = spawn(process.execPath, [devScript, '--lan'], {
  cwd: appRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
});
devProcess.on('error', (error) => {
  warn('error al iniciar el dev server.');
  console.error(error);
  warn(`command: ${process.execPath}`);
  warn(`args: ${[devScript, '--lan'].join(' ')}`);
  warn(`cwd: ${appRoot}`);
});
devProcess.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
});
devProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

const isReady = await waitForServer(localUrl);
if (!isReady) {
  warn(`no se pudo confirmar el servidor en ${localUrl}`);
}

const publicUrlPattern = /https?:\/\/[^\s]*(trycloudflare\.com|ngrok)[^\s]*/i;

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

log('levantando túnel público...');
tunnelProcess = spawn(process.execPath, [tunnelScript, '--no-dev'], {
  cwd: appRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
});
tunnelProcess.on('error', (error) => {
  warn('error al iniciar el túnel.');
  console.error(error);
  warn(`command: ${process.execPath}`);
  warn(`args: ${[tunnelScript, '--no-dev'].join(' ')}`);
  warn(`cwd: ${appRoot}`);
});
attachListeners(tunnelProcess);
