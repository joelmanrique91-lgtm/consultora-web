# Reporte de auditoría (Astro base `/consultora`)

## Reproducción

1) `PUBLIC_BASE_PATH=/consultora HOST=0.0.0.0 npm run dev`
2) Abrí en el navegador:
   - `http://localhost:4321/consultora`
   - `http://localhost:4321/consultora/servicios`
   - `http://localhost:4321/consultora/sobre`
   - `http://localhost:4321/consultora/posts`

## Evidencia inicial

- Network (DevTools): no se observaron 404/500 en assets críticos al cargar las rutas indicadas.
- Console: no se observó `AstroErrorData.InvalidComponentArgs`.
- Server logs: no se observaron `[404] /[object Object]`.

## Causa raíz

- `/[object Object]`: este síntoma ocurre cuando valores no string (objetos) llegan a `href`/`src`.
  Se reforzó el uso de `withBase`/`withBaseUrl` con contexto explícito en CTAs y en el hero,
  evitando que objetos no normalizados lleguen a los atributos.
- `InvalidComponentArgs`: típicamente aparece cuando un componente recibe props con tipos
  inválidos. El refuerzo de guardrails (`assertStringAttr` vía `withBase`/`withBaseUrl`)
  detecta estos casos en dev y evita que se propaguen.

## Validación

- `npm run dev` (con `PUBLIC_BASE_PATH=/consultora`) sin errores de `/[object Object]`
  ni `InvalidComponentArgs`.
- `npm run dev:smoke` valida respuestas 200/3xx para:
  - `http://127.0.0.1:4321/consultora`
  - `http://127.0.0.1:4321/consultora/servicios`
  - `http://127.0.0.1:4321/consultora/sobre`
  - `http://127.0.0.1:4321/consultora/posts`

## Comandos locales

```sh
PUBLIC_BASE_PATH=/consultora HOST=0.0.0.0 npm run dev
```

Abrir:

- `http://localhost:4321/consultora`
