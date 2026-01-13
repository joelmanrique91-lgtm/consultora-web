const externalLinkPattern = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

export const withBase = (path) => {
  const resolvedPath = typeof path === 'string' ? path : path?.href;
  if (!resolvedPath) {
    return import.meta.env.BASE_URL ?? '/';
  }

  if (
    externalLinkPattern.test(resolvedPath) ||
    resolvedPath.startsWith('mailto:') ||
    resolvedPath.startsWith('tel:') ||
    resolvedPath.startsWith('#')
  ) {
    return resolvedPath;
  }

  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (resolvedPath === '/' || resolvedPath === normalizedBase) {
    return normalizedBase;
  }

  if (resolvedPath.startsWith(normalizedBase)) {
    return resolvedPath;
  }

  if (resolvedPath.startsWith('/')) {
    return `${normalizedBase}${resolvedPath.slice(1)}`;
  }

  return `${normalizedBase}${resolvedPath}`;
};

export const normalizeInternalPath = (path) => {
  if (!path) {
    return '/';
  }

  if (
    externalLinkPattern.test(path) ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('#')
  ) {
    return path;
  }

  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (path === normalizedBase || path === base) {
    return '/';
  }

  if (path.startsWith(normalizedBase)) {
    return path.slice(Math.max(normalizedBase.length - 1, 0));
  }

  if (path.startsWith('/')) {
    return path;
  }

  return `/${path}`;
};
