/**
 * TRAZO · la estantería y las plataformas.
 *
 * La balda ya no es una imagen: `03_platform-shelf.png` no existe en
 * `public/visual` y ninguno de los assets que sí existen es un recorte
 * de balda. Por eso la estantería se compone con los cinco tokens de
 * `data/platforms.ts` (monogramas propios, ADR-0002), cada uno en su
 * columna. Encima se superponen las cajas transparentes, que son la
 * zona interactiva. La representación visual y la interacción quedan
 * separadas, como pedía el brief:
 *
 *     composición propia  +  área clicable invisible  +  Motion
 *
 * No se usa ni un logotipo oficial ni una imagen recoloreada.
 */
import { motion, useReducedMotion } from 'motion/react';

import { getPlatform } from '../data/platforms';
import { useSceneStore } from '../store/sceneStore';
import type { Scene } from '../store/stateMachine';
import { CAMERA_EASE } from '../store/camera';
import { ORDEN_EN_ESTANTERIA, SHELF, STAGE, platformBoxes, shelfBaseY } from './geometry';
import { PlatformMonogram } from './PlatformToken';

const HOVER_DURATION = 0.45;

export function ShelfImage({ scene }: { scene: Scene }) {
  const selected = useSceneStore((s) => s.selected);
  const reduced = useReducedMotion();

  const escala = STAGE.estanteria.escala;
  const alto = SHELF.h * escala;

  // La elección vive en el carrusel de la capa Ui (Etapa 2 · rediseño).
  // Los tokens quedan como decorado de la balda; las cajas se mantienen
  // en el DOM siempre desactivadas para conservar la estructura de F01A.
  const seleccionable = false;

  const cajas = platformBoxes(SHELF.w, SHELF.h);

  return (
    <div
      className="actor actor--shelf"
      data-scene={scene}
      style={{
        left: `${STAGE.estanteria.x}px`,
        top: `${shelfBaseY() - alto}px`,
        width: `${SHELF.w * escala}px`,
        height: `${alto}px`,
      }}
    >
      {/* Sombra de contacto bajo la balda, para que el mueble descanse
          sobre la pared en vez de flotar pegado encima. */}
      <span className="contact contact--shelf" aria-hidden="true" />

      {/* La balda compuesta: los cinco tokens, en sus columnas. */}
      <motion.div
        className="shelf__board"
        aria-label="Estantería con las cinco plataformas"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : HOVER_DURATION, ease: CAMERA_EASE }}
      >
        {ORDEN_EN_ESTANTERIA.map((id, i) => {
          const caja = cajas[i];
          const plataforma = getPlatform(id);
          if (!caja) return null;

          return (
            <span
              key={id}
              className="token"
              data-platform={id}
              style={{
                left: `${caja.x}px`,
                top: `${caja.y}px`,
                width: `${caja.w}px`,
                height: `${caja.h}px`,
                color: plataforma.color,
              }}
            >
              <PlatformMonogram platform={plataforma} />
            </span>
          );
        })}
      </motion.div>

      {/* Clicables invisibles. Originalmente la balda era interactiva;
          desde la Etapa 2 el selector es el carrusel, así que estas
          cajas quedan desactivadas como estructura de F01A. */}
      <div className="shelf__hits">
        {ORDEN_EN_ESTANTERIA.map((id, i) => {
          const caja = cajas[i];
          const plataforma = getPlatform(id);
          if (!caja) return null;

          return (
            <button
              key={id}
              type="button"
              className="shelf__hit"
              data-active={seleccionable}
              data-chosen={selected === id}
              style={{
                left: `${caja.x}px`,
                top: `${caja.y}px`,
                width: `${caja.w}px`,
                height: `${caja.h}px`,
              }}
              aria-label={`Elegir ${plataforma.name}`}
              disabled={!seleccionable}
            >
              {/* La señal de selección es vertical: una columna de luz
                  detrás del objeto, no un borde alrededor. */}
              <motion.span
                className="shelf__beam"
                aria-hidden="true"
                initial={false}
                animate={{ opacity: seleccionable ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.5 }}
              />
              <motion.span
                className="shelf__tick"
                aria-hidden="true"
                data-platform={id}
                initial={false}
                animate={{ scale: selected === id ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
