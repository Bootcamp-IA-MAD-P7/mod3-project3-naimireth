/**
 * TRAZO · pose de cámara por escena.
 *
 * No hay cámara 3D. Cada escena tiene un encuadre y el escenario se
 * desplaza hacia él con `transform` + `transform-origin`. El origen
 * importa: si la cámara se acerca a la mesa, el punto fijo es la
 * mesa, no el centro de la pantalla.
 *
 * Todas las magnitudes están en unidades del mundo (ver tokens.css).
 */
import type { Scene } from './stateMachine';
import { PLATE, shelfCenter } from '../scene/geometry';

export type { Scene };

export interface CameraPose {
  /** Punto fijo del encuadre, en coordenadas del mundo. */
  originX: number;
  originY: number;
  /** Escala del escenario. */
  scale: number;
  /** Desplazamiento adicional en unidades del mundo. */
  x: number;
  y: number;
  /** Desenfoque aplicado a las capas de fondo, en píxeles. */
  blur: number;
  /** Cuánto se atenúa la escena, de 0 a 1. */
  dim: number;
}

/* Los encuadres se derivan de los anclajes de geometry.ts para que
   mover la estantería o a la chica no obligue a tocar dos archivos. */
const centro = { x: PLATE.w / 2, y: PLATE.h / 2 };
const estanteria = shelfCenter();

export const CAMERA: Record<Scene, CameraPose> = {
  ARRIVAL: {
    originX: centro.x,
    originY: centro.y,
    scale: 1,
    x: 0,
    y: 0,
    blur: 0,
    dim: 0,
  },
  SHELF_SELECTION: {
    originX: (centro.x + estanteria.x) / 2,
    originY: (centro.y + estanteria.y) / 2,
    scale: 1.1,
    x: 0,
    y: 0,
    blur: 6,
    dim: 0.34,
  },
  PLATFORM_SELECTED: {
    originX: (centro.x + estanteria.x) / 2,
    originY: (centro.y + estanteria.y) / 2,
    scale: 1.08,
    x: 0,
    y: 0,
    blur: 3,
    dim: 0.22,
  },
};

/** Curva de las transiciones de cámara. */
export const CAMERA_EASE = [0.22, 1, 0.36, 1] as const;
