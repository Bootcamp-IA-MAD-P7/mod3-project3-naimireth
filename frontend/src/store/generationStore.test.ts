/**
 * TRAZO · pruebas del estado de generación (F08).
 *
 * Se sustituye el módulo de endpoints: ni red ni LLM. Se comprueban
 * las transiciones (idle → loading → success / error), la traducción
 * del error y el bloqueo de envíos duplicados.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../api/client';
import type { GenerateRequest, GenerateResponse } from '../types/contract';

const generateContent = vi.hoisted(() => vi.fn());

vi.mock('../api/endpoints', () => ({ generateContent }));

import { useGenerationStore } from './generationStore';

const brief: GenerateRequest = {
  topic: 't',
  platform: 'instagram',
  audience: 'a',
  content_type: 'caption',
  tone: 'x',
  objective: 'o',
  brand_context: '',
};

const response: GenerateResponse = {
  platform: 'Instagram',
  content_type: 'caption',
  content: { title: null, sections: [{ heading: null, text: 'hola' }], hashtags: [], cta: null },
  metadata: { model: 'openai/gpt-oss-20b', prompt_version: '1.1', latency_ms: 1 },
  warnings: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  useGenerationStore.getState().reset();
});

describe('generationStore', () => {
  it('arranca en idle', () => {
    const state = useGenerationStore.getState();
    expect(state.status).toBe('idle');
    expect(state.result).toBeNull();
    expect(state.error).toBeNull();
  });

  it('pasa a success y guarda el resultado', async () => {
    generateContent.mockResolvedValueOnce(response);

    const out = await useGenerationStore.getState().generate(brief);

    expect(generateContent).toHaveBeenCalledWith(brief);
    expect(out).toEqual(response);
    const state = useGenerationStore.getState();
    expect(state.status).toBe('success');
    expect(state.result).toEqual(response);
    expect(state.error).toBeNull();
  });

  it('pasa a error con el tipo traducido (502 del proveedor)', async () => {
    generateContent.mockRejectedValueOnce(new ApiError('provider', 502, 'boom'));

    const out = await useGenerationStore.getState().generate(brief);

    expect(out).toBeNull();
    const state = useGenerationStore.getState();
    expect(state.status).toBe('error');
    expect(state.result).toBeNull();
    expect(state.error).toEqual({ kind: 'provider', status: 502, message: 'boom' });
  });

  it('ignora una segunda generación mientras hay una en curso', async () => {
    let resolve!: (value: GenerateResponse) => void;
    generateContent.mockImplementationOnce(
      () => new Promise<GenerateResponse>((r) => { resolve = r; }),
    );

    const first = useGenerationStore.getState().generate(brief);
    const second = await useGenerationStore.getState().generate(brief);

    expect(second).toBeNull();
    expect(generateContent).toHaveBeenCalledTimes(1);

    resolve(response);
    await first;
    expect(useGenerationStore.getState().status).toBe('success');
  });

  it('reset vuelve a idle y limpia el resultado', async () => {
    generateContent.mockResolvedValueOnce(response);
    await useGenerationStore.getState().generate(brief);

    useGenerationStore.getState().reset();

    const state = useGenerationStore.getState();
    expect(state.status).toBe('idle');
    expect(state.result).toBeNull();
    expect(state.error).toBeNull();
  });
});
