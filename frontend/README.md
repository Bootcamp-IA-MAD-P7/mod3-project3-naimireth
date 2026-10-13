# TRAZO · Frontend

Interfaz de TRAZO (React + TypeScript + Vite). Cada fase de la experiencia se muestra
como una pantalla propia (`Experience` → `stages/`) y consume el backend FastAPI.

## Requisitos

- Node ≥ 22.13 (ver `.nvmrc` / `engines` en `package.json`).
- El backend FastAPI en marcha (ver `../backend` o el arranque de abajo).

## Instalación

```bash
npm install
```

## Arranque en desarrollo

### 1. Backend (FastAPI, puerto 8000)

```bash
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### 2. Frontend (Vite, puerto 5173)

```bash
cd frontend
npm run dev
```

Abre http://localhost:5173.

### Comunicación entre ambos (proxy de Vite)

En desarrollo, `VITE_API_BASE_URL` se deja **vacía** (valor por defecto): el
frontend llama a rutas relativas `/api/...` en su mismo origen y el proxy de
`vite.config.ts` las reenvía a `http://localhost:8000`. Como el navegador solo
ve un origen, **no hace falta CORS** en FastAPI.

Si prefieres apuntar directamente al backend sin proxy, copia `.env.example` a
`.env` y define la URL absoluta:

```
VITE_API_BASE_URL=http://localhost:8000
```

En ese caso el backend tendría que permitir CORS para `http://localhost:5173`.
`VITE_API_BASE_URL` nunca debe contener claves ni secretos: el frontend no
guarda ningún secreto.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con proxy a FastAPI |
| `npm run build` | `tsc -b` + build de producción |
| `npm run typecheck` | Comprueba los tipos TypeScript (`tsc -b --noEmit`) |
| `npm run lint` | Oxlint |
| `npm test` | Vitest en modo ejecución |
| `npm run test:watch` | Vitest en modo vigilancia |
| `npm run preview` | Sirve el build de producción |

## Arquitectura

- `src/App.tsx` → `src/features/app/Experience.tsx`: punto de entrada. `Experience`
  monta el fondo geométrico y, por cada fase de la máquina, la pantalla que devuelve
  `stages/stageOf.tsx`.
- `src/store/stateMachine.ts`: las cinco escenas (`ARRIVAL`, `SHELF_SELECTION`,
  `THEME`, `CONFIGURATION`, `RESULT`).
- `src/store/`: `sceneStore` (fase y plataforma), `briefStore` (los siete campos del
  brief, catálogo y ejemplos) y `generationStore` (carga/éxito/error de la generación).

## Estructura relevante

- `src/api/client.ts` — cliente HTTP único (URL base, `ApiError` tipado).
- `src/api/endpoints.ts` — funciones por endpoint: `getPlatforms`, `getExamples`,
  `getMeta`, `getPromptPreview`, `generateContent`.
- `src/types/contract.ts` — tipos del contrato de `docs/API_CONTRACT.md` (espejo
  escrito a mano).
- `src/data/platforms.ts` — catálogo de plataformas de respaldo (fallback).
- `src/features/app/Experience.tsx` — orquestador del recorrido por pantallas.
- `src/features/app/stages/` — pantallas del recorrido: `WelcomeStage`, `ShelfStage`,
  `ThemeStage`, `ConfigStage`, `ResultStage` (y `stageOf.tsx`).
- `src/features/app/stages/brief/` — formularios y vistas conectadas al backend:
  `ThemeStageForm`, `ConfigStageForm`, `ResultStageView`, `PromptPreview`.
- `src/features/platforms/` — `PlatformCarousel`, `PlatformCard`.
- `src/features/brief/`, `src/features/result/`, `src/features/workspace/` — componentes
  de la escena anterior (`ThemeForm`, `ConfigForm`, `ResultView`, `Workspace`).
- `src/scene/` — escena 2.5D conservada en el código, **fuera del recorrido actual**.
- `src/styles/` — `tokens.css`, `experience.css`, `brief.css`, `carousel.css`,
  `scene.css`, `workspace.css`.

## Assets

Las tarjetas PNG que usa la interfaz (carrusel de plataformas) están en
`frontend/public/visual/redes_sociales_png_corregido/`, servidas por Vite desde la raíz
pública (`/visual/...`). Las referencias de diseño (storyboard del personaje y del
estudio) viven en `docs/visual/` y **no** se cargan en tiempo de ejecución.
