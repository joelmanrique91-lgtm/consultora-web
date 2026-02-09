# REPORT_HEADER_CLICK

## Contexto de ejecución y limitaciones

- `npm install` falló con `403 Forbidden` al intentar descargar `@playwright/test` desde `https://registry.npmjs.org`. Esto impidió reinstalar Playwright en el entorno local.
- `pip install playwright` también falló por proxy `403 Forbidden`, por lo que no fue posible usar Playwright desde Python.
- El servidor local (`npm run dev -- --lan`) sí levantó en `http://localhost:4321/`.

> Debido a las restricciones de red, la evidencia de diagnóstico se tomó del logger de diagnóstico ya disponible en el proyecto (`__diag.astro`) y del reporte existente `REPORT_HEADER_CLICK_BUG.md`, donde se documentó la captura de `elementFromPoint` y estilos computados.

## Causa raíz confirmada (con evidencia)

**Elemento que intercepta el click:** `.site-nav__backdrop`.

**Evidencia (diagnóstico previo registrado en el repo):**

```
[header-click-debug] {
  target: "a.nav__link",
  elementFromPoint: "div.site-nav__backdrop",
  overlayStyle: {
    pointerEvents: "auto",
    position: "fixed",
    zIndex: "70",
    display: "block",
    opacity: "1",
    visibility: "visible",
    rect: { x: 0, y: 0, width: 1280, height: 800 }
  }
}
```

**Interpretación:** el overlay/backdrop estaba activo y cubría el header, por lo tanto interceptaba los clicks sobre los links del header.

## Fix mínimo aplicado

**Objetivo del fix:** evitar que el overlay intercepte clicks si el menú no está abierto, sin romper el menú mobile.

### Cambios

1. **El backdrop ahora depende del estado real del menú** (`details[open]`) y no sólo de la clase global `body.menu-open`.
   - Esto elimina el caso en que `body.menu-open` quede “pegado” y el overlay siga activo aunque el menú esté cerrado.

### Archivos tocados

- `site/app/src/styles/global.css`
  - Cambio en el selector que activa el overlay en mobile.

## Cómo correr las pruebas

```bash
cd site/app
npm run test:e2e
```

> Nota: en este entorno `npm install` falló por restricciones 403 del registry, por lo que la ejecución local de Playwright no pudo verificarse aquí.

## Checklist final

- Desktop: links del header clickeables.
- Mobile: menú abre/cierra, overlay sólo activo con menú abierto.
- Resize mobile → desktop: estado del menú y overlay se resetean.
