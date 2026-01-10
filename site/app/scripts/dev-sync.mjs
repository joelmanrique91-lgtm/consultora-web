import { spawn, spawnSync } from 'node:child_process';

const intervalMs = 7000;
const isWindows = process.platform === 'win32';
const npmShell = isWindows;

const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[dev-sync] ${timestamp} ${message}`);
};

const runGit = (args) => {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  return result;
};

const ensureRepo = () => {
  const inside = runGit(['rev-parse', '--is-inside-work-tree']);
  if (inside.status !== 0 || inside.stdout.trim() !== 'true') {
    console.error('Error: scripts/dev-sync.mjs debe ejecutarse dentro de un repositorio git.');
    process.exit(1);
  }

  const branch = runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch.status !== 0) {
    console.error('Error: no se pudo detectar la rama actual.');
    process.exit(1);
  }

  const branchName = branch.stdout.trim();
  if (branchName !== 'main') {
    console.error(`Error: scripts/dev-sync.mjs requiere la rama main. Rama actual: ${branchName}`);
    process.exit(1);
  }
};

const getHead = () => {
  const head = runGit(['rev-parse', 'HEAD']);
  if (head.status !== 0) {
    console.error('Error: no se pudo leer el HEAD actual.');
    process.exit(1);
  }
  return head.stdout.trim();
};

const getDiffNames = (from, to) => {
  const diff = runGit(['diff', '--name-only', from, to]);
  if (diff.status !== 0) {
    console.error('Error: no se pudo obtener el diff de cambios.');
    process.exit(1);
  }
  return diff.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const runNpmInstall = () => {
  log('package-lock.json cambió, ejecutando npm install.');
  const result = spawnSync('npm', ['install'], {
    stdio: 'inherit',
    shell: npmShell,
  });
  if (result.status !== 0) {
    console.error('Error: npm install falló.');
    process.exit(result.status ?? 1);
  }
};

let devProcess = null;

const startDevServer = () => {
  log('iniciando npm run dev.');
  devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: npmShell,
  });
};

const stopDevServer = () => {
  if (!devProcess || devProcess.killed) {
    return;
  }

  log('deteniendo servidor de desarrollo.');
  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(devProcess.pid), '/t', '/f'], {
      stdio: 'ignore',
      shell: true,
    });
  } else {
    devProcess.kill('SIGTERM');
  }

  devProcess = null;
};

const restartDevServer = () => {
  log('reiniciando servidor de desarrollo.');
  stopDevServer();
  startDevServer();
};

ensureRepo();

let currentHead = getHead();
log(`sincronizando cambios cada ${intervalMs / 1000}s.`);

startDevServer();

let running = false;
const syncOnce = () => {
  if (running) {
    return;
  }
  running = true;

  try {
    const pull = runGit(['pull', '--ff-only']);
    if (pull.status !== 0) {
      console.error('Error: git pull --ff-only falló.');
      console.error(pull.stderr.trim());
      return;
    }

    const newHead = getHead();
    if (newHead === currentHead) {
      log('no changes.');
      return;
    }

    log('pulled new commit.');
    const diffNames = getDiffNames(currentHead, newHead);
    const lockfileChanged = diffNames.some((name) => name.endsWith('package-lock.json'));
    if (lockfileChanged) {
      runNpmInstall();
    }

    currentHead = newHead;
    restartDevServer();
  } finally {
    running = false;
  }
};

const interval = setInterval(syncOnce, intervalMs);
process.on('SIGINT', () => {
  log('cerrando dev-sync.');
  clearInterval(interval);
  stopDevServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('cerrando dev-sync.');
  clearInterval(interval);
  stopDevServer();
  process.exit(0);
});

syncOnce();
