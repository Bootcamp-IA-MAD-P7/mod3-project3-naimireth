/**
 * TRAZO · store de la escena (F01A + F01B).
 *
 * Única fuente de verdad. Ningún componente guarda el estado de la
 * secuencia: leen del store y notifican el final de sus animaciones.
 * Ver ADR-0001.
 */
import { create } from 'zustand';

import { INITIAL_SCENE, type Scene, canTransition, nextScene } from './stateMachine';
import type { PlatformId } from '../data/platforms';

interface SceneState {
  scene: Scene;
  /** Plataforma elegida, o `null` si aún no se ha elegido. */
  selected: PlatformId | null;
  /** `true` mientras la cámara o la chica se desplazan: bloquea el clic. */
  moving: boolean;

  /** Botón Iniciar: `ARRIVAL` → `SHELF_SELECTION`. */
  begin: () => boolean;

  /** Elegir plataforma: → `CHARACTER_MOVING`. */
  select: (id: PlatformId) => boolean;
  arrive: () => boolean;
  pick: () => boolean;
  reset: () => void;
  setMoving: (moving: boolean) => void;
}

export const useSceneStore = create<SceneState>()((set, get) => ({
  scene: INITIAL_SCENE,
  selected: null,
  moving: false,

  begin: () => {
    const { scene } = get();
    const next = nextScene(scene);
    if (!next || !canTransition(scene, next)) {
      return false;
    }
    set({ scene: next, moving: false });
    return true;
  },

  select: (id) => {
    const { scene, moving } = get();
    if (scene !== 'SHELF_SELECTION' || moving) {
      return false;
    }
    set({ scene: 'PLATFORM_SELECTED', selected: id, moving: false });
    return true;
  },

  arrive: () => true,
  pick: () => true,
  reset: () => set({ scene: INITIAL_SCENE, selected: null, moving: false }),
  setMoving: (moving) => set({ moving }),
}));
