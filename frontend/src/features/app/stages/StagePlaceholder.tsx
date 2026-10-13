/**
 * TRAZO · superficie mínima de las fases siguientes (rediseño visual).
 *
 * Tema, Configuración y Resultado DEJAN de ser un formulario encajado
 * en la pantalla de una tablet antigua: son pantallas propias. Durante
 * esta iteración solo se compone su superficie de transición (título,
 * nota y volver) para que el recorrido sea navegable; las pantallas
 * reales se construyen en las siguientes etapas del rediseño.
 */
import { motion, useReducedMotion } from 'motion/react';

import { useSceneStore } from '../../../store/sceneStore';
import type { Scene } from '../../../store/stateMachine';

const TITULOS: Readonly<Record<string, string>> = {
  THEME: 'Tema',
  CONFIGURATION: 'Configuración',
  RESULT: 'Resultado',
};

export function StagePlaceholder({ scene }: { scene: Scene }) {
  const previous = useSceneStore((s) => s.previous);
  const reduced = useReducedMotion() === true;
  const titulo = TITULOS[scene] ?? scene;

  return (
    <div className="placeholder">
      <div className="placeholder__ring" aria-hidden="true" />
      <p className="placeholder__stage">TRAZO · pantalla propia</p>
      <h2 className="placeholder__title">{titulo}</h2>
      <p className="placeholder__note">
        Esta pantalla se compone en la siguiente etapa del rediseño (formularios reales y
        persistencia).
      </p>
      <motion.button
        type="button"
        className="btn btn--ghost"
        onClick={previous}
        whileHover={reduced ? undefined : { scale: 1.03 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      >
        ← Volver
      </motion.button>
    </div>
  );
}