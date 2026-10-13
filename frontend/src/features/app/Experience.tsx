/**
 * TRAZO · experiencia principal (rediseño visual).
 *
 * Reemplaza a la antigua escena del estudio como punto de entrada: cada
 * fase de la máquina de estados se muestra como una pantalla propia a
 * pantalla completa, construida con componenentes React y el fondo
 * geométrico nuevo. La placa antigua (Studio, cámara, estantería) ya
 * NO forma parte del recorrido: queda en el código, no en la pantalla.
 *
 * El `AnimatePresence` une las pantallas con el mismo encuadre y la
 * misma curva de easing; el fondo geométrico vive fuera de él para que
 * una composición conecte con la siguiente sin corte seco.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { useSceneStore } from '../../store/sceneStore';
import { TIMINGS } from '../../store/timings';
import { GeometricBackdrop } from './GeometricBackdrop';
import { stageOf } from './stages/stageOf';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Experience() {
  const scene = useSceneStore((s) => s.scene);
  const reduced = useReducedMotion() === true;

  return (
    <div className="experience" data-scene={scene}>
      <GeometricBackdrop calm={scene === 'SHELF_SELECTION'} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={scene}
          className="stage-screen"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -18, scale: 0.99 }}
          transition={{ duration: reduced ? 0 : TIMINGS.panel, ease: EASE }}
        >
          {stageOf(scene)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}