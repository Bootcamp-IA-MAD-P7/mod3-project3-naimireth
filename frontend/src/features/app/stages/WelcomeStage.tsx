/**
 * TRAZO · pantalla de bienvenida (rediseño visual).
 *
 * Composición editorial propia: emblema geométrico, titular animado
 * (BlurText), texto y botón de inicio dentro de una tarjeta con luz
 * (SpotlightCard). Nada de la antigua escena debajo: esta pantalla ES
 * el punto de entrada.
 */
import { motion, useReducedMotion } from 'motion/react';

import { useSceneStore } from '../../../store/sceneStore';
import { BlurText } from '../ui/BlurText';
import { SpotlightCard } from '../ui/SpotlightCard';

export function WelcomeStage() {
  const begin = useSceneStore((s) => s.begin);
  const reduced = useReducedMotion() === true;

  return (
    <div className="welcome">
      <div className="welcome__emblem" aria-hidden="true">
        <span className="welcome__emblem-ring" />
        <span className="welcome__emblem-core" />
      </div>

      <p className="welcome__kicker">Estudio creativo</p>

      <BlurText
        as="h1"
        className="welcome__title"
        text="Del icono a la publicación"
        animateBy="words"
        delay={0.05}
        speed={0.09}
      />

      <p className="welcome__lead">
        TRAZO recoge la plataforma que elijas, trae la idea a tu mesa y convierte lo que
        tienes en mente en publicaciones con su formato.
      </p>

      <SpotlightCard className="welcome__cta">
        <motion.button
          type="button"
          className="btn btn--start"
          onClick={begin}
          whileHover={reduced ? undefined : { scale: 1.04 }}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        >
          Iniciar
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </motion.button>
        <p className="welcome__cta-hint">Entrar en el estudio</p>
      </SpotlightCard>
    </div>
  );
}