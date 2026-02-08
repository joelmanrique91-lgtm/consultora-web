import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildUrls, getBase, getHost, getPort, resolveBin } from './dev-utils.mjs';

const args = new Set(process.argv.slice(2));
const shouldOpen = args.has('--open');
const isLanMode = args.has('--lan');

const host = getHost(isLanMode ? '0.0.0.0' : undefined);
const port = getPort();
const base = getBase();
const { localUrl, networkUrl } = buildUrls({ host, port, base });
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const astroBin = resolveBin('astro', appRoot);

console.log('\n[dev] Servidor de desarrollo listo');
console.log(`[dev] Local   → ${localUrl}`);
if (networkUrl) {
  console.log(`[dev] Network → ${networkUrl}`);
}
console.log('');

const commandArgs = ['dev', '--host', host, '--port', port];
if (shouldOpen) {
  commandArgs.push('--open');
}

const devProcess = spawn(astroBin, commandArgs, { stdio: 'inherit' });
devProcess.on('exit', (code) => {
  process.exit(code ?? 0);
});
