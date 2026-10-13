# TRAZO · Frontend

Interfaz de TRAZO (React + TypeScript + Vite). El estudio 2.5D usa los assets
de `docs/visual/` sin redibujarlos; desde F08 la interfaz consume el backend
FastAPI.

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
| `npm run typecheck` | Comprueba los tipos TypeScript |
| `npm run lint` | Oxlint |
| `npm test` | Vitest (sin DOM, lógica pura) |
| `npm run preview` | Sirve el build de producción |

## Estructura relacionada con F08

- `src/api/client.ts` — cliente HTTP único (URL base, errores tipados).
- `src/api/endpoints.ts` — funciones por endpoint del backend.
- `src/types/contract.ts` — tipos del contrato de `docs/API_CONTRACT.md`.
- `src/store/generationStore.ts` — estado de la generación (cargando/éxito/error).
- `src/features/brief/BriefForm.tsx` — formulario de los siete campos.
- `src/features/result/ResultView.tsx` — resultado estructurado.
- `src/features/workspace/Workspace.tsx` — orquestación: catálogo, ejemplos,
  generación y resultado.