# LAUNCH_WINDOWS_POWERSHELL.md

## Requisitos
- Windows 10/11
- Node.js 18+ (recomendado 18 o superior)
- npm

> El proyecto vive en `site/app`. Todos los comandos asumen PowerShell en ese directorio.

## Tabla rapida de escenarios

| Escenario | Comando principal | URL esperada |
| --- | --- | --- |
| PC local (dev) | `npm run dev` o `npm run dev:local` | `http://localhost:4321/` (o el puerto elegido) |
| Celular LAN (dev) | `npm run dev:lan` | `http://<IP_DE_LA_PC>:4321/` |
| Preview produccion (local) | `npm run build` + `npm run preview:local` | `http://localhost:4321/consultora/`* |
| Preview produccion (LAN) | `npm run build` + `npm run preview:lan` | `http://<IP_DE_LA_PC>:4321/consultora/`* |

## Comandos PowerShell (copy/paste)

### 1) Instalar dependencias (limpio)
```powershell
cd C:\Users\joelm\Documents\consultora-web\site\app
npm install
```

### 2) DEV local (PC)
```powershell
npm run dev
```

### 3) DEV LAN (celular en misma Wi-Fi)
```powershell
npm run dev:lan
```

### 4) Preview de produccion (build + preview)
```powershell
npm run build
npm run preview:local
```

### 5) Preview en LAN (para celular)
```powershell
npm run build
npm run preview:lan
```

*Nota sobre el path de preview:* en produccion el `base` default es `/consultora`. Por eso el preview responde en `.../consultora/`. Si queres previsualizar en la raiz, ejecuta el preview con `PUBLIC_BASE_PATH=/`:
```powershell
$env:PUBLIC_BASE_PATH = "/"
npm run build
npm run preview:local
```

## Como obtener la IP local (Windows)

**Opcion rapida (PowerShell):**
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match '^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.' } | Select-Object -First 1 -ExpandProperty IPAddress)
```

**Alternativa clasica:**
```powershell
ipconfig
```
Busca la linea `IPv4 Address` de tu adaptador Wi-Fi.

## Firewall: abrir puerto en red privada (si el celular no accede)

> Requiere PowerShell como administrador.

```powershell
New-NetFirewallRule -DisplayName "Astro Dev 4321" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 4321 -Profile Private
```

Si usas otro puerto, reemplaza al final.

## Variables de entorno estandar

Estas variables ya estan soportadas por el repo:
- `HOST` (default `localhost`)
- `PORT` (default `4321`)
- `PUBLIC_BASE_PATH` (default `/` en dev y `/consultora` en prod)
- `PUBLIC_SITE_URL` (default `http://localhost:PORT/` en dev)

**Ejemplo LAN (forzar canonical al IP local):**
```powershell
$env:PUBLIC_SITE_URL = "http://<IP_DE_LA_PC>:4321/"
$env:HOST = "0.0.0.0"
$env:PORT = "4321"
npm run dev:lan
```

## Diagnostico de puertos ocupados

**Ver que proceso usa el puerto 4321:**
```powershell
Get-NetTCPConnection -LocalPort 4321 | Select-Object -Property LocalAddress, State, OwningProcess
```

**Ver el nombre del proceso:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 4321).OwningProcess
```

**Matar proceso (forzado):**
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 4321).OwningProcess -Force
```

## Troubleshooting rapido

- **El celular no abre la pagina:** verificar misma Wi-Fi, firewall en Windows y usar `npm run dev:lan`.
- **404 de assets en prod:** confirmar `PUBLIC_BASE_PATH` correcto y que las rutas usen `withBase()`.
- **No aparece URL publica:** si usas tunel, instalar `cloudflared` o usar `npm run dev:tunnel:lt`.

## Tunel (opcional)

Este repo trae dos opciones:
- **Cloudflare**: `npm run dev:tunnel` (requiere `cloudflared`).
- **localtunnel**: `npm run dev:tunnel:lt` (usa `npx`).

Para el flujo principal en LAN, no es necesario usar tunel. Los tuneles son un extra cuando necesitas compartir la URL fuera de la red.
