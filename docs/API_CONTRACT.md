# TRAZO — Contrato de la API

Documenta el contrato real del backend tal como está implementado (FastAPI +
Pydantic v2). El esquema OpenAPI generado en `GET /openapi.json` es la fuente de
verdad para los tipos del frontend.

## Tipos de endpoint

- **Informativos** (`GET`): leen catálogo, metadatos o el prompt construido.
  **Nunca** llaman al LLM ni a Groq y **nunca** exponen claves ni variables de
  entorno.
- **Generación** (`POST /api/generate`): único endpoint que llama al proveedor
  LLM (Groq, `openai/gpt-oss-20b`) y devuelve contenido validado.

Base: `http://localhost:8000`. Todos los endpoints de negocio viven bajo `/api`.

---

## `GET /health`

Estado del servicio. Se mantiene en la **raíz** (no en `/api`).

**Respuesta 200**

```json
{ "status": "ok" }
```

---

## `GET /api/platforms`

Catálogo de plataformas y sus tipos de contenido admitidos. Los datos proceden
de `PLATFORM_EXPECTATIONS` en el backend (sin listas duplicadas).

**Sin parámetros.**

**Respuesta 200**

```json
{
  "platforms": [
    {
      "id": "instagram",
      "name": "Instagram",
      "content_types": ["caption", "carrusel", "reel"],
      "max_sections": 10,
      "title_expected": false
    },
    {
      "id": "linkedin",
      "name": "LinkedIn",
      "content_types": ["post", "artículo"],
      "max_sections": null,
      "title_expected": false
    },
    {
      "id": "x",
      "name": "X",
      "content_types": ["tweet", "hilo"],
      "max_sections": 8,
      "title_expected": false
    },
    {
      "id": "blog",
      "name": "Blog",
      "content_types": ["artículo"],
      "max_sections": null,
      "title_expected": true
    },
    {
      "id": "pinterest",
      "name": "Pinterest",
      "content_types": ["pin"],
      "max_sections": 1,
      "title_expected": true
    }
  ]
}
```

- `max_sections`: número de secciones habitual de la plataforma (útil para el
  contador de límites del frontend). `null` = sin límite declarado.
- `title_expected`: si el formato de esa plataforma espera título.

Se usa en la generación como validación (`warnings` de plataforma) y se ofrecerá
al frontend para el catálogo.

---

## `GET /api/examples`

Ejemplos estáticos de briefs válidos, uno por plataforma. **No genera contenido
ni llama al LLM**: solo devuelve entradas de prueba.

**Sin parámetros.**

**Respuesta 200**

```json
{
  "examples": [
    {
      "id": "instagram-carrusel-ia",
      "label": "Carrusel educativo de Instagram",
      "brief": {
        "topic": "Qué es la inteligencia artificial",
        "platform": "Instagram",
        "audience": "personas que están empezando a aprender IA",
        "content_type": "carrusel educativo",
        "tone": "cercano y fácil de entender",
        "objective": "educar",
        "brand_context": "Somos una marca educativa especializada en Inteligencia Artificial."
      }
    }
  ]
}
```

- `brief` tiene exactamente los 7 campos de `GenerateRequest`.
- Cada ejemplo es válido y su `content_type` es coherente con los tipos de su
  plataforma (se verifica con tests).
- Hay un ejemplo por cada plataforma: `instagram`, `linkedin`, `x`, `blog`,
  `pinterest`.

---

## `GET /api/meta`

Metadatos de la API. Sin información sensible.

**Sin parámetros.**

**Respuesta 200**

```json
{
  "name": "TRAZO API",
  "version": "0.1.0",
  "provider": "groq",
  "model": "openai/gpt-oss-20b",
  "prompt_version": "1.1",
  "structured_output": { "method": "json_schema", "strict": true },
  "platforms": ["blog", "instagram", "linkedin", "pinterest", "x"],
  "documentation": "/docs"
}
```

- `version` es la versión de la app FastAPI; `prompt_version` la del prompt
  activo.
- `structured_output` describe cómo se fuerza la salida del LLM en
  `/api/generate`.
- No incluye claves API, tokens ni variables de entorno.

---

## `GET /api/prompt-preview`

Vista previa del prompt que se construiría para un brief, **sin llamar al LLM**.
Es el mismo prompt que usa `POST /api/generate` (`build_prompt()`), útil para
depurar las reglas base y las reglas por plataforma.

**Parámetros de consulta (todos opcionales, por defecto `""`)**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `platform` | string | Plataforma; si no se reconoce se aplica la regla genérica |
| `topic` | string | Tema |
| `audience` | string | Audiencia |
| `content_type` | string | Formato |
| `tone` | string | Tono |
| `objective` | string | Objetivo |
| `brand_context` | string | Contexto de marca |

**Ejemplo**

```
GET /api/prompt-preview?platform=Instagram&topic=Qué es la IA&content_type=carrusel
```

**Respuesta 200**

```json
{
  "platform": "Instagram",
  "prompt_version": "1.1",
  "model": "openai/gpt-oss-20b",
  "messages": [
    { "role": "system", "content": "<reglas base + objetivo + reglas de Instagram + salida esperada>" },
    { "role": "human", "content": "<brief con los 7 campos>" }
  ]
}
```

- Sin parámetros devuelve el prompt con brief vacío y la regla "Plataforma no
  reconocida".
- `role` usa los roles internos del prompt (`system`, `human`).
- No hay error por plataforma desconocida: es comportamiento válido del prompt.
- No expone claves ni llama a Groq.

---

## `POST /api/generate`

Genera contenido real con el LLM. Único endpoint que llama a Groq.

**Body** (`GenerateRequest`, 7 campos)

```json
{
  "topic": "Qué es la inteligencia artificial",
  "platform": "Instagram",
  "audience": "personas que están empezando a aprender IA",
  "content_type": "carrusel educativo",
  "tone": "cercano y fácil de entender",
  "objective": "educar",
  "brand_context": "Somos una marca educativa especializada en IA."
}
```

`brand_context` es opcional (por defecto `""`); el resto es obligatorio.

**Respuesta 200** (`GenerateResponse`)

```json
{
  "platform": "Instagram",
  "content_type": "carrusel educativo",
  "content": {
    "title": "¿Qué es la inteligencia artificial?",
    "sections": [{ "heading": "Slide 1", "text": "..." }],
    "hashtags": [],
    "cta": null
  },
  "metadata": {
    "model": "openai/gpt-oss-20b",
    "prompt_version": "1.1",
    "latency_ms": 995
  },
  "warnings": []
}
```

- `content`: lo genera el LLM (`title`, `sections` con mínimo 1, `hashtags`
  siempre lista, `cta` opcional).
- `metadata` y `warnings` los construye siempre el backend.
- `warnings`: avisos de brief incompleto y de adaptación a la plataforma (por
  ejemplo, un `content_type` que no es habitual en esa plataforma).

**Códigos HTTP**

| Código | Significado |
|---|---|
| `200` | Contenido generado y validado |
| `422` | Body inválido (falta algún campo obligatorio) |
| `502` | El proveedor LLM falló o devolvió una estructura no válida |

En `502` el detalle identifica el error del proveedor (código, tipo y mensaje);
nunca se oculta el error real.

---

## Documentación interactiva

| Ruta | Contenido |
|---|---|
| `GET /docs` | Swagger UI |
| `GET /openapi.json` | Esquema OpenAPI (fuente de los tipos TypeScript) |

---

## Resumen de rutas

| Método | Ruta | LLM | Propósito |
|---|---|---|---|
| `GET` | `/health` | No | Estado del servicio |
| `GET` | `/api/platforms` | No | Plataformas y tipos admitidos |
| `GET` | `/api/examples` | No | Briefs de ejemplo |
| `GET` | `/api/meta` | No | Metadatos de la API |
| `GET` | `/api/prompt-preview` | No | Vista previa del prompt |
| `POST` | `/api/generate` | Sí | Generación real |
| `GET` | `/docs` | No | Swagger UI |
| `GET` | `/openapi.json` | No | Esquema OpenAPI |
