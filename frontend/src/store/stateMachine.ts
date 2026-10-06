/**
 * TRAZO · máquina de estados de la escena (F01A + F01B).
 *
 * El store NUNCA avanza por temporizadores. Solo avanza cuando un
 * componente notifica el final de su animación (ADR-0001), de forma
 * que la secuencia es determinista y testeable.
 *
 * Los estados de workspace se añaden en F01D, no antes.
 */

export const SCENES = [
  'ARRIVAL',
  'SHELF_SELECTION',
  'PLATFORM_SELECTED',
] as const;

export type Scene = (typeof SCENES)[number];

/**
 * Grafo de transiciones.
 *
 *   Iniciar      →  las plataformas se vuelven elegibles
 *   elegir una   →  la chica camina hasta ella
 * *llegar*      →  plataforma elegida
 */
const TRANSITIONS: Record<Scene, readonly Scene[]> = {
  ARRIVAL: ['SHELF_SELECTION'],
  SHELF_SELECTION: ['PLATFORM_SELECTED'],
  PLATFORM_SELECTED: ['ARRIVAL'],
};

/** Estado inicial: el estudio completo, antes de pulsar Iniciar. */
export const INITIAL_SCENE: Scene = 'ARRIVAL';

export function canTransition(from: Scene, to: Scene): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextScene(from: Scene): Scene | null {
  return TRANSITIONS[from][0] ?? null;
}

/** Etiqueta discreta para la interfaz. Nunca sobre la pared. */
export const SCENE_LABEL: Record<Scene, string> = {
  ARRIVAL: 'Estudio',
  SHELF_SELECTION: 'Elige una plataforma',
  PLATFORM_SELECTED: 'Plataforma elegida',
};

/** Etiqueta corta de la fase actual, para la píldora de estado. */
export const PHASE_LABEL: Record<Scene, string> = {
  ARRIVAL: '1A · Estudio',
  SHELF_SELECTION: '1B · Estantería',
  PLATFORM_SELECTED: '1D · Elegida',
};
