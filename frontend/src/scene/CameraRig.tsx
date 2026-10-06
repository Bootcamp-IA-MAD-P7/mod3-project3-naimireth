/**
 * TRAZO · la cámara.
 *
 * No hay cámara 3D. El escenario entero se desplaza y se escala con
 * `transform`, y `transform-origin` se interpola junto con la escala
 * para que el punto fijo sea el sujeto del plano y no el centro de la
 * pantalla.
 *
 * El fondo se separa con un único velo con `backdrop-filter`, nunca
 * con un desenfoque por elemento: los assets son imágenes y un filtro
 * por capa los tornaría sucios.
 */
import { motion, useReducedMotion } from 'motion/react';

import { CAMERA, CAMERA_EASE } from '../store/camera';
import type { Scene } from '../store/stateMachine';

/** Duración del travelling, en segundos. */
const CAMERA_DURATION = 1.4;

export function CameraRig({ scene, children }: { scene: Scene; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const pose = CAMERA[scene];

  return (
    <div className="scene__viewport">
      <motion.div
        className="scene__stage"
        initial={false}
        animate={{
          x: reduced ? 0 : pose.x,
          y: reduced ? 0 : pose.y,
          scale: reduced ? 1 : pose.scale,
          transformOrigin: `${pose.originX}px ${pose.originY}px`,
          filter: reduced ? 'brightness(1)' : `brightness(${1 - pose.dim})`,
        }}
        transition={{ duration: reduced ? 0 : CAMERA_DURATION, ease: CAMERA_EASE }}
      >
        {children}
      </motion.div>

      <motion.div
        className="scene__veil"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: reduced ? 0 : pose.dim, backdropFilter: `blur(${reduced ? 0 : pose.blur}px)` }}
        transition={{ duration: reduced ? 0 : CAMERA_DURATION, ease: CAMERA_EASE }}
      />
    </div>
  );
}
