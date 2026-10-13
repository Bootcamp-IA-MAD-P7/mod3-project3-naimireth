/**
 * TRAZO · verificación del store.
 *
 * El store es la fuente de verdad. Estos tests comprueban el grafo y la
 * máquina de la experiencia B I S C (ARRIVAL → SHELF_SELECTION → THEME →
 * CONFIGURATION → RESULT, con Atrás), sin montar componentes.
 */
import { beforeEach, describe, expect, it } from 'vitest';

import { useSceneStore } from './sceneStore';

describe('store de la escena', () => {
  beforeEach(() => {
    useSceneStore.getState().reset();
  });

  it('arranca en ARRIVAL sin plataforma elegida', () => {
    const s = useSceneStore.getState();
    expect(s.scene).toBe('ARRIVAL');
    expect(s.selected).toBeNull();
  });

  it('Iniciar lleva a SHELF_SELECTION', () => {
    expect(useSceneStore.getState().begin()).toBe(true);
    expect(useSceneStore.getState().scene).toBe('SHELF_SELECTION');
  });

  it('no se puede elegir plataforma antes de iniciar', () => {
    expect(useSceneStore.getState().select('instagram')).toBe(false);
    expect(useSceneStore.getState().selected).toBeNull();
  });

  it('no se puede elegir plataforma mientras la cámara se mueve', () => {
    useSceneStore.getState().begin();
    useSceneStore.getState().setMoving(true);
    expect(useSceneStore.getState().select('instagram')).toBe(false);
  });

  it('elegir plataforma guarda la elección y pasa a THEME', () => {
    useSceneStore.getState().begin();
    expect(useSceneStore.getState().select('blog')).toBe(true);
    const s = useSceneStore.getState();
    expect(s.scene).toBe('THEME');
    expect(s.selected).toBe('blog');
  });

  it('no admite una segunda elección una vez elegida la plataforma', () => {
    useSceneStore.getState().begin();
    useSceneStore.getState().select('instagram');
    expect(useSceneStore.getState().select('blog')).toBe(false);
    expect(useSceneStore.getState().selected).toBe('instagram');
  });

  it('setMoving controla el bloqueo del clic', () => {
    useSceneStore.getState().setMoving(true);
    expect(useSceneStore.getState().moving).toBe(true);
    useSceneStore.getState().setMoving(false);
    expect(useSceneStore.getState().moving).toBe(false);
  });

  it('next avanza hasta RESULT y el final no avanza más', () => {
    const s = useSceneStore.getState();
    expect(s.begin()).toBe(true);

    expect(s.select('x')).toBe(true); // → THEME
    expect(s.next()).toBe(true); // → CONFIGURATION
    expect(s.next()).toBe(true); // → RESULT
    expect(useSceneStore.getState().scene).toBe('RESULT');
    expect(useSceneStore.getState().next()).toBe(false);
    expect(useSceneStore.getState().scene).toBe('RESULT');
  });

  it('previous vuelve atrás por cada plano hasta la portada', () => {
    const s = useSceneStore.getState();
    s.begin();
    s.select('x');
    s.next(); // → CONFIGURATION
    s.next(); // → RESULT

    expect(s.previous()).toBe(true); // → CONFIGURATION
    expect(useSceneStore.getState().scene).toBe('CONFIGURATION');
    expect(s.previous()).toBe(true); // → THEME
    expect(useSceneStore.getState().scene).toBe('THEME');
    expect(s.previous()).toBe(true); // → SHELF_SELECTION
    expect(useSceneStore.getState().scene).toBe('SHELF_SELECTION');
    expect(s.previous()).toBe(true); // → ARRIVAL
    expect(useSceneStore.getState().scene).toBe('ARRIVAL');
    expect(s.previous()).toBe(false); // la portada no retrocede
    expect(useSceneStore.getState().scene).toBe('ARRIVAL');
  });

  it('el reinicio borra también la plataforma elegida', () => {
    useSceneStore.getState().begin();
    useSceneStore.getState().select('linkedin');
    useSceneStore.getState().reset();

    const s = useSceneStore.getState();
    expect(s.scene).toBe('ARRIVAL');
    expect(s.selected).toBeNull();
  });
});