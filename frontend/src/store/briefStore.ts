/**
 * TRAZO · estado del brief (Etapa 3 · rediseño conectado al backend).
 *
 * La lógica que antes vivía en `Workspace` (catálogo `GET /api/platforms`,
 * ejemplos `GET /api/examples` y el brief con sus validaciones) sube a
 * un store porque las pantallas Tema, Configuración y Resultado cambian
 * de fase en `Experience` y se desmontan/re-montan: el formulario tiene
 * que sobrevivir a ese tránsito (persistencia entre planos).
 *
 * Vista la máquina, el brief se resetea cuando cambia la plataforma
 * elegida, nunca al navegar entre planos de la misma plataforma.
 *
 * La generación NO vive aquí: es responsabilidad de `generationStore`
 * (status/result/error de `POST /api/generate`).
 */
import { create } from 'zustand';

import { getExamples, getPlatforms } from '../api/endpoints';
import type { Example, GenerateRequest, PlatformInfo } from '../types/contract';

export type BriefStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Brief vacío para una plataforma dada. Una sola fuente del initialState. */
export function emptyForm(platform: string): GenerateRequest {
  return {
    topic: '',
    platform,
    audience: '',
    content_type: '',
    tone: '',
    objective: '',
    brand_context: '',
  };
}

/** Campos que pide CONFIGURATION antes de generar, con su etiqueta. */
export const CONFIG_REQUIRED: ReadonlyArray<readonly [keyof GenerateRequest, string]> = [
  ['audience', 'audiencia'],
  ['content_type', 'formato'],
  ['tone', 'tono'],
  ['objective', 'objetivo'],
];

/** El plano de tema está listo cuando hay tema. */
export function themeReadyOf(form: GenerateRequest | null): boolean {
  return form !== null && form.topic.trim().length > 0;
}

/** Campos que aún faltan en CONFIGURATION, con sus etiquetas. */
export function configMissingOf(form: GenerateRequest | null): string[] {
  if (form === null) {
    return CONFIG_REQUIRED.map(([, label]) => label);
  }
  return CONFIG_REQUIRED.filter(([key]) => form[key].trim() === '').map(([, label]) => label);
}

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Error desconocido.';
}

/** Propone el primer formato del catálogo si todavía no hay uno. */
function withDefaultContentType(
  form: GenerateRequest,
  platforms: readonly PlatformInfo[],
  platform: string,
): GenerateRequest {
  if (form.content_type.trim() !== '') {
    return form;
  }
  const first = platforms.find((p) => p.id === platform)?.content_types[0];
  return first ? { ...form, content_type: first } : form;
}

interface BriefState {
  status: BriefStatus;
  platforms: PlatformInfo[];
  examples: Example[];
  /** Brief en curso, o `null` hasta que se elige plataforma. */
  form: GenerateRequest | null;
  error: string | null;

  /** Carga catálogo y ejemplos (una vez) y prepara el brief de la plataforma. */
  load: (platform: string) => Promise<void>;

  /** Actualiza campos del brief manteniendo el resto. */
  update: (patch: Partial<GenerateRequest>) => void;

  /** Rellena el brief con un ejemplo (la plataforma la fija la estantería). */
  useExample: (example: Example) => void;

  /** Formatos válidos de la plataforma según el catálogo real. */
  contentTypesOf: (platform: string) => string[];

  reset: () => void;
}

export const useBriefStore = create<BriefState>()((set, get) => ({
  status: 'idle',
  platforms: [],
  examples: [],
  form: null,
  error: null,

  load: async (platform) => {
    const current = get();
    const form = current.form?.platform === platform ? current.form : emptyForm(platform);
    set({ form });

    // Ya cargado: solo se asegura el primer formato si aún no hay uno.
    if (current.status === 'ready' || (current.status === 'loading' && current.platforms.length > 0)) {
      set({ form: withDefaultContentType(form, current.platforms, platform) });
      return;
    }
    // Otro montaje ya está cargando; este espera al que está en vuelo.
    if (current.status === 'loading') {
      return;
    }

    set({ status: 'loading', error: null });
    try {
      const platforms = (await getPlatforms()).platforms;
      const examples = (await getExamples()).examples;
      set({
        status: 'ready',
        platforms,
        examples,
        form: withDefaultContentType(form, platforms, platform),
        error: null,
      });
    } catch (cause) {
      set({ status: 'error', error: messageOf(cause) });
    }
  },

  update: (patch) => {
    const { form } = get();
    if (form === null) return;
    set({ form: { ...form, ...patch } });
  },

  useExample: (example) => {
    const { form } = get();
    set({ form: { ...example.brief, platform: form?.platform ?? example.brief.platform } });
  },

  contentTypesOf: (platform) => {
    return get().platforms.find((p) => p.id === platform)?.content_types ?? [];
  },

  reset: () => set({ status: 'idle', platforms: [], examples: [], form: null, error: null }),
}));