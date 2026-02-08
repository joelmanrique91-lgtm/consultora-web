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
2. Hacer click en el botón del menú del header (mobile o viewport reducido).
3. Verificar que el panel se abre.
4. Click en un link del menú: el panel debe cerrarse y navegar.
5. Volver con el navegador y repetir la apertura.
6. Con el panel abierto, presionar `Escape`: debe cerrarse y devolver el foco al toggle.
7. (Opcional) Desactivar JavaScript en DevTools y repetir pasos 2–4: el menú debe abrir/cerrar igual.

## Smoke test (LAN)
1. Abrir `http://<IP_LOCAL>:4321/` desde un dispositivo móvil.
2. Repetir los pasos 2–6 del smoke test local.

## Smoke test (preview)
1. Ejecutar `npm run build` y luego `npx astro preview --host 0.0.0.0 --port 4321`.
2. Abrir `http://<IP_LOCAL>:4321/` desde desktop y móvil.
3. Repetir los pasos 2–6 del smoke test local.
