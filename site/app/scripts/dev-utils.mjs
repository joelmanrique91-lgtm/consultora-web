import os from 'node:os';
import path from 'node:path';

const binName = (name) => (process.platform === 'win32' ? `${name}.cmd` : name);

const defaultHost = 'localhost';
const defaultPort = '4321';
const defaultBase = '/';

export const getHost = (override) => override || process.env.HOST || defaultHost;
export const getPort = (override) => override || process.env.PORT || defaultPort;
export const getBase = (override) => override || process.env.PUBLIC_BASE_PATH || defaultBase;

export const normalizeBase = (value) => {
  if (!value || value === '/') {
    return '/';
  }

  const trimmed = value.replace(/\/+$/g, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
};

export const buildUrls = ({ host, port, base }) => {
  const normalizedBase = normalizeBase(base);
  const displayPath = normalizedBase === '/' ? '/' : `${normalizedBase}/`;
  const localHost = host === '0.0.0.0' ? defaultHost : host;
  const localUrl = `http://${localHost}:${port}${displayPath}`;
  const ip = host === '0.0.0.0' ? getLocalIp() : null;
  const networkUrl = ip ? `http://${ip}:${port}${displayPath}` : null;

  return { localUrl, networkUrl, displayPath };
};

export const resolveBin = (name, appRoot) => {
  const localBin = path.join(appRoot, 'node_modules', '.bin', binName(name));
  return localBin;
};
