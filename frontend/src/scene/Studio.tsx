/**
 * TRAZO · el estudio.
 *
 * PRIORIDAD 1 · esto no es una pantalla con controles: es un espacio.
 *
 * Lo que se ve aquí son los assets de `docs/visual/`, sin redibujar:
 *
 *   02 (la placa del estudio, 1702 × 924, a tamaño 1:1)
 *     + 05 (la chica, recortada de la hoja de poses)
 *     + 03 (la estantería con las plataformas)
 *
 * El orden de las capas es lo que produce la sensación de profundidad,
 * así que el DOM va de fondo a frente y el `z-index` acompaña.
 */
import { CameraRig } from './CameraRig';
import { CharacterSprite } from './CharacterSprite';
import { Lighting } from './Lighting';
import { ShelfImage } from './ShelfImage';
import { Calibration } from './Calibration';
import { World } from './Viewport';
import { PLATE } from './geometry';
import { useSceneStore } from '../store/sceneStore';

export function Studio() {
  const scene = useSceneStore((s) => s.scene);

  return (
    <div className="scene" data-scene={scene}>
      <World>
        <CameraRig scene={scene}>
          {/* 02 · el estudio entero, sin reconstruir */}
          <div
            className="plate"
            style={{
              backgroundImage: `url(${PLATE.src})`,
              width: `${PLATE.w}px`,
              height: `${PLATE.h}px`,
            }}
            role="img"
            aria-label="Estudio creativo de TRAZO"
          />

          {/* 03 · la estantería, apoyada en el suelo */}
          <ShelfImage scene={scene} />

          {/* 05 · la chica, con los pies en el suelo */}
          <CharacterSprite scene={scene} />
        </CameraRig>

        <Lighting />
        <Calibration />
      </World>
    </div>
  );
}
