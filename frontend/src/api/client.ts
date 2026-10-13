/**
 * TRAZO · cliente HTTP (F08).
 *
 * Una sola puerta hacia FastAPI: centraliza la URL base, el parseo de
 * la respuesta y la traducción de los errores a algo que la interfaz
 * pueda mostrar (red, validación 422, proveedor 502, HTTP, parseo).
 *
 * La URL base sale de `VITE_API_BASE_URL`. En desarrollo se deja vacía
 * a propósito: las llamadas van a `/api/...` en el mismo origen y el
 * proxy de Vite las reenvía a FastAPI (`vite.config.ts`), de modo que
 * no hace falta CORS.
 */
import type { ApiErrorBody } from '../types/contract';

export type ApiErrorKind = 'network' | 'validation' | 'provider' | 'http' | 'parse';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;

  constructor(kind: ApiErrorKind, status: number, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/** URL base sin barra final. Vacía = mismo origen (proxy de Vite). */
export const API_BASE_URL: string = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/+$/,
  '',
);

function url(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Extrae el `detail` de un error FastAPI (string o lista de 422). */
function detailFrom(body: unknown): string {
  if (!body || typeof body !== 'object' || !('detail' in body)) {
    return '';
  }
  const detail = (body as ApiErrorBody).detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg);
        }
        return String(item);
      })
      .join('; ');
  }
  if (detail == null) {
    return '';
  }
  return JSON.stringify(detail);
}

/** Lanza el `ApiError` con el tipo adecuado según el estado HTTP. */
function errorForStatus(status: number, body: unknown): ApiError {
  const kind: ApiErrorKind =
    status === 422 ? 'validation' : status === 502 ? 'provider' : 'http';
  const detail = detailFrom(body);
  return new ApiError(kind, status, detail || `HTTP ${status}`);
}

/** Petición con respuesta JSON. Lanza `ApiError` en cualquier fallo. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url(path), init);
  } catch (cause) {
    throw new ApiError('network', 0, 'No se pudo conectar con el backend.', cause);
  }

  const raw = await response.text();
  let body: unknown = null;
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch (cause) {
      if (response.ok) {
        throw new ApiError('parse', response.status, 'El servidor devolvió una respuesta no válida.', cause);
      }
    }
  }

  if (!response.ok) {
    throw errorForStatus(response.status, body);
  }

  return body as T;
}

/** Petición POST con cuerpo JSON. */
export function postJson<T>(path: string, payload: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
}
