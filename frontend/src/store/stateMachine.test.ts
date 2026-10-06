/**
 * Verificación de la máquina de estados de F01A/F01B.
 *
 * Los tests cubren el grafo. La secuencia es determinista porque el
 * store solo avanza al recibir el evento de fin de animación
 * (ADR-0001): si el grafo es correcto, la secuencia lo es.
 */
import { describe, expect, it } from 'vitest';

import { INITIAL_SCENE, SCENES, canTransition, nextScene, type Scene } from '../store/stateMachine';
import { CAMERA } from '../store/camera';
import { PLATE, shelfCenter } from '../scene/geometry';

describe('máquina de estados de F01A/F01B', () => {
  it('declara exactamente los cuatro estados del flujo acordado', () => {
    expect(SCENES).toEqual([
      'ARRIVAL',
      'SHELF_SELECTION',
      'CHARACTER_PICKING',
      'CHARACTER_MOVING',
      'PLATFORM_SELECTED',
    ]);
  });

  it('empieza en ARRIVAL, con el estudio completo', () => {
    expect(INITIAL_SCENE).toBe<Scene>('ARRIVAL');
  });

  it('recorre el flujo completo del brief', () => {
    // El último estado cierra el ciclo volviendo al principio, así que
    // la cadena son las transiciones entre estados, no una salida de
    // cada estado.
    const flujo = SCENES.slice(0, -1).map(nextScene).filter((s): s is Scene => s !== null);
    expect(flujo).toEqual(['SHELF_SELECTION', 'CHARACTER_MOVING', 'CHARACTER_PICKING', 'PLATFORM_SELECTED']);
  });

  it('no permite saltarse la selección', () => {
    expect(canTransition('ARRIVAL', 'CHARACTER_MOVING')).toBe(false);
    expect(canTransition('ARRIVAL', 'PLATFORM_SELECTED')).toBe(false);
  });

  it('no permite volver atrás en la secuencia', () => {
    expect(canTransition('CHARACTER_MOVING', 'SHELF_SELECTION')).toBe(false);
    expect(canTransition('PLATFORM_SELECTED', 'CHARACTER_MOVING')).toBe(false);
  });

  it('permite reiniciar desde el estado final, y solo hacia el principio', () => {
    expect(canTransition('PLATFORM_SELECTED', 'ARRIVAL')).toBe(true);
    expect(canTransition('PLATFORM_SELECTED', 'SHELF_SELECTION')).toBe(false);
  });

  it('no expone todavía los estados del workspace', () => {
    // F01D. Si alguno aparece aquí, se ha adelantado una fase.
    for (const escena of ['WORKSPACE_TRANSITION', 'PLATFORM_PLACED', 'CHARACTER_CARRYING']) {
      expect(SCENES).not.toContain(escena as Scene);
    }
  });
});

describe('cámara', () => {
  it('tiene un encuadre para cada escena', () => {
    for (const scene of SCENES) {
      expect(CAMERA[scene]).toBeDefined();
    }
  });

  it('el plano general entra sin filtros, para ver el asset intacto', () => {
    // En ARRIVAL no hay desenfoque ni atenuación: la placa se ve tal
    // cual es. Cualquier filtro aquí falsearía la referencia.
    expect(CAMERA.ARRIVAL.blur).toBe(0);
    expect(CAMERA.ARRIVAL.dim).toBe(0);
    expect(CAMERA.ARRIVAL.scale).toBe(1);
  });

  it('el plano de la estantería se ancla en la estantería', () => {
    const centro = shelfCenter();
    expect(CAMERA.CHARACTER_MOVING.originX).toBeCloseTo(centro.x, 5);
    expect(CAMERA.CHARACTER_MOVING.originY).toBeCloseTo(centro.y, 5);
  });

  it('el resto de planos separa el fondo', () => {
    expect(CAMERA.SHELF_SELECTION.blur).toBeGreaterThan(0);
    expect(CAMERA.CHARACTER_MOVING.blur).toBeGreaterThan(0);
    expect(CAMERA.PLATFORM_SELECTED.blur).toBeGreaterThan(0);
  });

  it('ningún encuadre se sale de la placa', () => {
    for (const scene of SCENES) {
      const pose = CAMERA[scene];
      expect(pose.originX).toBeGreaterThan(0);
      expect(pose.originX).toBeLessThan(PLATE.w);
      expect(pose.originY).toBeGreaterThan(0);
      expect(pose.originY).toBeLessThan(PLATE.h);
    }
  });

  it('al elegir plataforma la cámara se abre para ver el conjunto', () => {
    // El plano más cerrado es el del paseo; al terminar debe bajar.
    expect(CAMERA.PLATFORM_SELECTED.scale).toBeLessThan(CAMERA.CHARACTER_MOVING.scale);
  });
});
