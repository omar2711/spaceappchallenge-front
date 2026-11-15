# Ruta del Agua

Frontend con React + Vite + TypeScript. Consume la API Ruta del Agua
(repo `spaceappchallenge-back`; contrato en su `docs/API_FRONTEND.md`).

## Desarrollo

Requiere Node.js ^20.19 o ≥ 22.12 (lo exige Vite 8; ver `.nvmrc`).

```powershell
npm install
npm run dev
```

## Configuración

| Variable       | Por defecto                               | Uso                                                      |
| -------------- | ----------------------------------------- | -------------------------------------------------------- |
| `VITE_API_URL` | `https://ruta-del-agua-api.onrender.com`  | URL base de la API. Demo sin internet: `http://localhost:8000` (backend con `demo.bat`). |

Se lee al compilar: copia `.env.example` a `.env` (o `.env.local`) para cambiarla. El plan gratuito de
Render duerme la API tras 15 min sin uso: la primera consulta puede tardar ~30–60 s.

## Modo demo sin internet

1. Backend: `demo.bat` en la carpeta del backend (API local en `http://localhost:8000`, sin red saliente;
   `demo.bat --check` solo verifica).
2. Frontend: `demo.bat` en esta carpeta (o `npm run demo`). Compila con `.env.demo`
   (`VITE_API_URL=http://localhost:8000`) en `dist-demo/` y lo sirve en `http://localhost:5173`.
   `demo.bat D:\ruta\al\backend` abre además la API en otra ventana. `npm run dev:demo` es la variante con recarga.
   `demo.bat` usa el Node 22 portátil de `%LOCALAPPDATA%\Programs\node22` (u otra carpeta en `NODE22_DIR`) antes
   que el del sistema, y se detiene con un aviso si solo encuentra un Node demasiado antiguo para Vite 8.

Sin internet funcionan los 5 objetivos y los campos precalculados (imágenes, espectros, clic para medir, Gaia,
visibilidad desde Cochabamba), la Luna (sitios, Sol y Tierra), la caminata de Marte, Hielo, Abandonados y el
sistema solar 3D. No cargan los mosaicos de Moon Trek y Mars Trek (los mapas lo avisan), ni el panorama
Aladin de `/cielo`, ni las coordenadas nuevas (necesitan IRSA; el visor lo explica).

## Verificación

```powershell
npm run lint
npm run build
```

`npm run preview` sirve la compilación de producción localmente.

## Estructura

- `src/api/`: cliente HTTP (`client.ts`), tipos del contrato (`types.ts`) y una función por endpoint.
- `src/features/`: cada pantalla (`sky-viewer`, `moon-map`, `mars-map`, `ice`, `abandoned`, `solar-system`).
- `src/pages/`: rutas que montan cada feature. `src/components/charts/`: gráfico SVG compartido.
- `public/`: archivos estáticos (texturas).

| Ruta             | Qué muestra                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `/cielo`         | Imágenes de SPHEREx por pasada (campos conocidos o `POST /custom`), diferencias, espectro, curva de luz, Gaia y visibilidad desde Cochabamba. |
| `/luna`          | Sitios Apollo y Artemis III (`/moon/sites`) y Sol/Tierra a la vista (`/moon/visibility`).    |
| `/marte`         | Capas de Mars Trek y la caminata real de Perseverance en Jezero (`/mars/marswalk`).           |
| `/hielo`         | Fuentes candidatas a hielo (SPLICES) y el cometa interestelar 3I/ATLAS.                       |
| `/abandonados`   | Equipo que la NASA dejó en la Luna, Marte y más allá.                                          |
| `/sistema-solar` | Sistema solar 3D con posiciones de JPL Horizons.                                               |

## Panorama del cielo y copia local de datos

En `/cielo`, debajo del visor, el panorama usa Aladin Lite 3.8.2 (módulo ES desde jsDelivr) con el cubo HiPS de IRSA
(https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube). Necesita internet y WebGL; tiene
102 canales y los índices 50 y 51 están vacíos en el producto publicado. Si no carga, el resto del visor
sigue funcionando. La composición en falso color asigna D6/D4/D1 a RGB en una misma pasada; es una
representación visual, no una detección molecular.

`public/data/` tiene una copia de los productos del backend (`targets/` y `custom/`). El visor actual lee
los datos de la API (`VITE_API_URL`), no de esa copia. Para actualizarla:

```powershell
node scripts/sync-sky-data.mjs D:/ruta/al/backend/public-data
```

## Despliegue (sitio estático)

Es un SPA: todas las rutas deben reescribirse a `/index.html` (los archivos que existen se sirven tal cual).

**Render** (blueprint `render.yaml`): New → Blueprint → elegir este repo → Apply. Crea el sitio estático
`ruta-del-agua-web` con `npm ci && npm run build`, publica `dist/`, define `VITE_API_URL` y la regla
`/* → /index.html`.

**Vercel** (`vercel.json`): Add New → Project → importar este repo (framework Vite). En Environment
Variables, `VITE_API_URL=https://ruta-del-agua-api.onrender.com`. La reescritura ya está en `vercel.json`.

La API ya permite CORS desde cualquier origen, así que no hay que configurar nada en el backend.
