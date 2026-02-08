import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildUrls, getBase, getHost, getPort } from './dev-utils.mjs';

// -----------------------------
// Args
// -----------------------------
const args = new Set(process.argv.slice(2));
const useLocaltunnel = args.has('--localtunnel') || args.has('--lt') || args.has('--local');
const skipDevServer = args.has('--no-dev');

// -----------------------------
// Config
// -----------------------------
const host = getHost('0.0.0.0');
const port = getPort();
const base = getBase();
const { localUrl, networkUrl } = buildUrls({ host, port, base });


const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const devScript = path.join(appRoot, 'scripts', 'dev.mjs');

const isWin = process.platform === 'win32';
const CMD = isWin ? 'cmd.exe' : null;

// -----------------------------
// Utils
// -----------------------------
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
  const result = spawnSync(command, ['--version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
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

const spawnWinCmd = (commandLine, opts = {}) => {
  // cmd.exe /d /s /c "<commandLine>"
  return spawn('cmd.exe', ['/d', '/s', '/c', commandLine], {
    ...opts,
    shell: false,
    windowsHide: false,
  });
};

// -----------------------------
// Dev server
// -----------------------------
const startDevServer = () => {
  log('iniciando servidor Astro (LAN).');

  const devProcess = spawn(process.execPath, [devScript, '--lan'], {
    cwd: appRoot,
    stdio: 'inherit',
    shell: false,
    windowsHide: false,
  });

  devProcess.on('error', (error) => {
    log('ERROR al iniciar el dev server.');
    console.error(error);
    process.exit(1);
  });

  // No cerramos el proceso principal si el dev server muere,
  // pero sí lo reportamos.
  devProcess.on('exit', (code) => {
    log(`dev server finalizó (code=${code ?? 0})`);
  });

  return devProcess;

  return devProcess;
};

const printUrls = () => {
  log(`Local   → ${localUrl}`);
  if (networkUrl) log(`Network → ${networkUrl}`);
  if (networkUrl) log(`Network → ${networkUrl}`);
};

const handleTunnelUrl = (url) => {
  if (!url) return;
  if (!url) return;
  log(`Public  → ${url}`);
  log('Tip: compartí esta URL (link público temporal).');
};

// -----------------------------
// Start
// -----------------------------
let devProcess = null;
if (!skipDevServer) {
  devProcess = startDevServer();
  printUrls();
}

// -----------------------------
// Tunnel
// -----------------------------
if (useLocaltunnel) {
  log('levantando túnel con localtunnel.');

  // Windows-safe: NO spawnear npx.cmd directo (puede dar EINVAL con Node 24)
  const ltProcess = isWin
    ? spawnWinCmd(`npx localtunnel --port ${String(port)}`, { cwd: appRoot, stdio: ['ignore', 'pipe', 'pipe'] })
    : spawn('npx', ['localtunnel', '--port', String(port)], { cwd: appRoot, stdio: ['ignore', 'pipe', 'pipe'] });

  ltProcess.on('error', (error) => {
    log('ERROR al iniciar localtunnel.');
    console.error(error);
    process.exit(1);
  });

  const onData = (chunk) => {
    const text = chunk.toString();
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) handleTunnelUrl(match[0]);
    return text;
  };

  ltProcess.stdout.on('data', (data) => process.stdout.write(onData(data)));
  ltProcess.stderr.on('data', (data) => process.stderr.write(onData(data)));

} else {
  // Cloudflared
  if (!ensureBinary('cloudflared', 'cloudflared')) {
    log('Instalá cloudflared o usá localtunnel: npm run dev:tunnel:lt');
    process.exit(1);
  }

  log('levantando túnel con cloudflared.');
  const cfProcess = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`], {
    cwd: appRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    windowsHide: false,
  });

  cfProcess.on('error', (error) => {
    log('ERROR al iniciar cloudflared.');
    console.error(error);
    process.exit(1);
  });

  const onText = (chunk) => {
    const text = chunk.toString();
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) handleTunnelUrl(match[0]);
    return text;
  };

  cfProcess.stdout.on('data', (d) => process.stdout.write(onText(d)));
  cfProcess.stderr.on('data', (d) => process.stderr.write(onText(d)));
}

// -----------------------------
// Cleanup
// -----------------------------
process.on('SIGINT', () => {
  if (devProcess && !devProcess.killed) devProcess.kill();
  process.exit(0);
});
