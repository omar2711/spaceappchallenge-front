# Ruta del Agua

Frontend con React + Vite + TypeScript.

## Desarrollo

Requiere una versión de Node.js compatible con Vite (el proyecto se verificó con Node.js 20.20.2).

```powershell
cd D:\proyectos\spaceappchallenge-front
npm install
npm run dev
```

## Verificación

```powershell
npm run lint
npm run build
```

`npm run preview` sirve la compilación de producción localmente.

## Visor SPHEREx real (/cielo)

Las observaciones precalculadas están en public/data: cinco objetivos y tres campos
adicionales. No hace falta ejecutar FastAPI para la demo. Para actualizar los
productos desde la copia local del backend:

~~~powershell
node scripts/sync-sky-data.mjs
# O especificar otra carpeta public-data:
node scripts/sync-sky-data.mjs D:/ruta/al/backend/public-data
~~~

El catálogo, coordenadas y fechas proceden de los manifest originales.
El reproductor mantiene un solo detector entre pasadas. Incluye reproducción,
parpadeo y diferencia visual de WebP (no fotometría). El panel científico muestra
restas calibradas, imágenes profundas y mediciones por pasada con sus errores y
límites de saturación. La composición en falso color asigna D6/D4/D1 a RGB en una
misma pasada; es una representación visual, no una detección molecular.

El panorama utiliza Aladin Lite v3 desde el CDN oficial y el cubo HiPS de IRSA:
https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube
Necesita internet y WebGL. El selector tiene 102 canales; los índices 50 y 51
están vacíos en el producto publicado. Las longitudes de onda se leen de sus
metadatos, sin interpolarlas. Las series locales continúan disponibles si el mapa
externo no carga.

Las coordenadas sin una coincidencia precalculada muestran un aviso y se centran
en el panorama; aún no hay un endpoint para lanzar el pipeline por coordenadas.
Los espectros y el catálogo de hielo están pendientes en los datos del backend.
Las bandas de referencia son educativas y no confirman agua.
Fuente y tutorial: https://caltech-ipac.github.io/irsa-tutorials/spherex-hipscube/
