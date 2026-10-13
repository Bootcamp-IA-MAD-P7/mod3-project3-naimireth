/**
 * TRAZO · pose de cámara por escena (Etapa 2 · experiencia B I S C).
 *
 * No hay cámara 3D. Cada escena tiene un encuadre y el escenario se
 * desplaza hacia él con `transform` + `transform-origin`. El origen
 * importa: si la cámara se acerca a la mesa, el punto fijo es la mes,
 * no el centro de la pantalla.
 *
 * NO hay desenfoque ni atenuación: el fondo no se separa oscureciendo
 * la escena. El foco lo pone el propio encuadre —acercarse es la
 * transición— y los assets se ven intactos, como manda la referencia.
 *
 * Todas las magnitudes están en unidades del mundo del plano activo:
 * las escenas de estudio usan la placa 02 (1702 × 924) y las escenas
 * de tablet usan la base de tablet (1671 × 941) de geometry.ts, así
 * que cada origen se mide en su propio espacio.
 */
import type { Scene } from './stateMachine';
import { PLATE, shelfCenter, tabletScreenCenter } from '../scene/geometry';

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
}

/* Los encuadres se derivan de los anclajes de geometry.ts para que
   mover la estantería o la pantalla de la tablet no obligue a tocar
   dos archivos. */
const centro = { x: PLATE.w / 2, y: PLATE.h / 2 };
const tablet = {
  x: tabletScreenCenter().x,
  y: tabletScreenCenter().y,
};

export const CAMERA: Record<Scene, CameraPose> = {
  /** Plano 1 · el estudio completo, sin foco. */
  ARRIVAL: {
    originX: centro.x,
    originY: centro.y,
    scale: 1,
    x: 0,
    y: 0,
  },
  /** Plano 2 · la cámara viaja hasta la estantería: elegir. */
  SHELF_SELECTION: {
    originX: shelfCenter().x,
    originY: shelfCenter().y,
    scale: 2.4,
    x: 0,
    y: 0,
  },
  /** Plano 3 · la cámara viaja a la mesa: la tablet ya está aquí y el
   *  formulario vive dentro de su pantalla. */
  THEME: {
    originX: tablet.x,
    originY: tablet.y,
    scale: 2.3,
    x: 0,
    y: 0,
  },
  /** Plano 3.5 · se abre un punto para que quepan los cinco campos. */
  CONFIGURATION: {
    originX: tablet.x,
    originY: tablet.y,
    scale: 2.2,
    x: 0,
    y: 0,
  },
  /** Plano 4 · el resultado, dentro de la pantalla. */
  RESULT: {
    originX: tablet.x,
    originY: tablet.y,
    scale: 2.3,
    x: 0,
    y: 0,
  },
};

/** Curva de las transiciones de cámara. */
export const CAMERA_EASE = [0.22, 1, 0.36, 1] as const;