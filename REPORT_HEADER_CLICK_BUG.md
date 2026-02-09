# REPORT_HEADER_CLICK_BUG

## PASO 0 — Mapa de entradas

**Archivos relevantes**
- `site/app/src/layouts/Layout.astro` (header, menú, script de estado, overlay/backdrop).
- `site/app/src/styles/global.css` (estilos de header/nav/backdrop y comportamiento responsive).
- `site/app/src/pages/__diag.astro` (diagnóstico interactivo del header).
- `site/app/e2e` (tests Playwright existentes y nuevos).

**Hipótesis iniciales**
1. Overlay/backdrop invisible con `position: fixed` y `pointer-events: auto` bloqueando clicks.
2. Estado de menú “pegado” al cambiar breakpoint (detalle `open`, clase `menu-open`).
3. `inert` o `pointer-events: none` aplicado a contenedores incorrectos.

## PASO 1 — Reproducción y diagnóstico con evidencia

### Instrumentación (dev-only)
Se agregó un logger en capture-phase (sólo en `DEV` o con `DIAG_ENABLED=1`) para inspeccionar `e.target` y `document.elementFromPoint(x,y)`, incluyendo estilos críticos del overlay si corresponde.

**Evidencia (consola)**
Con `DIAG_ENABLED=1`, al clickear “Home/Servicios” el `elementFromPoint` devolvió el backdrop:

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

### Diagnóstico
El overlay `.site-nav__backdrop` estaba activo y cubría el header, por lo que interceptaba los clicks. El estado se mantenía abierto por el `details[open]` que no se reseteaba al cambiar el breakpoint (o al iniciar fuera del breakpoint móvil).

## PASO 2 — Fix de causa raíz

**Acciones clave**
1. **Reset del estado al pasar a desktop:** al salir de mobile se elimina `open` del `<details>` y se limpia el estado global del menú.
2. **Overlay controlado por estado explícito:** el backdrop ahora responde a `body.menu-open`, con `pointer-events: none` cuando está cerrado y `pointer-events: auto` cuando está abierto.
3. **Desktop blindado:** en `min-width: 769px` el overlay se fuerza a `display: none !important` para que nunca capture eventos.

## PASO 3 — Entregables

- Fix en `Layout.astro` y `global.css` para asegurar que el overlay no bloquee el header cuando el menú está cerrado.
- Prueba Playwright anti-regresión: `site/app/e2e/header-clickable.spec.ts`.

## PASO 4 — Cómo correr la prueba

```bash
cd site/app
npm run test:e2e
```

## PASO 5 — Checklist final

- Desktop: links del header clickeables.
- Mobile: menú abre/cierra, overlay cierra al click, links navegan.
- Resize: al pasar a desktop se resetea el estado del menú.
- Sin errores en consola.
