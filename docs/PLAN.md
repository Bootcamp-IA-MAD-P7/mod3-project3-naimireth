# TRAZO — Creative Content Studio

> Plan de desarrollo **v3.1** · Fecha de entrega: **martes 13 de octubre de 2026**

---

## 1. Qué es TRAZO

Estudio creativo donde un personaje recoge un icono de una plataforma social, lo lleva
a la mesa y lo convierte en contenido adaptado a esa plataforma.

**5 plataformas** · Instagram, LinkedIn, X, Blog, Pinterest
**9 tipos de contenido** · uno o más por plataforma

El requisito nuclear del proyecto es que **el estudio sea la funcionalidad principal,
no un añadido posterior**. La interfaz 2D es el producto.

---

## 2. Arquitectura

```
React (Vite + TypeScript)
  └─ HTTP/JSON ──▶ FastAPI
                    ├─▶ Prompt Engine (9 capas)
                    └─▶ LLMProvider ──▶ Groq  (real)
                                    └─▶ Fake  (tests y demos)
```

**Frontera:** React sabe **cómo se ve** TRAZO. FastAPI sabe **qué es** TRAZO.

OpenAPI es la fuente de verdad del contrato → los tipos TypeScript se generan con
`openapi-typescript`, nunca se escriben a mano.

---

## 3. Stack

### Frontend
| Herramienta | Versión | Motivo |
|---|---|---|
| Vite | 7.x | Arranque instantáneo, build rápido, TS out of the box |
| React | 19.x | Componentes declarativos para una UI con mucha estado |
| TypeScript | `strict: true` | El contrato con FastAPI exige tipos exactos |
| Motion | 12.x | Orquestación de animaciones, springs, transiciones |
| Zustand | 5.x | Un único store para toda la máquina de estados de la escena |
| SVG + CSS | — | Escena 2.5D sin WebGL (ver ADR-0002) |

**Dependencias de producción al arrancar: 4.** `react`, `react-dom`, `zustand`, `motion`.
`react-router-dom` llega en la Fase 5, MSW y `openapi-typescript` también.

### Backend
| Herramienta | Versión | Motivo |
|---|---|---|
| Python | **3.12** | Compatibilidad de wheels; la 3.14 rompe dependencias |
| FastAPI | 0.115+ | OpenAPI nativo → genera los tipos del frontend |
| Pydantic | v2 | Validación estricta, incluidos los payloads del LLM |
| pydantic-settings | 2.x | Configuración por entorno, falla rápido |
| Groq | — | LLM del Nivel 1 (D-03) |
| LangChain | mínimo | Solo si no añade fricción; alternativa nativa documentada |
| structlog | — | Logs con `request_id` para trazar un fallo de extremo a extremo |
| pytest · pytest-asyncio · httpx | — | Tests sin llamadas al LLM real |

**Sin persistencia en el Nivel 1.** Sin base de datos, sin ORM.

### Reglas transversales
- Duplicación de la versión en `package.json`, `pyproject.toml`, `.nvmrc`, `.python-version` y README → **divergen, hay un fallo**
- Ningún icono oficial de marca: **monogramas estilizados** (D-01)
- Cero secretos en el repositorio. `.env` fuera, `.env.example` dentro
- Repositorio **público** → los datos de ejemplo son ficticios

---

## 4. Estructura

```
.
├── docs/
│   ├── PLAN.md
│   ├── API_CONTRACT.md            · F2
│   ├── ARCHITECTURE.md            · F12
│   ├── SCENE_DESIGN.md            · F2
│   ├── PROMPT_ENGINEERING.md      · F12
│   ├── TESTING.md                 · F12
│   ├── GITHUB_PROJECTS.md
│   └── adr/
│       ├── 0001-frontend-react-motion.md
│       ├── 0002-escena-2.5d-sin-webgl.md
│       └── 0003-backend-fastapi-pydantic.md
├── frontend/
│   ├── src/
│   │   ├── scene/       · Backdrop, Shelf, Table, Character, CameraRig, Lighting
│   │   ├── store/       · sceneStore, transitions, stateMachine, timings
│   │   ├── components/  · Button, Panel, Chip, Counter, Toast
│   │   ├── data/        · platforms.mock, generation.mock   (Fase 1, se borran en F5)
│   │   ├── features/
│   │   │   ├── brief/
│   │   │   ├── result/renderers/   · un componente por tipo
│   │   │   └── generation/
│   │   ├── api/         · client, endpoints
│   │   ├── types/       · contrato.ts (generado)
│   │   ├── styles/      · tokens.css, scene.css
│   │   ├── assets/      · character.svg, icons
│   │   └── mocks/       · MSW (Fase 5)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── core/        · config, errors, logging
│   │   ├── api/routes/  · health, platforms, examples, meta, prompt-preview, generate
│   │   ├── domain/      · schemas, platform base + registry + 5 plataformas
│   │   ├── services/    · generation
│   │   └── prompts/     · system, blocks, platforms, renderer, composer, parsing
│   ├── tests/
│   ├── pyproject.toml
│   └── .env.example
└── scripts/             · install.bat, run.bat, run-test.bat
```

---

## 5. Gestión de Git — **manual, por decisión del responsable del proyecto**

> OpenCode **no ejecuta ninguna operación Git**: ni ramas, ni checkout, ni commits,
> ni push, ni pull, ni merge, ni rebase, ni tags, ni publicación de releases.

```
main                                   rama estable, siempre desplegable
└── dev                                rama de integración, base de todo el trabajo
    ├── feature/F01a-studio            · PR manual hacia dev
    ├── feature/F01b-platforms
    ├── feature/F01c-character-workspace
    ├── feature/F01d-mock-result
    ├── feature/F02-backend-foundation
    ├── feature/F03-prompt-engineering
    ├── feature/F04-llm-integration
    ├── feature/F05-integration
    ├── feature/F06-testing
    └── feature/F08-docs-delivery
```

**Prefijo de rama = identificador de fase.** `feature/F01a-studio` ↔ etiqueta `studio` ↔
campo `Fase = 1A` ↔ tarjeta "1A · Studio" en el tablero. El tablero y el repositorio
dicen exactamente lo mismo.

**Flujo por fase:**
1. El responsable crea `feature/F<NN><X>-<nombre>` **desde `dev`**
2. OpenCode implementa y verifica dentro de esa rama
3. El responsable revisa, hace commit, push y merge a `dev`
4. `dev` → `main` cuando la fase está estable; ahí van los tags

**Tags:** `v0.1.0-scaffold` → `v0.2.4-experience` → `v0.7.0-quality` → `v1.0.0-trazo`.
Los crea el responsable manualmente.

---

## 6. Roadmap — 12 días

| Día | Fecha | Contenido | Tag |
|---|---|---|---|
| 1 | mié 30 sep | **F0** · Fundamentos, docs, ADRs, `.gitignore`, tablero | `v0.1.0-scaffold` |
| 2 | jue 1 oct | **1A** · Studio: escena, personaje idle, cámara, botón Iniciar | |
| 3 | vie 2 oct | **1A** cierre + **1B** · 5 plataformas verticales + contrato | `v0.2.0-studio` · `v0.2.1-platforms` |
| 4 | sáb 3 oct | **1B/C** · Personaje recoge y coloca, zoom de cámara, morph | |
| 5 | dom 4 oct | **1C** · Workspace, tipo de contenido, brief, Generate | `v0.2.3-workspace` |
| **6** | **lun 5 oct** | **1D** · Mock generation, 9 renderers, resultado, **GIF** | **`v0.2.4-experience`** |
| 7 | mar 6 oct | **F2** · Backend: 6 responsabilidades, registro de plataformas | `v0.3.0-backend` |
| 8 | mié 7 oct | **F3** · Prompt engine en 9 capas + vista previa | `v0.4.0-prompts` |
| 9 | jue 8 oct | **F4** · LLMProvider + Groq + POST /api/generate | `v0.5.0-llm` |
| 10 | vie 9 oct | **F5** · React + FastAPI, borrar mocks, `run.bat` | `v0.6.0-integration` |
| 11 | sáb 10 oct | **F6** · Testing, auditoría de secretos, **repo público** | `v0.7.0-quality` |
| 12 | dom 11 oct | **F8a** · README, docs técnicas, Medium redactado | |
| 13 | lun 12 oct | **F8b** · Presentación, ensayo, Kanban cerrado · **buffer** | |
| **14** | **mar 13 oct** | **ENTREGA** · merge a main, `v1.0.0-trazo`, release, DoD | **`v1.0.0-trazo`** |

**Asignación:** F0 0,5 · **Fase 1: 5 días** · F2 1 · F3 1 · F4 1 · F5 1 · F6 1 · F8 2,5 · buffer 1.

> **`v0.2.4-experience` (día 6) es el hito de seguridad**: el producto entero funcionando con
> datos simulados y un GIF grabado, cuando aún queda más de una semana. Si algo se tuerce
> después, existe una demo presentable.

### 6.1 Detalle por día

#### Día 1 · F0 — Fundamentos
`.gitignore` antes que cualquier otro archivo · README con nombre y propuesta de valor ·
`.nvmrc` con `22.13.0` · `.python-version` con `3.12` · `LICENSE` MIT ·
`docs/PLAN.md` · 3 ADRs · `docs/GITHUB_PROJECTS.md` con las 14 tarjetas listas para crear.

#### Día 2–6 · Fase 1 — El estudio
- **1A Studio**: `Backdrop`, `Shelf` con decoración, `Table`, `character.svg`,
  idle con respiración, `CameraRig`, botón Iniciar
- **1B Plataformas**: 5 tarjetas verticales, selección con ratón y teclado,
  `docs/API_CONTRACT.md`, `data/platforms.mock.ts`
- **1C Personaje y workspace**: camina → recoge → vuelve → coloca, zoom de cámara,
  morph con `layoutId`, selección de tipo, brief con validación, Generate
- **1D Resultado**: `data/generation.mock.ts`, 9 renderers, contador de límites,
  warnings, metadatos, copiar / regenerar / volver, **grabación del GIF**

#### Día 7 · F2 — Backend
venv con Python 3.12 · `core/{config,errors,logging}` · `domain/schemas` ·
5 plataformas × 9 tipos desde el contrato · `GET /api/{health,platforms,examples,meta}` · tests

#### Día 8 · F3 — Prompts
9 capas: `system/base` · `blocks/{tone,audience,context,output_contract,language}` ·
`platforms/*.md` (5) · `platforms/types/*.md` (9) · `renderer` · `composer` ·
`parsing` · `validators` · `GET /api/prompt-preview` · auditoría parametrizada

#### Día 9 · F4 — LLM
`LLMProvider` · `FakeProvider` · `GroqProvider` · `services/generation` ·
`POST /api/generate` · tests de cada código de error sin red

#### Día 10 · F5 — Integración
`api/client` · `react-router-dom` · verificación del contrato con `openapi-typescript` ·
se borran los mocks del `src/data` · estados de carga/error/éxito reales ·
`install.bat` / `run.bat`

#### Día 11 · F6 — Calidad
Cobertura ≥ 80 % en `domain/`, `prompt_engine/`, `parsing`, `validators` ·
auditoría de la frontera · QA manual · `prefers-reduced-motion` · **auditoría de secretos**
→ **repositorio público**

#### Día 12–13 · F8 — Documentación y entrega
README final con GIF · `ARCHITECTURE.md` · `PROMPT_ENGINEERING.md` · `TESTING.md` ·
artículo de Medium · presentación de 12–13 diapositivas · ensayo de demo 3 veces ·
plan de contingencia (Groq → FakeProvider → vídeo) · Kanban a `Done` · `v1.0.0-trazo`

---

## 7. Recortes ya aplicados

El alcance original se estimaba en 18–25 días. La entrega son 12–14. Ya se recortó:

| Recorte | Ahorro |
|---|---|
| Docker → Fase 9, fuera de plazo | 1 día |
| Fase 1: 5 subfases → 4 (1B y 1C fusionadas) | 1 día |
| Ciclo de caminar: traslación + balanceo, no piernas articuladas | 0,3 día |
| Renderers con esqueleto común, no layouts a medida | 0,5 día |
| Sin grano ni parallax: sombra + gradiente + blur | 0,4 día |
| Sin E2E con Playwright | 0,5 día |
| Frontend: solo tests del store, sin objetivo de cobertura | 0,5 día |
| ADRs: 7 → 3 | 0,2 día |
| Router: Fase 1D → Fase 5 | 0,3 día |

### 7.1 Caja de seguridad — orden de corte si hay retraso

1. Instagram `reels` y LinkedIn `artículo` → 7 tipos en vez de 9
2. `GET /api/prompt-preview` → Fase 8
3. `GET /api/meta` → versión hardcodeada en la UI
4. Ejemplos precargados
5. Refinar el personaje → quiet estático con salto entre escenas
6. `GET /api/health` → una ruta `/` que devuelve OK
7. Medium sin ejemplos de código, solo capturas y diagrama

> **Punto de control duro: el día 6.** Si no hay GIF, se aplica la caja de seguridad de inmediato.

---

## 8. API

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/api/health` | Estado y versión |
| GET | `/api/platforms` | 5 plataformas × 9 tipos con sus esquemas |
| GET | `/api/examples` | Ejemplos precargados por plataforma y tipo |
| GET | `/api/meta` | Versión de prompt, modelo, Proveedor activo |
| GET | `/api/prompt-preview` | Vista previa del prompt sin llamar al LLM |
| POST | `/api/generate` | Genera contenido estructurado y validado |
| GET | `/openapi.json` | Esquema OpenAPI |
| GET | `/docs` | Documentación interactiva |

`POST /api/generate` devuelve: `content` · `metadata` (tokens, latencia, modelo,
`prompt_version`) · `warnings` (límites de plataforma) · `suggestions`

---

## 9. Definition of Done

### Entrega
- [ ] La app arranca localmente en un comando y la demo completa funciona
- [ ] 5 plataformas, 9 tipos, recorrido completo de principio a fin
- [ ] El contenido de cada tipo tiene **estructura propia**, no el mismo texto con otro formato
- [ ] Tablero Kanban en **GitHub Projects** con vistas Board y Roadmap
- [ ] Repositorio **público** con historial limpio de secretos
- [ ] README con GIF del recorrido completo
- [ ] Artículo de Medium publicado
- [ ] Presentación técnica
- [ ] `v1.0.0-trazo` en `main`

### Técnico
- [ ] 6 responsabilidades de FastAPI respetadas
- [ ] Tabla de frontera React ↔ FastAPI respetada
- [ ] Prompt en 9 capas, versionado y testeable sin LLM
- [ ] `LLMProvider` + `FakeProvider` + `GroqProvider` intercambiables
- [ ] Suite de tests en verde **sin llamadas al LLM real**
- [ ] `docs/API_CONTRACT.md` es la fuente del contrato
- [ ] 3 ADRs escritos
- [ ] 1 rama y 1 tag por subfase de la Fase 1
- [ ] Sin secretos en el repositorio ni en el historial

### Verificado como ausente (alcance del Nivel 1)
Agentes autónomos · RAG · base de datos vectorial · SEO como plataforma · despliegue ·
persistencia · multiusuario · modelos 3D propios

---

## 10. Riesgos

| ID | Riesto | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R-00 | El alcance no cabe en 12 días | Alta | Crítico | §7 caja de seguridad · control duro el día 6 · día 13 es buffer |
| R-18 | La Fase 1 se desborda (5 días para lo que eran 8–12) | Alta | Crítico | Recortes de §7 aplicados ya |
| R-01 | Rate limits de Groq en la demo | Media | Alto | `FakeProvider` · demo ensayada 3 veces · plan de contingencia |
| R-19 | Clave filtrada al hacer público el repo | Baja | Muy alto | Auditoría **antes** de publicar, no después |
| R-08 | Desincronización store ↔ animación | Media | Alto | El store solo avanza por eventos de fin de animación |
| R-02 | Python 3.14 rompe dependencias | Alta | Alto | **venv con 3.12 desde el día 1** |
| R-04 | El LLM ignora los límites de plataforma | Alta | Medio | Límites en el prompt + validador que avisa + contador visible |
| R-05 | La salida no está adaptada por plataforma | Media | Muy alto | 6 capas de prompt con reglas por plataforma · esquemas distintos |
| R-09 | Rendimiento pobre en el portátil de la demo | Media | Alto | Solo `transform`/`opacity` · ≤ 3 animaciones simultáneas |
| R-16 | Los iconos tardan más de lo previsto | Media | Medio | Monogramas simples, con fallback |
| R-24 | El artículo de Medium se queda sin tiempo | Media | Alto | Se redacta el día 12, se publica el 13 |
| R-25 | Nadie sabe ejecutar la app sin acompañamiento | Media | Alto | `install.bat` / `run.bat` verificados en máquina limpia |
| R-26 | Python 3.12 no está instalado en la máquina | **Cierta** | Alto | Requiere instalación antes de la Fase 2 |

---

## 11. Decisiones cerradas

| # | Decisión |
|---|---|
| D-01 | Iconos: monogramas estilizados SVG, cero logotipos oficiales |
| D-02 | Router en la **Fase 5** (revisada por la fecha) |
| D-03 | LLM: Groq, `llama-3.3-70b-versatile` |
| D-04 | Se mantiene el nombre remoto `mod3-project3-naimireth` |
| D-05 | Kanban: **GitHub Projects** integrado en el repositorio |
| D-06 | Repositorio **público** |
| D-07 | Entrega final: **martes 13 de octubre de 2026** |
| D-08 | Despliegue diferido a Fase 9, tras la entrega |
| **D-09** | **Gestión de Git 100 % manual. OpenCode no ejecuta operaciones Git** |
| **D-10** | **`develop` se llama `dev`. Todo el trabajo parte de `dev`** |

---

## 12. Evolución futura

- **Fase 9** (fuera de plazo): despliegue, Dockerfile, compose, vídeo publicado
- **Nivel 2**: segundo proveedor de LLM · Docker · contexto estructurado · imagen ·前的 versiones
- **Nivel 3**: SEO como tipo de contenido · LangSmith · multilingüe · noticias · RAG con arXiv
- **Nivel 4**: agentes autónomos · enrutado por intención · guardrails · evaluación automática · Graph RAG
