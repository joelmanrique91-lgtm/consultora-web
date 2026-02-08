import { assertStringAttr } from './links';

const protocolPattern = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

const isExternalPath = (path: string) =>
  protocolPattern.test(path) ||
  path.startsWith('data:') ||
  path.startsWith('mailto:') ||
  path.startsWith('tel:') ||
  path.startsWith('#');

export const getBaseUrl = () => import.meta.env.BASE_URL ?? '/';

const resolvePathValue = (path: unknown) => {
  if (typeof path === 'string') {
    return path;
  }

  if (path instanceof URL) {
    return path.toString();
  }

  if (path && typeof path === 'object' && 'href' in path) {
    const href = (path as { href?: unknown }).href;
    if (typeof href === 'string') {
      return href;
    }
  }

  return path;
};

const stripTrailingSlash = (value: string) =>
  value.length > 1 ? value.replace(/\/+$/g, '') : value;

const ensureLeadingSlash = (value: string) =>
  value.startsWith('/') ? value : `/${value}`;

export const withBaseUrl = (path: unknown, context = 'withBaseUrl') => {
  const resolvedPath = resolvePathValue(path);
  const safePath = assertStringAttr('src', resolvedPath, context);

  if (!safePath) {
    return resolvedPath ?? '';
  }

  if (isExternalPath(safePath)) {
    return safePath;
  }

  const base = getBaseUrl();
  if (base === '/') {
    return safePath;
  }

  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  const baseWithoutSlash = stripTrailingSlash(baseWithSlash);

  if (safePath.startsWith(baseWithSlash) || safePath.startsWith(`${baseWithoutSlash}/`)) {
    return safePath;
  }

  if (safePath.startsWith('/')) {
    return `${baseWithoutSlash}${safePath}`;
  }

  return `${baseWithSlash}${ensureLeadingSlash(safePath).slice(1)}`;
};
