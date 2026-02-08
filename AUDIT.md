# AUDIT.md

## Resumen ejecutivo
- El proyecto Astro vive en `site/app` y ya incluye scripts de dev LAN y tunel (`dev:lan`, `dev:tunnel`).
- `astro.config.mjs` define `base` con `PUBLIC_BASE_PATH` (default `/` en dev y `/consultora` en prod) y `site` con `PUBLIC_SITE_URL`.
- El modo LAN para desarrollo ya esta resuelto por `scripts/dev.mjs` (`--host 0.0.0.0`) y muestra URL de red.
- Para preview en LAN hace falta pasar `--host 0.0.0.0` (se agrego `preview:lan`).
- El `base` esta centralizado y los enlaces internos usan `withBase`, lo que evita 404 en prod con `/consultora`.
- El repo ya contempla tunel (Cloudflare/localtunnel) y habilita `allowedHosts` para `*.trycloudflare.com`.
- La principal fuente de friccion en Windows suele ser firewall/puerto ocupado, no el codigo.
- Se agregaron scripts minimos para estandarizar `dev:local` y `preview:{local,lan}` sin tocar los existentes.

## Hallazgos por severidad

### MUST FIX
- Ninguno. El repo ya levanta en local y tiene soporte LAN para `dev`.

### SHOULD FIX
- **Preview en LAN**: `astro preview` por defecto no expone en la red. Se requiere `--host 0.0.0.0`. Se agrego `npm run preview:lan` para evitar errores manuales.
- **Base en preview**: en produccion el `base` default es `/consultora`, por lo que el preview responde en `.../consultora/`. Si necesitas root, usa `PUBLIC_BASE_PATH=/` al hacer preview.
- **Canonical/`site` en LAN**: si se necesita que meta/URLs absolutas apunten a la IP local, definir `PUBLIC_SITE_URL=http://<IP>:<PORT>/` en el entorno. No rompe funcionalidad, pero mejora consistencia al testear desde celular.

### NICE TO HAVE
- Definir un `.env` real (a partir de `.env.example`) para fijar `PORT` y `PUBLIC_BASE_PATH` si se trabaja en varios entornos.
- Documentar comandos de firewall y diagnostico de puertos para Windows (incluido en `docs/LAUNCH_WINDOWS_POWERSHELL.md`).

## Recomendacion de lanzamiento

**Mejor camino (Windows / PowerShell):**
1. Local PC: `npm run dev` (o `npm run dev:local`).
2. LAN para celular: `npm run dev:lan` (expone en `0.0.0.0`).
3. Preview de produccion: `npm run build` + `npm run preview:lan` si se necesita LAN, o `npm run preview:local` si es solo PC.

## Archivos relevantes auditados
- `site/app/package.json` (scripts)
- `site/app/astro.config.mjs` (base, site, allowedHosts)
- `site/app/.env.example`
- `site/app/src/layouts/Layout.astro` (layout principal)
- `site/app/src/pages/*` (rutas)
- `site/app/src/utils/links.ts` (withBase)
- `site/app/scripts/*.mjs` (dev/lan/tunel)

## Cambios realizados
- Se agregaron scripts minimos en `site/app/package.json`:
  - `dev:local`
  - `preview:local`
  - `preview:lan`

Estos cambios no afectan prod ni cambian el comportamiento de scripts existentes.

## Fix menú del header (UI)
### Causa raíz confirmada
- El menú mobile dependía 100% de JS y el toggle quedaba inerte si el script no ejecutaba.
- `initMenu()` capturaba referencias a nodos y marcaba el toggle; tras swaps parciales de Astro, los handlers podían apuntar a nodos obsoletos.

### Solución aplicada
- Se implementó un fallback no‑JS con `<details>/<summary>` para que el menú abra/cierre incluso si falla JS.
- El JS quedó como *enhancement* (cerrar con Escape, cerrar al click en link, sincronizar aria y estado de inert) y se re‑inicializa de forma idempotente.

### Archivos tocados
- `site/app/src/layouts/Layout.astro`
- `site/app/src/styles/global.css`
- `docs/HEADER_MENU_SMOKETEST.md`
