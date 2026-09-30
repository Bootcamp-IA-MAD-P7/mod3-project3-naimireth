# TRAZO — Creative Content Studio

> Un estudio donde un personaje recoge un icono de una plataforma social, lo lleva a la mesa
> y lo convierte en contenido adaptado a esa plataforma.

![Estado](https://img.shields.io/badge/estado-en%20construcci%C3%B3n-dcae28)
![Licencia](https://img.shields.io/badge/licencia-MIT-8bc34f)
![Plan](https://img.shields.io/badge/plan-v3.1-4a90d9)

<!-- El GIF del recorrido completo se graba en la Fase 1D (día 6) y se inserta aquí. -->

## Qué hace

- **5 plataformas**: Instagram, LinkedIn, X, Blog, Pinterest
- **9 tipos de contenido**, uno o más por plataforma
- Un estudio 2.5D donde el personaje recoge el icono de la plataforma elegida y lo lleva a la mesa
- Generación con un LLM real, con prompts versionados y salida validada

## Arquitectura

```
React (Vite + TypeScript)  ──HTTP/JSON──▶  FastAPI
                                            ├─▶ Prompt Engine (9 capas)
                                            └─▶ LLMProvider ──▶ Groq
                                                            └─▶ Fake  (tests y demos)
```

React sabe **cómo se ve** TRAZO. FastAPI sabe **qué es** TRAZO.
El esquema OpenAPI es la fuente de los tipos TypeScript.

## Stack

**Frontend** · Vite · React · TypeScript `strict` · Motion · Zustand · SVG + CSS 2.5D
**Backend** · Python 3.12 · FastAPI · Pydantic v2 · Groq · pytest

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/PLAN.md`](docs/PLAN.md) | Plan de desarrollo v3.1, roadmap, DoD y riesgos |
| [`docs/GITHUB_PROJECTS.md`](docs/GITHUB_PROJECTS.md) | Configuración del tablero Kanban |
| [`docs/adr/`](docs/adr/) | Decisiones de arquitectura y sus alternativas descartadas |

## Estado

🚧 **En construcción.** El README definitivo, con el GIF del recorrido, capturas,
instrucciones de arranque y ejemplos reales, se completa en la Fase 8.

Consulta [`docs/PLAN.md`](docs/PLAN.md) para el detalle del desarrollo.

## Contribución

Las ramas, commits, merges y tags los gestiona manualmente el responsable del proyecto.
Ver la sección de Git en [`docs/PLAN.md`](docs/PLAN.md#5-gestión-de-git--manual-por-decisión-del-responsable-del-proyecto).

## Licencia

MIT · [LICENSE](LICENSE)
