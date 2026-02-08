# Header menu smoke test

## Objetivo
Validar que el menú del header abre/cierra en local, LAN y preview, incluso sin JS, y que los eventos de cierre (Escape y click en links) funcionan tras navegar entre páginas.

## Entornos y comandos
```bash
cd site/app
npm run dev
```

```bash
cd site/app
npx astro dev --host 0.0.0.0 --port 4321
```

```bash
cd site/app
npm run build
npx astro preview --host 0.0.0.0 --port 4321
```

## Smoke test (local)
1. Abrir `http://localhost:4321/`.
2. En desktop, hacer click en los links del header (Home/Servicios/Posts/etc.) y verificar navegación.
3. Hacer click en el botón del menú del header (mobile o viewport reducido).
4. Verificar que el panel se abre.
5. Click en un link del menú: el panel debe cerrarse y navegar.
6. Volver con el navegador y repetir la apertura.
7. Con el panel abierto, presionar `Escape`: debe cerrarse y devolver el foco al toggle.
8. (Opcional) Desactivar JavaScript en DevTools y repetir pasos 3–5: el menú debe abrir/cerrar igual.

## Smoke test (LAN)
1. Abrir `http://<IP_LOCAL>:4321/` desde un dispositivo móvil.
2. Repetir los pasos 2–6 del smoke test local.

## Smoke test (preview)
1. Ejecutar `npm run build` y luego `npx astro preview --host 0.0.0.0 --port 4321`.
2. Abrir `http://<IP_LOCAL>:4321/` desde desktop y móvil.
3. Repetir los pasos 2–6 del smoke test local.
