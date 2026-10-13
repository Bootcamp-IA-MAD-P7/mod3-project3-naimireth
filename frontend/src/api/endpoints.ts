/**
 * TRAZO · endpoints del backend (F08).
 *
 * Cada función devuelve los tipos del contrato real
 * (`src/types/contract.ts`). Nada de URLs sueltas por los componentes:
 * todas las rutas viven aquí, y todas pasan por el cliente.
 */
import { postJson, request } from './client';
import type {
  ApiMeta,
  ExamplesResponse,
  GenerateRequest,
  GenerateResponse,
  PlatformsResponse,
} from '../types/contract';

/** `GET /api/platforms` · catálogo de plataformas y formatos admitidos. */
export function getPlatforms(signal?: AbortSignal): Promise<PlatformsResponse> {
  return request<PlatformsResponse>('/api/platforms', { signal });
}

/** `GET /api/examples` · briefs de ejemplo, uno por plataforma. */
export function getExamples(signal?: AbortSignal): Promise<ExamplesResponse> {
  return request<ExamplesResponse>('/api/examples', { signal });
}

/** `GET /api/meta` · metadatos de la API (sin datos sensibles). */
export function getMeta(signal?: AbortSignal): Promise<ApiMeta> {
  return request<ApiMeta>('/api/meta', { signal });
}

/** `POST /api/generate` · generación real con el LLM. */
export function generateContent(
  brief: GenerateRequest,
  signal?: AbortSignal,
): Promise<GenerateResponse> {
  return postJson<GenerateResponse>('/api/generate', brief, signal);
}
