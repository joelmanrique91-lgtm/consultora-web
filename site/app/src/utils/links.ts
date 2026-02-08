const externalLinkPattern = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

const resolvePathValue = (path) => {
  if (typeof path === 'string') {
    return path;
  }

  if (path instanceof URL) {
    return path.toString();
  }

  if (path && typeof path === 'object' && typeof path.href === 'string') {
    return path.href;
  }

  return null;
};

export const assertStringHref = (value, context = '') => {
  if (typeof value === 'string') {
    return value;
  }

  if (import.meta.env.DEV) {
    const label = context ? ` (${context})` : '';
    const type = value === null ? 'null' : typeof value;
    console.warn(`[links] Expected string href${label}, received ${type}.`, value);
  }

  return null;
};

export const withBase = (path, context = 'withBase') => {
  const resolvedPath = resolvePathValue(path);
  const safePath = assertStringHref(resolvedPath ?? path, context);
  if (!safePath) {
    return import.meta.env.BASE_URL ?? '/';
  }

  if (
    externalLinkPattern.test(safePath) ||
    safePath.startsWith('mailto:') ||
    safePath.startsWith('tel:') ||
    safePath.startsWith('#')
  ) {
    return safePath;
  }

  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (safePath === '/' || safePath === normalizedBase) {
    return normalizedBase;
  }

  if (safePath.startsWith(normalizedBase)) {
    return safePath;
  }

  if (safePath.startsWith('/')) {
    return `${normalizedBase}${safePath.slice(1)}`;
  }

  return `${normalizedBase}${safePath}`;
};

export const normalizeInternalPath = (path, context = 'normalizeInternalPath') => {
  const resolvedPath = resolvePathValue(path);
  const safePath = assertStringHref(resolvedPath ?? path, context);
  if (!safePath) {
    return '/';
  }

  if (
    externalLinkPattern.test(safePath) ||
    safePath.startsWith('mailto:') ||
    safePath.startsWith('tel:') ||
    safePath.startsWith('#')
  ) {
    return safePath;
  }

  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (safePath === normalizedBase || safePath === base) {
    return '/';
  }

  if (safePath.startsWith(normalizedBase)) {
    return safePath.slice(Math.max(normalizedBase.length - 1, 0));
  }

  if (safePath.startsWith('/')) {
    return safePath;
  }

  return `/${safePath}`;
};
