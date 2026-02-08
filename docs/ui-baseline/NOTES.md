# UI Baseline

## Build/Test
- `npm run build` (app) OK.

## Screenshots
Intenté generar capturas con Playwright (browser tools) para móvil y desktop, pero el navegador no pudo conectarse al servidor de desarrollo (`net::ERR_EMPTY_RESPONSE`). Reintentado luego con `astro preview` y base `/consultora`, pero el script agotó el timeout. Pendiente de reintentar en un entorno con acceso al servidor desde el contenedor de navegador.

## Páginas a verificar
- Home (/)
- Servicios (/servicios)
- Sobre (/sobre)
- Experiencia (/experiencia)
- Posts (/posts)
- Contacto (/contacto)
- Post individual (uno de los actuales)
