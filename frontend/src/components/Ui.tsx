/**
 * TRAZO · interfaz sobre la escena.
 *
 * PRIORIDAD 1 y 8 · lo mínimo indispensable: el botón Iniciar, una
 * indicación de qué hacer, el rótulo de la plataforma y una píldora de
 * fase. Nada de paneles, barras laterales ni tarjetas: eso convertiría
 * el estudio en un dashboard.
 *
 * No hay logotipo ni texto sobre la pared (referencia 02).
 *
 * Nota de implementación: el centrado se hace con envoltorios
 * estáticos, no con `translate(-50%)`. Motion reescribe `transform`
 * completo al animar `y` o `scale`, y el centrado se perdería.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { getPlatform } from '../data/platforms';
import { PHASE_LABEL } from '../store/stateMachine';
import { TIMINGS } from '../store/timings';
import { useSceneStore } from '../store/sceneStore';

export function Ui() {
  const scene = useSceneStore((s) => s.scene);
  const selected = useSceneStore((s) => s.selected);
  const begin = useSceneStore((s) => s.begin);
  const reduced = useReducedMotion();

  const carrying = selected ? getPlatform(selected) : null;

  const showIntro = scene === 'ARRIVAL';
  const showCarrying = carrying !== null && scene === 'CHARACTER_MOVING';

  return (
    <div className="ui">
      {/* ── Portada ───────────────────────────────────────────
          Se retira al pulsar Iniciar: el estudio nunca se queda con
          un panel encima.                                         */}
      <AnimatePresence>
        {showIntro && (
          <div className="ui__center" key="intro">
            <motion.div
              className="ui__card"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: reduced ? 0 : TIMINGS.panel, ease: 'easeOut' }}
            >
              <p className="ui__kicker">Estudio creativo</p>
              <h1 className="ui__title">
                Del icono a
                <br />
                la publicación
              </h1>
              <p className="ui__lead">
                TRAZO recoge la plataforma que elijas de la estantería, la trae a la mesa y
                convierte lo que tengas en mente en contenido con su formato.
              </p>

              <motion.button
                type="button"
                className="btn"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Indicación de la acción, solo mientras las plataformas están
          en primer plano. */}
      <div className="ui__dock">
        <AnimatePresence>
          {scene === 'SHELF_SELECTION' && (
            <motion.p
              key="hint"
              className="ui__pill"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.4 }}
            >
              Elige una plataforma de la estantería
            </motion.p>
          )}
        </AnimatePresence>

        {/* Rótulo de la plataforma que lleva: es una etiqueta, no un
            panel. */}
        <AnimatePresence>
          {showCarrying && carrying && (
            <motion.div
              key="carrying"
              className="ui__pill"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.35 }}
            >
              <span className="ui__dot" style={{ background: carrying.color }} />
              {carrying.name}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Plataforma elegida ────────────────────────────────
          Sin panel: el cambio visual lo aporta la propia plataforma
          resaltada en la balda. El workspace llega en F01D y la salida
          se decide entonces, así que aquí no se añade nada.          */}

      {/* Píldora de fase, discreta */}
      <div className="ui__phase">
        <span className="ui__pulse" />
        {PHASE_LABEL[scene]}
      </div>
    </div>
  );
}
