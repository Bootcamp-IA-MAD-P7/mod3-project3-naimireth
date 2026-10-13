/**
 * TRAZO · contrato del backend FastAPI (F08).
 *
 * Estos tipos son el espejo del contrato real documentado en
 * `docs/API_CONTRACT.md` y del esquema OpenAPI que sirve el backend en
 * `GET /openapi.json`. No inventan campos: si el backend cambia, esto
 * cambia con él.
 *
 * Nota: `content` NO es una cadena. Es un objeto estructurado
 * (`GeneratedContent`) con título opcional, secciones, hashtags y CTA.
 */

/** `GenerateRequest` · los siete campos del brief. */
export interface GenerateRequest {
  topic: string;
  platform: string;
  audience: string;
  content_type: string;
  tone: string;
  objective: string;
  /** Opcional; el backend lo trata como `""` si no llega. */
  brand_context: string;
}

/** `ContentSection` · una sección del contenido generado. */
export interface ContentSection {
  heading?: string | null;
  text: string;
}

/** `GeneratedContent` · lo que produce el LLM. */
export interface GeneratedContent {
  title?: string | null;
  sections: ContentSection[];
  hashtags: string[];
  cta?: string | null;
}

/** `GenerationMetadata` · construido siempre por el backend. */
export interface GenerationMetadata {
  model: string;
  prompt_version: string;
  latency_ms: number;
}

/** `GenerateResponse` · respuesta completa de `POST /api/generate`. */
export interface GenerateResponse {
  platform: string;
  content_type: string;
  content: GeneratedContent;
  metadata: GenerationMetadata;
  warnings: string[];
}

/** `PlatformInfo` · una plataforma del catálogo (`GET /api/platforms`). */
export interface PlatformInfo {
  id: string;
  name: string;
  content_types: string[];
  max_sections: number | null;
  title_expected: boolean;
}

export interface PlatformsResponse {
  platforms: PlatformInfo[];
}

/** `GET /api/examples` · ejemplo de brief válido. */
export interface Example {
  id: string;
  label: string;
  brief: GenerateRequest;
}

export interface ExamplesResponse {
  examples: Example[];
}

/** `GET /api/meta` · metadatos de la API (sin datos sensibles). */
export interface ApiMeta {
  name: string;
  version: string;
  provider: string;
  model: string;
  prompt_version: string;
  structured_output: { method: string; strict: boolean };
  platforms: string[];
  documentation: string;
}

/** Error del backend FastAPI: `{"detail": ...}`. */
export interface ApiErrorBody {
  detail?: unknown;
}
