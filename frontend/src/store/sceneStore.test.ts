/**
 * TRAZO · verificación del store.
 *
 * El store es la fuente de verdad y solo avanza por eventos de fin
 * de animación. Estos tests comprueban el grafo desde el propio
 * store, sin montar componentes.
 */
import { beforeEach, describe, expect, it } from 'vitest';

import { useSceneStore } from './sceneStore';

describe('store de la escena', () => {
  beforeEach(() => {
    useSceneStore.getState().reset();
  });

  /** Deja el store listo para aceptar un clic: la cámara ya se ha parado. */
  function beginAndSettle() {
    useSceneStore.getState().begin();
    useSceneStore.getState().setMoving(false);
  }

  it('arranca en ARRIVAL sin plataforma elegida', () => {
    const s = useSceneStore.getState();
    expect(s.scene).toBe('ARRIVAL');
    expect(s.selected).toBeNull();
  });

  it('Iniciar lleva a SHELF_SELECTION y bloquea el clic mientras hay movimiento', () => {
    expect(useSceneStore.getState().begin()).toBe(true);
    const s = useSceneStore.getState();
    expect(s.scene).toBe('SHELF_SELECTION');
    expect(s.moving).toBe(true);
  });

  it('no se puede elegir plataforma antes de iniciar', () => {
    expect(useSceneStore.getState().select('instagram')).toBe(false);
    expect(useSceneStore.getState().selected).toBeNull();
  });

  it('no se puede elegir plataforma mientras la cámara se mueve', () => {
    useSceneStore.getState().begin();
    expect(useSceneStore.getState().select('instagram')).toBe(false);
  });

  it('elegir plataforma guarda la elección y arranca el paseo', () => {
    beginAndSettle();

    expect(useSceneStore.getState().select('blog')).toBe(true);
    const s = useSceneStore.getState();
    expect(s.scene).toBe('CHARACTER_MOVING');
    expect(s.selected).toBe('blog');
    expect(s.moving).toBe(true);
  });

  it('no admite una segunda elección mientras la chica camina', () => {
    beginAndSettle();
    useSceneStore.getState().select('instagram');
    expect(useSceneStore.getState().select('blog')).toBe(false);
    expect(useSceneStore.getState().selected).toBe('instagram');
  });

  it('al llegar la escena pasa a PLATFORM_SELECTED y se libera el movimiento', () => {
    beginAndSettle();
    useSceneStore.getState().select('x');

    expect(useSceneStore.getState().arrive()).toBe(true);
    const s = useSceneStore.getState();
    expect(s.scene).toBe('CHARACTER_PICKING');
    expect(s.selected).toBe('x');
    expect(s.moving).toBe(true);
  });

  it('arrive() no hace nada si la chica no estaba caminando', () => {
    expect(useSceneStore.getState().arrive()).toBe(false);
    expect(useSceneStore.getState().scene).toBe('ARRIVAL');
  });

  it('el reinicio borra también la plataforma elegida', () => {
    beginAndSettle();
    useSceneStore.getState().select('linkedin');
    useSceneStore.getState().reset();

    const s = useSceneStore.getState();
    expect(s.scene).toBe('ARRIVAL');
    expect(s.selected).toBeNull();
  });
});
