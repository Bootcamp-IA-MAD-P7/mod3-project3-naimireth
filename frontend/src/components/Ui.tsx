/**
 * TRAZO · interfaz sobre la escena (Etapa 2 · experiencia B I S C).
 *
 * PRIORIDAD 1 y 8 · lo mínimo indispensable. El paso del estudio a la
 * estantería y de ahí a la tablet lo cuenta la cámara, no la interfaz:
 * aquí solo vive la portada de ARRIVAL con el botón Iniciar. No hay
 * píldoras de fase, ni rótulos, ni tarjetas flotantes: eso convertiría
 * el estudio en un dashboard.
 *
 * No hay logotipo ni texto sobre la pared (referencia 02).
 *
 * Nota de implementación: el centrado se hace con envoltorios
 * estáticos, no con `translate(-50%)`. Motion reescribe `transform`
 * completo al animar `y` o `scale`, y el centrado se perdería.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { PlatformCarousel } from '../features/platforms/PlatformCarousel';
import { TIMINGS } from '../store/timings';
import { useSceneStore } from '../store/sceneStore';

export function Ui() {
  const scene = useSceneStore((s) => s.scene);
  const begin = useSceneStore((s) => s.begin);
  const reduced = useReducedMotion();

  return (
    <div className="ui">
      {/* ── Portada ───────────────────────────────────────────
          Solo en ARRIVAL. Se retira al pulsar Iniciar: el estudio
          nunca se queda con un panel encima.                        */}
      <AnimatePresence>
        {scene === 'ARRIVAL' && (
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

      {/* ── Carrusel de plataformas ──────────────────────────────
          Solo en SHELF_SELECTION, una vez la cámara llegó a la balda.
          Sustituye a los tokens clicables como forma de elegir.       */}
      <AnimatePresence>
        {scene === 'SHELF_SELECTION' && <PlatformCarousel key="carousel" />}
      </AnimatePresence>
    </div>
  );
}