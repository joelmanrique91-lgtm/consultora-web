# Header links autodiagnóstico (sin Playwright)

## Objetivo
Diagnosticar de forma automática si los links del header están siendo interceptados en desktop sin usar Playwright ni DevTools.

## Requisitos
- No requiere dependencias nuevas.
- Funciona en `npm run dev` y en `npm run build` + `npx astro preview`.
- El reporte se visualiza en `/__diag` y se puede copiar como JSON.
- Guardado a archivo opcional en `outputs/diag/` (si el entorno permite escritura).

## Cómo ejecutar (Windows PowerShell)
```powershell
cd site/app
npm run dev
```

Abrí en el navegador:
```
http://localhost:4321/__diag
```

Si estás en preview:
```powershell
cd site/app
npm run build
npx astro preview --port 4321
```
Luego abrí:
```
http://localhost:4321/__diag
```

## Uso
1. Entrá a `/__diag`.
2. Presioná **Run Diagnostics**.
3. Revisá el reporte y, si hace falta, presioná **Copy Report**.
4. Si el entorno permite, presioná **Save Report** para guardar en `outputs/diag/`.

## Interpretación rápida
- **CLICK INTERCEPTED**: el `elementFromPoint` no coincide con el link, probable overlay/backdrop u otra capa.
- **INVALID HREF**: el link no tiene `href` real.
- **BACKDROP INTERCEPT**: el backdrop está visible con `pointer-events` activos.

## Qué enviarme para soporte
Pegá el JSON completo del reporte copiado.
