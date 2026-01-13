const externalLinkPattern = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;

export const withBase = (path) => {
  if (!path) {
    return import.meta.env.BASE_URL ?? '/';
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

  if (path === '/' || path === normalizedBase) {
    return normalizedBase;
  }

  if (path.startsWith(normalizedBase)) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${normalizedBase}${path.slice(1)}`;
  }

  return `${normalizedBase}${path}`;
};
