const protocolPattern = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

const isExternalPath = (path: string) =>
  protocolPattern.test(path) ||
  path.startsWith('data:') ||
  path.startsWith('mailto:') ||
  path.startsWith('tel:') ||
  path.startsWith('#');

export const getBaseUrl = () => import.meta.env.BASE_URL ?? '/';

const stripTrailingSlash = (value: string) =>
  value.length > 1 ? value.replace(/\/+$/g, '') : value;

const ensureLeadingSlash = (value: string) =>
  value.startsWith('/') ? value : `/${value}`;

export const withBaseUrl = (path: string) => {
  if (typeof path !== 'string' || path.length === 0) {
    return path;
  }

  if (isExternalPath(path)) {
    return path;
  }

  const base = getBaseUrl();
  if (base === '/') {
    return path;
  }

  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  const baseWithoutSlash = stripTrailingSlash(baseWithSlash);

  if (path.startsWith(baseWithSlash) || path.startsWith(`${baseWithoutSlash}/`)) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${baseWithoutSlash}${path}`;
  }

  return `${baseWithSlash}${ensureLeadingSlash(path).slice(1)}`;
};
