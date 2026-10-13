/**
 * TRAZO · pruebas de `getPromptPreview` (Fase 2 · verificación de
 * Prompt Engineering).
 *
 * Sin red: `fetch` se sustituye por un doble. Se comprueba que la vista
 * previa consulta `GET /api/prompt-preview` con los siete campos del
 * brief en la URL y que no lanza ninguna petición POST.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPromptPreview } from './endpoints';
import type { GenerateRequest } from '../types/contract';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const brief: GenerateRequest = {
  topic: 'cómo elegir tela',
  platform: 'instagram',
  audience: 'principiantes',
  content_type: 'caption',
  tone: 'cercano',
  objective: 'educar',
  brand_context: 'Aula Norte',
};

const previewBody = {
  platform: 'instagram',
  prompt_version: '1.1',
  model: 'openai/gpt-oss-20b',
  messages: [
    { role: 'system', content: 'Eres TRAZO…' },
    { role: 'human', content: 'Contexto de marca: …' },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getPromptPreview', () => {
  it('consulta el endpoint con los siete campos y sin método POST', async () => {
    let called: { url: string; init?: RequestInit } | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        called = { url, init };
        return Promise.resolve(jsonResponse(previewBody));
      }),
    );

    const result = await getPromptPreview(brief);

    expect(result.messages).toHaveLength(2);
    expect(result.prompt_version).toBe('1.1');
    expect(called).not.toBeNull();
    const { url, init } = called as unknown as { url: string; init?: RequestInit };
    expect(url.startsWith('/api/prompt-preview?')).toBe(true);
    const query = new URLSearchParams(url.split('?')[1] ?? '');
    for (const [campo, valor] of Object.entries(brief)) {
      expect(query.get(campo), `el campo ${campo} viaja en la URL`).toBe(valor);
    }
    expect(init?.method).toBeUndefined();
  });
});