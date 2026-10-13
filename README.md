# TRAZO — Creative Content Studio

> Del icono a la publicación. TRAZO recoge la plataforma social que elijas, trae la
> idea a tu mesa y la convierte en contenido adaptado a esa plataforma.

![Estado](https://img.shields.io/badge/estado-en%20construcci%C3%B3n-dcae28)
![Licencia](https://img.shields.io/badge/licencia-MIT-8bc34f)
![Plan](https://img.shields.io/badge/plan-v3.1-4a90d9)

## Qué problema resuelve

Escribir para cada red social es repetitivo: el tono, la extensión y el formato no
son los mismos en Instagram, LinkedIn, X, Blog o Pinterest. TRAZO parte de un
**brief** (tema, plataforma, audiencia, tipo de contenido, tono, objetivo y contexto
de marca) y **genera contenido real** con un LLM, adaptado a esa plataforma y con la
estructura propia de cada tipo de contenido.

## Funcionalidades implementadas

- **Recorrido por pantallas**: bienvenida → selección de plataforma → tema →
  configuración → resultado, con un fondo geométrico común y transiciones entre planos.
- **Carrusel de 5 plataformas** (Instagram, LinkedIn, X, Blog, Pinterest) sobre las
  tarjetas reales del proyecto.
- **Brief de 7 campos** repartido entre las pantallas de Tema y Configuración, con
  validación y **ejemplos precargados** que vienen del backend.
- **Catálogo real de plataformas y formatos** (`GET /api/platforms`), que alimenta las
  opciones del formulario (los tipos de contenido no están escritos a mano en la UI).
- **Vista previa del prompt** (`GET /api/prompt-preview`): muestra el prompt que usaría
  la generación real **sin llamar al LLM**.
- **Generación real** (`POST /api/generate`) con Groq, salida estructurada validada,
  `warnings` de adaptación a la plataforma y metadatos (modelo, versión de prompt,
  latencia).
- **Resultado estructurado**: título, secciones, hashtags y llamada a la acción, con
  avisos y metadatos discretos.
- **Estados de carga y error** de red, validación (422) y proveedor (502) reflejados en
  la interfaz.

Lo que **todavía no** está implementado se detalla en [Limitaciones](#limitaciones).

## Tecnologías y su función

**Frontend**

- **React 19** + **TypeScript `strict`**: interfaz declarativa con el contrato tipado.
- **Vite**: servidor de desarrollo (con proxy a la API) y build de producción.
- **Motion**: transiciones y microinteracciones; respeta `prefers-reduced-motion`.
- **Zustand**: stores de la máquina de escenas, del brief y de la generación.
- **Vitest** y **oxlint**: tests y lint.

**Backend**

- **FastAPI**: API HTTP con OpenAPI (`/docs`, `/openapi.json`).
- **Pydantic v2**: valida la entrada y la salida estructurada del LLM.
- **LangChain** (`langchain-core`, `langchain-groq`) + **Groq**: construcción del prompt
  (`ChatPromptTemplate`) y cliente del modelo (`ChatGroq`).
- **python-dotenv**: carga de `GROQ_API_KEY` desde `backend/.env`.
- **pytest**: suite de tests que no llama al LLM real.

## Arquitectura

```
React (Vite + TypeScript)
  └─ HTTP/JSON ──▶ FastAPI (routers generate + info)
                     ├─▶ Prompt engine (build_prompt) ─▶ ChatPromptTemplate
                     └─▶ GroqProvider (ChatGroq) ──▶ Groq
```

- **React sabe cómo se ve TRAZO** (pantallas, animación, estado de la escena).
- **FastAPI sabe qué es TRAZO** (catálogo, prompt, generación y validación).
- El contrato de la API está documentado en [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md);
  el frontend replica esos tipos en `frontend/src/types/contract.ts`.

## Estructura del monorepo

```
.
├── backend/
│   ├── app/
│   │   ├── api/routes/     · generate.py, info.py
│   │   ├── models/         · content.py, info.py
│   │   ├── prompts/        · prompt_engine.py, base_rules.py, platform_rules.py
│   │   ├── providers/      · groq_provider.py
│   │   ├── data/           · examples.py
│   │   └── main.py
│   ├── tests/              · test_generate_contract.py, test_info_endpoints.py,
│   │                         test_platform_expectations.py, test_prompt_engine.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/visual/      · tarjetas PNG de las plataformas y storyboard
│   ├── src/
│   │   ├── api/            · client.ts, endpoints.ts
│   │   ├── data/           · platforms.ts (fallback del catálogo)
│   │   ├── features/app/   · Experience.tsx y stages/ (pantallas del recorrido)
│   │   ├── features/       · platforms/, brief/, result/, workspace/ (escena previa)
│   │   ├── scene/          · escena 2.5D conservada, fuera del recorrido actual
│   │   ├── store/          · sceneStore, briefStore, generationStore, stateMachine
│   │   ├── styles/         · tokens.css y hojas por pantalla
│   │   └── types/          · contract.ts (espejo del contrato)
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── PLAN.md
│   ├── API_CONTRACT.md
│   ├── GITHUB_PROJECTS.md
│   ├── adr/                · 0001, 0002, 0003
│   └── visual/             · referencias de diseño
└── experiments/llm/        · pruebas sueltas de Groq/LangChain (fuera del producto)
```

## Requisitos previos

- **Node.js ≥ 22.13** (ver `.nvmrc` y `engines` en `frontend/package.json`).
- **Python 3.12** (ver `.python-version`). El proyecto se diseñó para 3.12; la 3.14
  puede romper dependencias.
- Una **clave de Groq** para la generación real.

> **Aviso de entorno.** En la revisión documental se detectó que el entorno virtual
> local (`backend/.venv`) está compilado como **CPython 3.14**, en desacuerdo con
> `.python-version` (3.12). Como la 3.14 puede romper dependencias, conviene recrear el
> entorno virtual con 3.12. No se ha cambiado ninguna configuración automáticamente.

## Instalación y ejecución

### 1. Backend (FastAPI, puerto 8000)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crea `backend/.env` a partir de `backend/.env.example` y rellena la clave:

```
GROQ_API_KEY=tu_clave_de_groq
```

Arráncalo:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend (Vite, puerto 5173)

```powershell
cd frontend
npm install
npm run dev
```

Abre <http://localhost:5173>.

### Comunicación entre ambos

En desarrollo, `VITE_API_BASE_URL` se deja **vacía**: el frontend llama a rutas
relativas `/api/...` en su mismo origen y el proxy de `vite.config.ts` las reenvía a
`http://localhost:8000`. Como el navegador ve un solo origen, **no hace falta CORS**.

## Variables de entorno

| Variable | Dónde | Obligatoria | Descripción |
|---|---|---|---|
| `GROQ_API_KEY` | `backend/.env` | Sí (para generar) | Clave de Groq. Nunca se expone por la API ni se incluye en el repositorio. |
| `VITE_API_BASE_URL` | `frontend/.env` | No | URL base absoluta de la API. Vacía = mismo origen + proxy de Vite. No debe contener secretos. |

`.env` está en `.gitignore`; solo se versiona `.env.example`. La generación real
requiere `GROQ_API_KEY`; los endpoints informativos y los tests **no** la necesitan.

## Endpoints

El contrato completo (esquemas, ejemplos y errores) está en
[`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

| Método | Ruta | LLM | Propósito |
|---|---|---|---|
| `GET` | `/health` | No | Estado del servicio (en la raíz, no bajo `/api`) |
| `GET` | `/api/platforms` | No | 5 plataformas y sus formatos admitidos |
| `GET` | `/api/examples` | No | Briefs de ejemplo, uno por plataforma |
| `GET` | `/api/meta` | No | Metadatos de la API (sin datos sensibles) |
| `GET` | `/api/prompt-preview` | No | Prompt construido para un brief, sin llamar al LLM |
| `POST` | `/api/generate` | Sí | Generación real con Groq |
| `GET` | `/docs` | No | Swagger UI |
| `GET` | `/openapi.json` | No | Esquema OpenAPI |

`POST /api/generate` devuelve `content` (estructurado), `metadata` (modelo, versión de
prompt, latencia) y `warnings` (brief incompleto o formato poco habitual en la
plataforma).

## Calidad: tests, lint, typecheck y build

**Frontend** (desde `frontend/`):

| Comando | Qué hace |
|---|---|
| `npm test` | Vitest en modo ejecución |
| `npm run test:watch` | Vitest en modo vigilancia |
| `npm run lint` | Oxlint |
| `npm run typecheck` | Comprobación de tipos (`tsc -b --noEmit`) |
| `npm run build` | `tsc -b` + build de producción |
| `npm run dev` | Servidor de desarrollo |
| `npm run preview` | Sirve el build de producción |

**Backend** (desde `backend/`, con el entorno virtual activado):

```powershell
python -m pytest
```

> **Nota sobre los tests del backend:** `requirements.txt` **no incluye `pytest`**. Para
> ejecutarlos hay que instalarlo además (`pip install pytest`). La suite usa
> `fastapi.testclient` (que necesita `httpx`, ya presente) y **no llama al LLM real**.

## Limitaciones

- **Sin persistencia**: no hay base de datos ni sesiones; cada generación es puntual.
- **Sin autenticación ni multiusuario.**
- **Sin despliegue**: no hay Dockerfile ni configuración de producción.
- **Proveedor único**: solo Groq. No existe todavía la abstracción `LLMProvider` con un
  `FakeProvider` intercambiable; el código usa una clase concreta `GroqProvider`.
- **Sin reintentos**: si el proveedor falla o devuelve una estructura inválida, la API
  responde `502` y no reintenta.
- **Prompt en 2 mensajes** (reglas base + objetivo + reglas de plataforma + salida
  esperada) y no en las «9 capas» que describe el diseño original.
- **Tipos del frontend escritos a mano** (`frontend/src/types/contract.ts`); no se
  generan con `openapi-typescript`.
- **La escena 2.5D** (`frontend/src/scene/` y la antigua escena del estudio) **se
  conserva en el código pero no forma parte del recorrido**: el punto de entrada actual
  es `Experience`.
- **Sin E2E automatizado** ni router de cliente.
- **Artefactos de entrega pendientes**: GIF del recorrido, artículo de Medium,
  presentación y cierre del tablero Kanban.

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/PLAN.md`](docs/PLAN.md) | Plan de desarrollo v3.1, roadmap, DoD y riesgos |
| [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) | Contrato real de la API |
| [`docs/GITHUB_PROJECTS.md`](docs/GITHUB_PROJECTS.md) | Configuración del tablero Kanban |
| [`docs/adr/`](docs/adr/) | Decisiones de arquitectura y sus alternativas descartadas |
| [`frontend/README.md`](frontend/README.md) | Detalle del frontend y su arranque |

## Artículo

- [TRAZO — Del icono a la publicación (Medium)](https://medium.com/@naimicastrillo/trazo-d66a5ffbcb27)

## Contribución

Las ramas, commits, merges y tags los gestiona manualmente el responsable del proyecto.
Ver la sección de Git en [`docs/PLAN.md`](docs/PLAN.md).

## Licencia

MIT · [LICENSE](LICENSE)
