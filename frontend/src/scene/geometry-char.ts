/**
 * TRAZO · geometría del personaje basado en 01_character-reference (char-sprites.png)
 */
export interface AssetInfo {
  src: string;
  w: number;
  h: number;
}

const VISUAL = '/visual';

export const PLATE = { src: `${VISUAL}/02_studio-scene.png`, w: 1702, h: 924 } as const;

export const SPRITE_CHAR = {
  src: `${VISUAL}/char-sprites.png`,
  w: 1722,
  h: 504,
  cells: {
    IDLE: { x: 0, y: 0, w: 340, h: 504 },
    WALK1: { x: 340, y: 0, w: 340, h: 504 },
    WALK2: { x: 680, y: 0, w: 340, h: 504 },
    WALK3: { x: 1020, y: 0, w: 340, h: 504 },
    PICK: { x: 1360, y: 0, w: 340, h: 504 },
  },
} as const;

export type CharPose = keyof typeof SPRITE_CHAR.cells;

export const POSE_CHAR = {
  IDLE: 'IDLE',
  WALK1: 'WALK1',
  WALK2: 'WALK2',
  WALK3: 'WALK3',
  PICK: 'PICK',
} as const;

export const WALK_CHAR: CharPose[] = ['WALK1', 'WALK2', 'WALK3'];

export interface Anchor {
  x: number;
  escala: number;
}
export interface ShelfAnchor extends Anchor {
  altura: number;
}
export interface Stage {
  sueloY: number;
  estanteria: ShelfAnchor;
  personaje: Anchor;
}

export const STAGE: Stage = {
  sueloY: 491,
  estanteria: { x: 1180, escala: 1, altura: 24 },
  personaje: { x: 880, escala: 1 },
};

export function shelfBaseY(): number {
  return STAGE.sueloY - STAGE.estanteria.altura;
}
export function walkTargetX(): number {
  return STAGE.estanteria.x - 240;
}
