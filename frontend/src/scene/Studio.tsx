/**
 * TRAZO · el estudio (Etapa 2 · experiencia B I S C).
 *
 * PRIORIDAD 1 · esto no es una pantalla con controles: es un espacio.
 *
 * La escena cambia de placa según el plano: el estudio (02, 1702 × 924)
 * en Bienvenida y Selección, y la base de tablet en Tema, Configuración
 * y Resultado. Entre planos, la placa se cruza en disolvencia mientras
 * la cámara viaja (CameraRig), de modo que nunca hay corte seco.
 *
 * El formulario y el resultado viven DENTRO del rectángulo de pantalla
 * de la tablet (`TABLET_SCREEN`), no en una tarjeta flotante sobre la
 * escena. Durante las escenas de estudio la mesa no se toca.
 *
 * El orden de las capas es lo que produce la sensación de profundidad,
 * así que el DOM va de fondo a frente y el `z-index` acompaña.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { CameraRig } from './CameraRig';
import { CharacterSprite } from './CharacterSprite';
import { Lighting } from './Lighting';
import { ShelfImage } from './ShelfImage';
import { Calibration } from './Calibration';
import { World } from './Viewport';
import { PLATE, TABLET_PLATE, TABLET_SCREEN, isTabletScene } from './geometry';
import { CAMERA_EASE } from '../store/camera';
import { useSceneStore } from '../store/sceneStore';
import { Workspace } from '../features/workspace/Workspace';

/** Duración de la disolvencia de placa, igual que el travelling. */
const PLATE_DURATION = 1.4;

export function Studio() {
  const scene = useSceneStore((s) => s.scene);
  const selected = useSceneStore((s) => s.selected);
  const reduced = useReducedMotion();

  const tablet = isTabletScene(scene);
  const plate = tablet ? TABLET_PLATE : PLATE;

  return (
    <div className="scene" data-scene={scene}>
      <World plate={plate}>
        <CameraRig scene={scene}>
          {/* Placa activa. Al cambiar de plano, la anterior se disuelve
              mientras la cámara viaja: no hay corte seco. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={plate.src}
              className="plate"
              role="img"
              aria-label="Estudio creativo de TRAZO"
              style={{
                backgroundImage: `url(${plate.src})`,
                width: `${plate.w}px`,
                height: `${plate.h}px`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : PLATE_DURATION, ease: CAMERA_EASE }}
            />
          </AnimatePresence>

          {/* El estudio compuesto: balda y chica solo donde existen. */}
          {!tablet && <ShelfImage scene={scene} />}
          {!tablet && <CharacterSprite />}

          {/* La tablet: dentro de su pantalla vive el workspace. La
              pantalla es la única zona que cambia entre renders. */}
          {tablet && selected && (
            <div
              className="tablet-stage"
              style={{
                left: `${TABLET_SCREEN.x}px`,
                top: `${TABLET_SCREEN.y}px`,
                width: `${TABLET_SCREEN.w}px`,
                height: `${TABLET_SCREEN.h}px`,
              }}
            >
              <Workspace platformId={selected} />
            </div>
          )}
        </CameraRig>

        <Lighting />
        <Calibration plate={plate} tablet={tablet} />
      </World>
    </div>
  );
}