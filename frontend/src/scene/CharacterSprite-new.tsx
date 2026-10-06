/**
 * TRAZO · personaje usando 01_character-reference (char-sprites.png)
 *
 * La hoja es la banda H0 extraída (1722×504). Definimos 5 frames:
 * - IDLE: reposo (ARRIVAL, SHELF_SELECTION)
 * - WALK1,WALK2,WALK3: andar (CHARACTER_MOVING)
 * - PICK: recoger (CHARACTER_PICKING)
 *
 * Los rectángulos son amplios para no cortar la ilustración original.
 * Se usa background-position + viewport para mostrar solo un frame.
 */
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { useSceneStore } from '../store/sceneStore';
import type { Scene } from '../store/stateMachine';
import { POSE_CHAR, SPRITE_CHAR, WALK_CHAR, STAGE, walkTargetX } from './geometry-char';

const WALK_DURATION = 1.9;
const WALK_EASE = [0.42, 0, 0.58, 1] as const;
const STEP_MS = 280;

export interface CharacterSpriteProps {
  scene: Scene;
}

export function CharacterSprite({ scene }: CharacterSpriteProps) {
  const reduced = useReducedMotion();
  const arrive = useSceneStore((s) => s.arrive);
  const caminando = scene === 'CHARACTER_MOVING';

  const [f, setF] = useState(0);
  useEffect(() => {
    if (!caminando) return;
    const id = window.setInterval(() => setF((p) => (p + 1) % WALK_CHAR.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [caminando]);

  let pose = POSE_CHAR.IDLE;
  if (scene === 'CHARACTER_MOVING') pose = WALK_CHAR[f] ?? POSE_CHAR.WALK1;
  if (scene === 'CHARACTER_PICKING') pose = POSE_CHAR.PICK;
  if (scene === 'PLATFORM_SELECTED') pose = POSE_CHAR.IDLE;

  const escala = STAGE.personaje.escala;
  const cell = SPRITE_CHAR.cells[pose];
  const alto = cell.h * escala;
  const destino = caminando ? walkTargetX() - STAGE.personaje.x : 0;

  const style: React.CSSProperties = {
    width: `${cell.w * escala}px`,
    height: `${alto}px`,
    backgroundImage: `url(${SPRITE_CHAR.src})`,
    backgroundSize: `${SPRITE_CHAR.w * escala}px ${SPRITE_CHAR.h * escala}px`,
    backgroundPosition: `${-Math.round(cell.x * escala)}px 0px`,
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="actor actor--character" style={{ left: `${STAGE.personaje.x}px`, top: `${STAGE.sueloY - alto}px` }}>
      <motion.div
        className="walk"
        initial={false}
        animate={{ x: destino }}
        transition={{ duration: reduced ? 0 : WALK_DURATION, ease: WALK_EASE }}
        onAnimationComplete={() => { if (caminando) arrive(); }}
      >
        <span className="contact contact--feet" aria-hidden="true" />
        <motion.div className="pose" style={style} initial={false} animate={reduced ? {} : { y: [0, -2, 0], rotate: [0, 0.4, 0] }} transition={reduced ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }} />
      </motion.div>
    </div>
  );
}
