/**
 * TRAZO · fondo geométrico de la experiencia (rediseño visual).
 *
 * La composición de cada pantalla se construye con componentes React
 * reales —formas de Motion y capas CSS—, no con una imagen antigua
 * escalada. Paleta de la interfaz: azul marino, índigo, violeta, lila,
 * rosa coral y crema.
 *
 * El lienzo vive FUERA del `AnimatePresence` de las pantallas: al
 * cambiar de fase, el fondo es lo que conecta una composición con la
 * siguiente (misma atmósfera, misma paleta) mientras el contenido
 * entra y sale.
 */
import { motion, useReducedMotion } from 'motion/react';

const DRIFT = { ease: 'easeInOut', repeat: Infinity } as const;

export function GeometricBackdrop({ calm = false }: { calm?: boolean }) {
  const reduced = useReducedMotion() === true;

  return (
    <div
      className={`experience__canvas${calm ? ' experience__canvas--calm' : ''}`}
      aria-hidden="true"
    >
      <div className="experience__grid" />

      <motion.div
        className="experience__blob experience__blob--a"
        initial={false}
        animate={reduced ? undefined : { x: [0, 46, 0], y: [0, -30, 0] }}
        transition={{ ...DRIFT, duration: 18 }}
      />
      <motion.div
        className="experience__blob experience__blob--b"
        initial={false}
        animate={reduced ? undefined : { x: [0, -54, 0], y: [0, 28, 0] }}
        transition={{ ...DRIFT, duration: 22, delay: -6 }}
      />
      <motion.div
        className="experience__blob experience__blob--c"
        initial={false}
        animate={reduced ? undefined : { x: [0, 32, 0], y: [0, -44, 0] }}
        transition={{ ...DRIFT, duration: 20, delay: -12 }}
      />

      <div className="experience__accent experience__accent--ring" />
      <div className="experience__accent experience__accent--dot" />
      <div className="experience__accent experience__accent--tri" />
    </div>
  );
}