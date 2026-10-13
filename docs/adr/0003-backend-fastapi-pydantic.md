# ADR-0003 · Backend con FastAPI y Pydantic, contrato único OpenAPI

> **Estado**: Aceptada · **Fecha**: 2026-09-30 · **Fase**: F0
>
> *Revisión posterior:* se documenta la implementación real (LangChain, manejo de
> errores) y las desviaciones respecto al diseño previsto. La decisión de fondo
> (FastAPI + Pydantic v2) sigue vigente.

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

**Pydantic v2 se usa en las fronteras de la API**, y esa es la decisión de fondo:

1. **Frontera de entrada** — valida el `GenerateRequest` (los siete campos del brief).
2. **Frontera de salida del LLM** — la salida estructurada se pide con
   `ChatGroq.with_structured_output(GeneratedContent, method="json_schema",
   strict=True)`, de modo que el modelo devuelve directamente el esquema
   `GeneratedContent` (título opcional, secciones, hashtags y CTA).
3. **Frontera de la API** — el `GenerateResponse` que ve el frontend.

Como el mismo esquema Pydantic define la forma de los datos, el contrato queda validado
en las fronteras de la API. (El diseño hablaba de «generar los tipos del frontend desde
el mismo lugar»; ver *Desviaciones* más abajo.)

**OpenAPI expone el contrato** en `/openapi.json` y `/docs`. El diseño preveía generar
los tipos TypeScript con `openapi-typescript`; en la implementación real los tipos se
escriben a mano en `frontend/src/types/contract.ts`, como espejo de
`docs/API_CONTRACT.md`.

**Groq** como proveedor del Nivel 1 (D-03), usando **LangChain** (`ChatGroq`). El diseño
preveía un contrato `LLMProvider` con un `FakeProvider` intercambiable; la implementación
real tiene solo la clase concreta `GroqProvider`.

**Sin persistencia.** Sin base de datos, sin ORM, sin sesiones.

**Python 3.12**, no la 3.14 del sistema: la 3.14 rompe wheels de varias dependencias.

## Consecuencias

**A favor**
- Una sola definición de la forma de los datos, validada en la frontera de entrada y en
  la salida estructurada del LLM
- El contrato vive en `docs/API_CONTRACT.md` y se refleja en los tipos del frontend
- La suite corre sin red y sin coste porque los endpoints informativos no llaman al
  LLM y el test de generación no invoca a Groq (no hay `FakeProvider`)
- `/docs` y `/openapi.json` salen gratis y sirven de documentación

**En contra**
- Hay que mantener el paralelismo entre esquemas Pydantic y tipos TS
- Validar la salida del LLM **no garantiza** que el contenido sea bueno, solo que tiene
  la forma correcta. La calidad depende de las capas de prompt (R-04, R-05)

**Deuda técnica asumida**
El diseño original prefería el cliente Groq nativo y dejar LangChain para el Nivel 2–3.
La implementación real tomó el camino contrario: **LangChain sí se usa** (ver
*Desviaciones*).

**Desviaciones respecto al diseño previsto (revisión de documentación)**

- **LangChain sí se usa.** `ChatPromptTemplate` (de `langchain-core`) construye el
  prompt en `app/prompts/prompt_engine.py` y `ChatGroq` (de `langchain-groq`) es el
  cliente del modelo en `app/providers/groq_provider.py`, con salida estructurada
  `method="json_schema"`, `strict=True` y `temperature=0.7`.
- **No existen `LLMProvider` ni `FakeProvider`.** Solo hay la clase concreta
  `GroqProvider`. Los tests no llaman al LLM real porque los endpoints informativos no
  lo invocan y no hay tests de red.
- **No hay reintentos.** Frente al «se reintenta una vez» del diseño original, el manejo
  de errores de `/api/generate` (`app/api/routes/generate.py`) es directo:
  `OutputParserException` → `502` «El modelo devolvió una estructura no válida», y
  `APIStatusError` de Groq → `502` con el código, el tipo y el mensaje del proveedor.
- **La validación de la salida** la fuerza el esquema `json_schema` estricto del propio
  modelo, no una validación posterior con reintento.
- **Los tipos del frontend no se generan.** Se escriben a mano en
  `frontend/src/types/contract.ts`.
