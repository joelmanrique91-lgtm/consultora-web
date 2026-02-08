import process from 'node:process';
import { execSync } from 'node:child_process';
import https from 'node:https';

const log = (message) => console.log(`[doctor] ${message}`);
const warn = (message) => console.warn(`[doctor] ⚠️ ${message}`);

const safeExec = (command) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    return '';
  }
};

const nodeVersion = process.version;
const npmVersion = safeExec('npm --version') || 'unknown';
const registry = safeExec('npm config get registry') || 'unknown';
const proxy = safeExec('npm config get proxy') || 'not set';
const httpsProxy = safeExec('npm config get https-proxy') || 'not set';

log(`Node: ${nodeVersion}`);
log(`npm: ${npmVersion}`);
log(`registry: ${registry}`);
log(`proxy: ${proxy}`);
log(`https-proxy: ${httpsProxy}`);

const checkRegistry = () =>
  new Promise((resolve) => {
    if (!registry || registry === 'unknown' || registry === 'null') {
      resolve({ status: 'unknown' });
      return;
    }

    const url = new URL(registry);
    const options = {
      method: 'HEAD',
      hostname: url.hostname,
      path: url.pathname || '/',
      port: url.port || 443,
    };

    const request = https.request(options, (res) => {
      resolve({ status: res.statusCode });
    });

    request.on('error', (error) => {
      resolve({ error: error.code || error.message });
    });

    request.end();
  });

const printGuidance = (reason) => {
  warn(`Problema detectado: ${reason}`);
  warn('Soluciones sugeridas:');
  console.log('  - npm config set registry https://registry.npmjs.org/');
  console.log('  - npm config set proxy http://usuario:pass@proxy:port');
  console.log('  - npm config set https-proxy http://usuario:pass@proxy:port');
  console.log('  - npm cache clean --force');
  console.log('  - rm -rf node_modules package-lock.json && npm install');
};

const result = await checkRegistry();
if (result?.status && result.status >= 400) {
  printGuidance(`registry respondió ${result.status}`);
} else if (result?.error) {
  printGuidance(result.error);
} else {
  log('Registry accesible.');
}

process.exit(0);
