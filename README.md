# Consultora Web

Repositorio base para el desarrollo del sitio web institucional de la consultora.

## Objetivo del proyecto

Construir una web profesional, clara y escalable que represente a la consultora, sirva como carta de presentación y pueda crecer con el tiempo (nuevos servicios, experiencia del equipo, contacto, contenidos, etc.).

Este repositorio también se utiliza como entorno de aprendizaje práctico para:
- Uso de GitHub
- Flujos de trabajo con control de versiones
- Integración y uso de Codex como asistente de desarrollo
- Buenas prácticas de organización de proyectos web

## Alcance inicial

En una primera etapa, el sitio incluirá:
- Página principal (home)
- Sección de servicios
- Sección sobre la consultora
- Página de contacto

La elección de tecnologías se hará de manera progresiva.

## Metodología de trabajo

El desarrollo se realizará de forma incremental:
1. Definición de estructura y contenido
2. Implementación técnica básica
3. Mejoras visuales y de experiencia de usuario
4. Escalado y automatización

Codex será utilizado como apoyo para:
- Generación de código
- Revisión de estructura
- Propuestas de mejora
- Documentación

## Estado del proyecto

🟢 Proyecto inicializado  
🔜 Definición de estructura del sitio y stack tecnológico

## Cómo levantar

> Requiere Node.js 18+ y npm.

```sh
cd site/app
npm install
npm run dev
```

URL esperada (por defecto): http://localhost:4321/

Comando opcional para abrir el navegador automáticamente:

```sh
cd site/app
npm run dev:open
```

### Variables de entorno

Duplicá `site/app/.env.example` como `.env` y ajustá:
- `HOST` y `PORT` para el servidor de desarrollo.
- `PUBLIC_BASE_PATH` si vas a servir el sitio desde un subpath (ej. `/consultora`).
- `PUBLIC_SITE_URL` para definir el URL base usado en `astro.config.mjs`.
- `PUBLIC_CONTACT_FORM_ENDPOINT` para habilitar el envío del formulario.

## Desarrollo local con actualización automática

Para probar el proyecto Astro con sincronización automática desde la rama `main`:

```sh
cd site/app
npm run dev:sync
```

Abrir en el navegador: http://localhost:4321

## Formulario de contacto

Para enviar mensajes reales desde el formulario de contacto, configurar la variable de entorno
`PUBLIC_CONTACT_FORM_ENDPOINT` con el endpoint del proveedor (Formspree, Getform, etc.).

Ejemplo:

```sh
cd site/app
export PUBLIC_CONTACT_FORM_ENDPOINT="https://formspree.io/f/tu-endpoint"
npm run dev
```

## Build y preview

```sh
cd site/app
npm run build
npm run preview
```

## Troubleshooting

- **Puerto ocupado**: cambiá `PORT` en `.env` o ejecutá `PORT=4400 npm run dev`.
- **Sitio en subpath**: configurá `PUBLIC_BASE_PATH=/consultora` y `PUBLIC_SITE_URL=https://dominio.com/consultora/`.

## Crear un post nuevo

1. Crear un archivo `.md` en `site/app/src/content/posts/`.
2. Completar el frontmatter con `title`, `description`, `date`, `tags` y opcional `draft`.
3. Guardar el contenido en Markdown y levantar el sitio para ver el nuevo post en `/posts`.
