/**
 * TRAZO · estado de la generación (F08).
 *
 * Separado del `sceneStore` a propósito: la escena manda sobre la
 * posición y la selección; aquí solo vive la solicitud al backend
 * (cargando / éxito / error) y su resultado. Mezclarlos rompería la
 * máquina de estados de F01A.
 *
 * El guardado de `status === 'loading'` evita envíos duplicados: si ya
 * hay una generación en curso, la nueva se ignora.
 */
import { create } from 'zustand';

import { ApiError, type ApiErrorKind } from '../api/client';
import { generateContent } from '../api/endpoints';
import type { GenerateRequest, GenerateResponse } from '../types/contract';

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GenerationError {
  kind: ApiErrorKind;
  status: number;
  message: string;
}

interface GenerationState {
  status: GenerationStatus;
  result: GenerateResponse | null;
  error: GenerationError | null;
  generate: (brief: GenerateRequest) => Promise<GenerateResponse | null>;
  reset: () => void;
}

function toGenerationError(cause: unknown): GenerationError {
  if (cause instanceof ApiError) {
    return { kind: cause.kind, status: cause.status, message: cause.message };
  }
  return {
    kind: 'http',
    status: 0,
    message: cause instanceof Error ? cause.message : 'Error inesperado.',
  };
}

export const useGenerationStore = create<GenerationState>()((set, get) => ({
  status: 'idle',
  result: null,
  error: null,

  generate: async (brief) => {
    if (get().status === 'loading') {
      return null;
    }
    set({ status: 'loading', error: null });
    try {
      const result = await generateContent(brief);
      set({ status: 'success', result, error: null });
      return result;
    } catch (cause) {
      set({ status: 'error', result: null, error: toGenerationError(cause) });
      return null;
    }
  },

  reset: () => set({ status: 'idle', result: null, error: null }),
}));
