/**
 * TRAZO · store de la escena (Etapa 2 · experiencia B I S C).
 *
 * Única fuente de verdad. Ningún componente guarda el estado de la
 * secuencia: leen del store y notifican el avance (ADR-0001). El viaje
 * es ARRIVAL → SHELF_SELECTION → THEME → CONFIGURATION → RESULT, con
 * «Atrás» permitido y determinista: los componentes deciden cuándo.
 */
import { create } from 'zustand';

import {
  INITIAL_SCENE,
  type Scene,
  canTransition,
  nextScene,
  previousScene,
} from './stateMachine';
import type { PlatformId } from '../data/platforms';

interface SceneState {
  scene: Scene;
  /** Plataforma elegida, o `null` si aún no se ha elegido. */
  selected: PlatformId | null;
  /** `true` mientras la cámara viaja: bloquea el clic. */
  moving: boolean;

  /** Botón Iniciar: `ARRIVAL` → `SHELF_SELECTION`. */
  begin: () => boolean;

  /** Elegir plataforma en la estantería: → `THEME`. */
  select: (id: PlatformId) => boolean;

  /** Avanzar al siguiente plano del guion. */
  next: () => boolean;

  /** Volver al plano anterior. */
  previous: () => boolean;

  reset: () => void;
  setMoving: (moving: boolean) => void;
}

export const useSceneStore = create<SceneState>()((set, get) => ({
  scene: INITIAL_SCENE,
  selected: null,
  moving: false,

  begin: () => {
    const { scene } = get();
    const target = nextScene(scene);
    if (!target || !canTransition(scene, target)) {
      return false;
    }
    set({ scene: target, moving: false });
    return true;
  },

  select: (id) => {
    const { scene, moving } = get();
    if (scene !== 'SHELF_SELECTION' || moving) {
      return false;
    }
    set({ scene: 'THEME', selected: id, moving: false });
    return true;
  },

  next: () => {
    const { scene } = get();
    const target = nextScene(scene);
    if (!target || !canTransition(scene, target)) {
      return false;
    }
    set({ scene: target, moving: false });
    return true;
  },

  previous: () => {
    const { scene } = get();
    const target = previousScene(scene);
    if (!target || !canTransition(scene, target)) {
      return false;
    }
    set({ scene: target, moving: false });
    return true;
  },

  reset: () => set({ scene: INITIAL_SCENE, selected: null, moving: false }),
  setMoving: (moving) => set({ moving }),
}));