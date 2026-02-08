# UI Changelog

## Etapa 0 — Baseline & Seguridad
- Ejecutado build inicial para baseline.
- Agregado registro de baseline en `docs/ui-baseline/NOTES.md`.
- Capturas pendientes por falla de conexión del navegador automatizado.

## Etapa 1 — Tokens y sistema de espaciado
- Normalizada la escala de spacing a 8/12/16/24/32/48 y alineados tokens derivados.
- Agregados tokens de radios y sombras suaves para consistencia global.
- Añadido `--reading-ch` para controlar ancho de lectura en caracteres.

Archivos: `src/styles/tokens.css`, `src/styles/global.css`.

## Etapa 2 — Header / Navegación Responsive
- Implementado menú hamburguesa accesible en móvil con panel y backdrop.
- Ajustado header sticky para no romper layout en mobile.

Archivos: `src/layouts/Layout.astro`, `src/styles/global.css`.

## Etapa 3 — Home: Hero y jerarquía tipográfica
- Añadido CTA secundario en el hero y límite de ancho de lectura.

Archivos: `src/components/Hero.astro`, `src/pages/index.astro`.

## Etapa 4 — Home: Método como Stepper/Cards
- Convertidas etapas del método en tarjetas con fondo y borde.

Archivos: `src/components/Stepper.astro`.

## Etapa 5 — Entregables y Servicios
- Agregado micro-CTA por card en Servicios y consistencia de altura.

Archivos: `src/pages/servicios.astro`.

## Etapa 6 — Sobre y Experiencia
- Ajustada consistencia del avatar del equipo con ratio fijo.

Archivos: `src/pages/sobre.astro`.

## Etapa 7 — Posts & Post individual
- Agregado link de retorno “← Volver a Posts” en post individual.

Archivos: `src/pages/posts/[...slug].astro`.

## Etapa 8 — Contacto
- Agregado bloque de estado con alternativas cuando el formulario está inactivo.

Archivos: `src/pages/contacto.astro`.
