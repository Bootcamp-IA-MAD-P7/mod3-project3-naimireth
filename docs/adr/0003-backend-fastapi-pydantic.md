# ADR-0003 · Backend con FastAPI y Pydantic, contrato único OpenAPI

> **Estado**: Aceptada · **Fecha**: 2026-09-30 · **Fase**: F0

---

## Contexto

El proyecto es **un sistema de dos stacks**: una app React que ya está construida y
validada, y un backend que hay que construir desde cero. El riesgo principal de esta
arquitectura no estechnology, es el **contrato**: si el backend devuelve una forma
distinta de la que el frontend espera, todo falla y no hay forma de detectarlo hasta
tarde.

Además, la salida del LLM es texto libre. Hay que convertirla en una estructura
validada por tipo de contenido, con límites de plataforma, y hacerlo **de forma
testeable sin pagar tokens**.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| **FastAPI + Pydantic v2** (elegida) | **OpenAPI nativo**: el esquema se genera solo y de ahí salen los tipos TypeScript · Pydantic v2 valida también la salida del LLM, no solo la entrada · typed en todas las capas · async natively | Ecosistema más pequeño que Django |
| Django + DRF | ORM, admin y auth de serie | OpenAPI de terceros, con más configuración · Pydantic v2 no se integra bien · `django` es mucho peso para una API de 8 rutas sin persistencia |
| Flask | Simple y conocido | Sin validación con Pydantic de forma nativa · OpenAPI manual · el tipado se pierde justo donde más importa |
| Node + Express | Un solo lenguaje en todo el proyecto | El uso de Pydantic es un objetivo formativo explícito · peor encaje con el objetivo del bootcamp |
| Next.js API routes | Fusiona los dos stacks | Dos Implantaciones de frontend y backend mezcladas; peor separación; el servidor es Python |

## Decisión

**FastAPI + Pydantic v2, con OpenAPI como fuente única del contrato.**

**Pydantic v2 se usa en las dos fronteras**, y esa es la decisión de fondo:

1. **Frontera de entrada** — valida el `BriefRequest`.
2. **Frontera de salida del LLM** — valida la respuesta cruda contra el esquema del tipo
   de contenido. Si el modelo devuelve algo que no encaja, se reintenta **una vez** y,
   si vuelve a fallar, se devuelve un error controlado con el detalle de qué campo falló.
3. **Frontera de la API** — el `ContentResponse` que ve el frontend.

Como el mismo esquema sirve para las tres, **el frontend puede generar sus tipos desde
el mismo lugar que valida al LLM**. No hay dos definiciones que puedan divergir.

**OpenAPI es la fuente de la verdad del contrato.** Los tipos TypeScript se generan con
`openapi-typescript` desde `/openapi.json` y se comparan contra los tipos del frontend
en la Fase 5, **antes** de borrar los mocks. Si difieren, se corrige ahí.

**Groq** como proveedor del Nivel 1 (D-03), tras un contrato `LLMProvider` con
`FakeProvider` para que toda la suite de tests corra **sin red y sin coste**.

**Sin persistencia.** Sin base de datos, sin ORM, sin sesiones.

**Python 3.12**, no la 3.14 del sistema: la 3.14 rompe wheels de varias dependencias.

## Consecuencias

**A favor**
- Una sola definición de la forma de los datos, validada en las tres fronteras
- El contrato se verifica en el build, no en la demo
- `FakeProvider` hace la suite completa determinista, offline y gratuita
- `/docs` y `/openapi.json` salen gratis y sirven de documentación

**En contra**
- Hay que mantener el paralelismo entre esquemas Pydantic y tipos TS
- Validar la salida del LLM **no garantiza** que el contenido sea bueno, solo que tiene
  la forma correcta. La calidad depende de las capas de prompt (R-04, R-05)

**Deuda técnica asumida**
LangChain queda como opción del Nivel 2–3. En el Nivel 1 el cliente Groq nativo cubre el
caso de uso y evita acoplar el proyecto a una API que cambia entre versiones. Si no
aporta nada en la Fase 4, no se añade: **la abstracción `LLMProvider` ya es la
demostración de arquitectura que pide el objetivo del proyecto.**
