import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const log = (message) => console.log(`[update-and-run] ${message}`);

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: appRoot,
      stdio: 'inherit',
      shell: isWin,
      windowsHide: false,
      ...options,
    });

    child.on('error', (error) => reject(error));
    child.on('close', (code) => resolve(code ?? 0));
  });

const runBestEffort = async (command, args) => {
  try {
    const code = await run(command, args);
    if (code !== 0) {
      log(`Comando finalizó con código ${code}: ${command} ${args.join(' ')}`);
    }
    return code;
  } catch (error) {
    log(`ERROR al ejecutar: ${command} ${args.join(' ')}`);
    console.error(error);
    return 1;
  }
};

const hasCommand = (command) => {
  const result = spawnSync(command, ['--version'], {
    encoding: 'utf8',
    shell: isWin,
    windowsHide: true,
  });
  return !result.error && result.status === 0;
};

const isGitRepo = () => {
  const result = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: appRoot,
    encoding: 'utf8',
    shell: isWin,
    windowsHide: true,
  });

  if (result.error || result.status !== 0) return false;
  return result.stdout.trim() === 'true';
};

const runGitPull = async () => {
  if (!hasCommand('git')) {
    log('git no está disponible en PATH; salteando git pull.');
    return;
  }
  if (!isGitRepo()) {
    log('No es un repo git; salteando git pull.');
    return;
  }

  log('Ejecutando git pull...');
  await runBestEffort('git', ['pull']);
};

const runInstall = async () => {
  const nodeModulesPath = path.join(appRoot, 'node_modules');
  const hasNodeModules = fs.existsSync(nodeModulesPath);
  const hasLock = fs.existsSync(path.join(appRoot, 'package-lock.json'));

  if (!hasNodeModules) {
    log('node_modules no existe. Ejecutando npm install...');
    await runBestEffort('npm', ['install']);
    return;
  }

  if (hasLock) {
    log('package-lock.json encontrado. Ejecutando npm install (seguro en entornos existentes)...');
    await runBestEffort('npm', ['install']);
    return;
  }

  log('Ejecutando npm install...');
  await runBestEffort('npm', ['install']);
};

const runTunnel = async () => {
  log('Iniciando túnel...');
  const exitCode = await run('npm', ['run', 'tunnel']);
  process.exit(exitCode ?? 0);
};

const main = async () => {
  log('Actualizando repositorio y dependencias...');
  await runGitPull();
  await runInstall();
  await runTunnel();
};

main().catch((error) => {
  log('ERROR inesperado en update-and-run.');
  console.error(error);
  process.exit(1);
});
