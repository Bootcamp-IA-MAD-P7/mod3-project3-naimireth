/**
 * TRAZO · máquina de estados de la escena (Etapa 2 · experiencia B I S C).
 *
 * La experiencia cinematográfica son cinco planos que encadenan la
 * narración completa: bienvenida → estantería → tema → configuración →
 * resultado. El store NUNCA avanza por temporizadores: solo avanza
 * cuando un componente notifica (ADR-0001), así que la secuencia es
 * determinista y testeable.
 *
 * El viaje hacia delante es lineal (ARRIVAL → … → RESULT) y cada escena
 * admite volver a la anterior: «Atrás» es parte del guion, no un
 * error. Reiniciar desde RESULT lleva a ARRIVAL.
 */

export const SCENES = [
  'ARRIVAL',
  'SHELF_SELECTION',
  'THEME',
  'CONFIGURATION',
  'RESULT',
] as const;

export type Scene = (typeof SCENES)[number];

/**
 * Avance lineal. `null` en RESULT porque es el plano final; reiniciar
 * se hace con `reset()` explícito.
 */
export const FORWARD: Record<Scene, Scene | null> = {
  ARRIVAL: 'SHELF_SELECTION',
  SHELF_SELECTION: 'THEME',
  THEME: 'CONFIGURATION',
  CONFIGURATION: 'RESULT',
  RESULT: null,
};

/** El paso atrás de cada escena, para el botón «Atrás»/«Volver». */
export const BACK: Record<Scene, Scene | null> = {
  ARRIVAL: null,
  SHELF_SELECTION: 'ARRIVAL',
  THEME: 'SHELF_SELECTION',
  CONFIGURATION: 'THEME',
  RESULT: 'CONFIGURATION',
};

/** Estado inicial: el estudio completo, antes de pulsar Iniciar. */
export const INITIAL_SCENE: Scene = 'ARRIVAL';

export function canTransition(from: Scene, to: Scene): boolean {
  return FORWARD[from] === to || BACK[from] === to;
}

/** Escena que sigue hacia delante, o `null` si es la final. */
export function nextScene(from: Scene): Scene | null {
  return FORWARD[from];
}

/** Escena anterior, o `null` si ya es la primera. */
export function previousScene(from: Scene): Scene | null {
  return BACK[from];
}

/** Etiqueta discreta de cada plano. Nunca sobre la pared. */
export const SCENE_LABEL: Record<Scene, string> = {
  ARRIVAL: 'Estudio',
  SHELF_SELECTION: 'Elige una plataforma',
  THEME: 'Tema',
  CONFIGURATION: 'Configuración',
  RESULT: 'Resultado',
};