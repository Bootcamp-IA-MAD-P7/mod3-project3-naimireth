/**
 * TRAZO · la estantería y las plataformas.
 *
 * `03_platform-shelf.png` es una imagen opaca: la estantería y las
 * cinco plataformas se ven exactamente como están en el asset. Encima
 * se superponen cinco cajas transparentes, que son las única zona
 * interactiva. Así la representación visual y la interacción quedan
 * separadas, como pedía el brief:
 *
 *     imagen original  +  área clicable invisible  +  Motion
 *
 * No se redibuja ni un icono, ni se recolorea la imagen.
 */
import { motion, useReducedMotion } from 'motion/react';

import { getPlatform } from '../data/platforms';
import { useSceneStore } from '../store/sceneStore';
import type { Scene } from '../store/stateMachine';
import { CAMERA_EASE } from '../store/camera';
import { ORDEN_EN_ESTANTERIA, SHELF, STAGE, platformBoxes, shelfBaseY } from './geometry';

const HOVER_DURATION = 0.45;

export function ShelfImage({ scene }: { scene: Scene }) {
  const selected = useSceneStore((s) => s.selected);
  const select = useSceneStore((s) => s.select);
  const reduced = useReducedMotion();

  const escala = STAGE.estanteria.escala;
  const alto = SHELF.h * escala;

  // Las plataformas solo son clicables cuando la cámara las ha
  // traído al frente: antes de Iniciar son decorado.
  const seleccionable = scene === 'SHELF_SELECTION';

  const cajas = platformBoxes(SHELF.w, SHELF.h);

  return (
    <div
      className="actor actor--shelf"
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

      <motion.img
        className="shelf__art"
        src={SHELF.src}
        alt="Estantería con las cinco plataformas"
        draggable={false}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : HOVER_DURATION, ease: CAMERA_EASE }}
      />

      {/* Clicables invisibles. Solo existen en la fase de selección. */}
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
              onClick={() => select(id)}
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
