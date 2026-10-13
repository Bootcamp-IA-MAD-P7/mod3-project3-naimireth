/**
 * Verificación de la máquina de estados de la experiencia B I S C.
 *
 * Los tests cubren el grafo vigente (cinco escenas). La secuencia es
 * determinista porque el store solo avanza al recibir el evento de fin
 * de animación (ADR-0001): si el grafo es correcto, la secuencia lo es.
 */
import { describe, expect, it } from 'vitest';

import {
  BACK,
  FORWARD,
  INITIAL_SCENE,
  SCENES,
  canTransition,
  nextScene,
  previousScene,
  type Scene,
} from './stateMachine';
import { CAMERA } from './camera';
import { PLATE, shelfCenter, tabletScreenCenter } from '../scene/geometry';

describe('máquina de estados · experiencia B I S C', () => {
  it('declara exactamente las cinco escenas del guion', () => {
    expect(SCENES).toEqual(['ARRIVAL', 'SHELF_SELECTION', 'THEME', 'CONFIGURATION', 'RESULT']);
  });

  it('empieza en ARRIVAL, con el estudio completo', () => {
    expect(INITIAL_SCENE).toBe<Scene>('ARRIVAL');
  });

  it('avanza en línea recta de la bienvenida al resultado', () => {
    const flujo = SCENES.map(nextScene).filter((s): s is Scene => s !== null);
    expect(flujo).toEqual(['SHELF_SELECTION', 'THEME', 'CONFIGURATION', 'RESULT']);
  });

  it('RESULT no avanza hacia delante: el final se reinicia', () => {
    expect(nextScene('RESULT')).toBeNull();
    expect(canTransition('RESULT', 'ARRIVAL')).toBe(false);
  });

  it('permite volver atrás en cada plano', () => {
    expect(previousScene('THEME')).toBe('SHELF_SELECTION');
    expect(previousScene('CONFIGURATION')).toBe('THEME');
    expect(previousScene('RESULT')).toBe('CONFIGURATION');
    expect(canTransition('THEME', 'SHELF_SELECTION')).toBe(true);
  });

  it('no permite saltarse escenas en el avance', () => {
    expect(canTransition('ARRIVAL', 'THEME')).toBe(false);
    expect(canTransition('SHELF_SELECTION', 'CONFIGURATION')).toBe(false);
    expect(canTransition('THEME', 'RESULT')).toBe(false);
  });

  it('FORWARD y BACK casan con nextScene y previousScene', () => {
    for (const scene of SCENES) {
      expect(nextScene(scene)).toBe<Scene | null>(FORWARD[scene]);
      expect(previousScene(scene)).toBe<Scene | null>(BACK[scene]);
    }
  });

  it('no expone escenas antiguas ni de personaje', () => {
    for (const escena of ['PLATFORM_SELECTED', 'CHARACTER_MOVING', 'WORKSPACE_TRANSITION']) {
      expect(SCENES).not.toContain(escena as Scene);
    }
  });
});

describe('cámara', () => {
  const centro = { x: PLATE.w / 2, y: PLATE.h / 2 };

  it('tiene un encuadre para cada escena', () => {
    for (const scene of SCENES) {
      expect(CAMERA[scene]).toBeDefined();
    }
  });

  it('el plano general entra sin zoom, para ver el asset intacto', () => {
    expect(CAMERA.ARRIVAL.scale).toBe(1);
    expect(CAMERA.ARRIVAL.originX).toBeCloseTo(centro.x);
    expect(CAMERA.ARRIVAL.originY).toBeCloseTo(centro.y);
  });

  it('nunca atenúa ni desenfoca la escena: el foco lo da el encuadre', () => {
    // El rediseño elimina el velo y el blur por capa: los assets se ven
    // tal cual. Si una pose volviera a llevar dim/blur, falla aquí.
    for (const scene of SCENES) {
      const pose = CAMERA[scene];
      expect('dim' in pose).toBe(false);
      expect('blur' in pose).toBe(false);
    }
  });

  it('el plano de la estantería se acerca hasta la balda', () => {
    const estante = shelfCenter();
    expect(CAMERA.SHELF_SELECTION.scale).toBeGreaterThan(1);
    expect(CAMERA.SHELF_SELECTION.originX).toBeCloseTo(estante.x, 3);
    expect(CAMERA.SHELF_SELECTION.originY).toBeCloseTo(estante.y, 3);
  });

  it('los planos de tablet enfocan el centro de la pantalla', () => {
    const pantalla = tabletScreenCenter();
    for (const scene of ['THEME', 'CONFIGURATION', 'RESULT'] as const) {
      const pose = CAMERA[scene];
      expect(pose.originX).toBeCloseTo(pantalla.x, 3);
      expect(pose.originY).toBeCloseTo(pantalla.y, 3);
      expect(pose.scale).toBeGreaterThanOrEqual(2);
    }
  });

  it('ningún encuadre se sale de su base', () => {
    for (const scene of SCENES) {
      const pose = CAMERA[scene];
      expect(pose.originX).toBeGreaterThan(0);
      expect(pose.originX).toBeLessThan(PLATE.w);
      expect(pose.originY).toBeGreaterThan(0);
      expect(pose.originY).toBeLessThan(PLATE.h);
    }
  });
});