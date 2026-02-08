import { spawn } from 'node:child_process';
import process from 'node:process';
import { buildUrls, getBase, getHost, getPort } from './dev-utils.mjs';

const args = new Set(process.argv.slice(2));
const shouldOpen = args.has('--open');
const isLanMode = args.has('--lan');

const host = getHost(isLanMode ? '0.0.0.0' : undefined);
const port = getPort();
const base = getBase();
const { localUrl, networkUrl } = buildUrls({ host, port, base });

const isWin = process.platform === 'win32';

console.log('[dev] Iniciando Astro…');

// Construimos argumentos SIN comillas raras
const astroArgs = ['astro', 'dev', '--port', String(port)];
if (host) astroArgs.push('--host', host);
if (shouldOpen) astroArgs.push('--open');

let command;
let commandArgs;

if (isWin) {
  // Windows: ejecutar via cmd.exe para evitar spawn EINVAL con .cmd,
  // y sin comillas alrededor de astro (evita EINVALIDTAGNAME)
  command = 'cmd.exe';
  commandArgs = ['/d', '/s', '/c', `npx ${astroArgs.join(' ')}`];
} else {
  command = 'npx';
  commandArgs = astroArgs;
}

const devProcess = spawn(command, commandArgs, {
  stdio: 'inherit',
  shell: false,
  windowsHide: false,
});

devProcess.on('error', (err) => {
  console.error('[dev] ERROR al iniciar Astro');
  console.error(err);
  console.error('[dev] command:', command);
  console.error('[dev] args:', commandArgs.join(' '));
  process.exit(1);
});

devProcess.on('spawn', () => {
  console.log('\n[dev] Servidor de desarrollo levantado');
  console.log(`[dev] Local   → ${localUrl}`);
  if (networkUrl) console.log(`[dev] Network → ${networkUrl}`);
  console.log('');
});

devProcess.on('exit', (code) => {
  process.exit(code ?? 0);
});
