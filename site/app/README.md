# Consultora Web (Astro)

## Requisitos
- Node.js 18+
- npm
- (Opcional) `cloudflared` para túneles públicos

## Levantar local
```sh
npm install
npm run dev
```

Verás en consola:
- **Local** → http://localhost:PUERTO

## Probar desde celular en la misma red (LAN)
```sh
npm run dev:lan
```

Verás en consola:
- **Local** → http://localhost:PUERTO  
- **Network** → http://TU_IP_LOCAL:PUERTO

**Cómo obtener tu IP local:**
- **Windows:** `ipconfig` → buscar “IPv4 Address”.
- **macOS / Linux:** `ifconfig` o `ip a` → buscar IP en tu red (ej. 192.168.x.x).

> Asegurate de que el celular y la PC estén en la misma Wi‑Fi.

## Probar desde internet (túnel)
### Opción A (recomendada): Cloudflare Tunnel
Instalá `cloudflared`:
https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/

Luego:
```sh
npm run dev:tunnel
```

La consola mostrará:
- **Public** → URL pública lista para compartir.

### Opción B: localtunnel (sin instalar binarios)
```sh
npm run dev:tunnel:lt
```

> Usa `npx localtunnel` y puede tardar la primera vez (descarga).

## Share link (túnel público automático)
```sh
npm run share
```

Requiere `cloudflared` (recomendado) o `ngrok` instalado en PATH.

Salida esperada:
```text
==============================
✅ SHARE READY
Local : http://localhost:4321/
Public: https://xxxxx.trycloudflare.com
==============================
```

La Public URL se copia al portapapeles automáticamente.

## Modo app (DX/UX)
```sh
npm run app
```

Incluye:
- Local URL
- Network URL
- Public URL (si hay túnel disponible)

Opciones:
- `npm run app -- --open` abre el navegador local.
- `npm run app -- --no-tunnel` desactiva el túnel.
- `npm run app -- --localtunnel` fuerza localtunnel.

## VS Code Tasks
En VS Code podés ejecutar:
- **Dev: Local**
- **Dev: LAN**
- **Dev: Tunnel**
- **Share: Public Link**
- **App: Start**

## Diagnóstico (npm 403 / proxy)
```sh
npm run doctor
```

Si aparece 403/407/ENOTFOUND/ETIMEDOUT, probá:
```sh
npm config set registry https://registry.npmjs.org/
npm config set proxy http://usuario:pass@proxy:port
npm config set https-proxy http://usuario:pass@proxy:port
npm cache clean --force
rm -rf node_modules package-lock.json && npm install
```

## Troubleshooting
- **Puerto ocupado:** `PORT=4400 npm run dev`
- **Firewall (Windows):** permitir `node.exe` en redes privadas.
- **Celular sin acceso:** verificar misma red Wi‑Fi.
- **Túnel no inicia:** instalá `cloudflared` o usá `npm run dev:tunnel:lt`.
- **Public URL no aparece:** asegurate de que `cloudflared`/`ngrok` estén instalados y que no haya bloqueos de red.

## Verificación rápida
```sh
npm run doctor
npm install
npm run dev
npm run dev:lan
npm run dev:tunnel
npm run app
```

Checklist con celular:
- **LAN (misma Wi‑Fi):** abrir la **Network URL**.
- **Externo:** abrir la **Public URL** del túnel.
