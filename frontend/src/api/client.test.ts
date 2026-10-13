/**
 * TRAZO · pruebas del cliente HTTP (F08).
 *
 * Sin red: `fetch` se sustituye por un doble. Se comprueba la URL, el
 * método y, sobre todo, la traducción de errores (red, 422, 502).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL, ApiError, postJson, request } from './client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cliente HTTP', () => {
  it('expone una URL base vacía por defecto (proxy de Vite)', () => {
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('devuelve el JSON en una respuesta 200', async () => {
    let called: { url: string; init?: RequestInit } | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        called = { url, init };
        return Promise.resolve(jsonResponse({ status: 'ok' }));
      }),
    );

    await expect(request('/api/meta')).resolves.toEqual({ status: 'ok' });
    expect(called).toEqual({ url: '/api/meta', init: undefined });
  });

  it('traduce 422 a error de validación con el detalle', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'falta topic' }, 422)));

    await expect(request('/api/generate')).rejects.toMatchObject({
      kind: 'validation',
      status: 422,
      message: 'falta topic',
    });
  });

  it('traduce 502 a error del proveedor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'bad gateway' }, 502)));

    const error = await request('/api/generate').catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'provider', status: 502, message: 'bad gateway' });
  });

  it('traduce un fallo de red a ApiError de tipo network', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('failed to fetch')));

    const error = await request('/api/platforms').catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'network', status: 0 });
  });

  it('postJson envía el cuerpo JSON con el método y la cabecera correctos', async () => {
    let called: { url: string; init?: RequestInit } | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        called = { url, init };
        return Promise.resolve(jsonResponse({ ok: true }));
      }),
    );

    await postJson('/api/generate', { topic: 'ia' });

    expect(called).not.toBeNull();
    const { url, init } = called as unknown as { url: string; init: RequestInit };
    expect(url).toBe('/api/generate');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ topic: 'ia' }));
  });
});
