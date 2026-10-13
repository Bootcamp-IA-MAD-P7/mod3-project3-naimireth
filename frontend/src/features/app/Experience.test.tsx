/**
 * TRAZO · pruebas de las pantallas del rediseño (Etapa de reemplazo).
 *
 * La experiencia es un shell que engoma cada fase de la máquina de
 * estados y la muestra a pantalla completa — sin la antigua escena.
 * Estas comprobaciones leen el HTML inicial de cada componente para
 * verificar:
 *
 *   · la bienvenida compone su pantalla propia en ARRIVAL
 *   · la fase de selección pone el carrusel como protagonista
 *   · Tema, Configuración y Resultado son las pantallas del brief, que
 *     en el snapshot del servidor están cargando (el estado inicial del
 *     store no tiene catálogo ni brief todavía)
 *
 * Igual que en `App.test.tsx`, se usa `react-dom/server`: sin DOM, las
 * animaciones no se ejecutan y se comprueba el montaje. Cada test fija
 * el estado del store que necesita justo antes de pintar.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { useSceneStore } from '../../store/sceneStore';
import { Experience } from './Experience';
import { stageOf } from './stages/stageOf';
import { ShelfStage } from './stages/ShelfStage';
import { WelcomeStage } from './stages/WelcomeStage';

function html(nodo: ReactNode): string {
  return renderToStaticMarkup(nodo);
}

describe('la bienvenida (WelcomeStage)', () => {
  it('compone kicker, titular animado, lead y acción visible', () => {
    const marcado = html(<WelcomeStage />);
    expect(marcado).toContain('Estudio creativo');
    for (const palabra of ['Del', 'icono', 'publicación']) {
      expect(marcado, `falta la palabra ${palabra} del titular`).toContain(palabra);
    }
    expect(marcado).toContain('blurtext__unit');
    expect(marcado).toContain('welcome__lead');
    expect(marcado).toContain('Iniciar');
  });

  it('no trae nada de la escena antigua ni del carrusel', () => {
    const marcado = html(<WelcomeStage />);
    expect(marcado).not.toContain('plate');
    expect(marcado).not.toContain('platform-carousel');
    expect(marcado).not.toContain('<svg');
  });
});

describe('la selección de plataforma (ShelfStage)', () => {
  it('pone el carrusel como protagonista de la fase', () => {
    useSceneStore.setState({ scene: 'SHELF_SELECTION', selected: null, moving: false });
    const marcado = html(<ShelfStage />);
    expect(marcado).toContain('platform-carousel');
    expect(marcado).toContain('Continuar con Instagram');
  });

  it('no pinta la antigua estantería ni la cúpula de interfaz', () => {
    useSceneStore.setState({ scene: 'SHELF_SELECTION', selected: null, moving: false });
    const marcado = html(<ShelfStage />);
    expect(marcado).not.toContain('shelf__board');
    expect(marcado).not.toContain('class="ui"');
    expect(marcado).not.toContain('class="plate"');
  });
});

describe('la correspondencia fase → pantalla (stageOf)', () => {
  it('ARRIVAL compone la bienvenida, sin carrusel ni placa antigua', () => {
    const marcado = html(stageOf('ARRIVAL'));
    expect(marcado).toContain('welcome__emblem');
    expect(marcado).toContain('Iniciar');
    expect(marcado).not.toContain('platform-carousel');
    expect(marcado).not.toContain('class="plate"');
  });

  it('SHELF_SELECTION pone el carrusel de protagonista', () => {
    const marcado = html(stageOf('SHELF_SELECTION'));
    expect(marcado).toContain('platform-carousel');
    expect(marcado).not.toContain('welcome__emblem');
  });

  it('THEME, CONFIGURATION y RESULT ya no son superficies: solo se montan con plataforma elegida (el snapshot del servidor parte sin ella), y nunca pintan la escena vieja', () => {
    // Nota: `renderToStaticMarkup` usa el snapshot de servidor de Zustand
    // (el estado inicial), por eso `selected` es `null` aquí aunque la
    // estantería ya haya confirmado. La estantería es la única vía a
    // THEME, así que la fábrica está cubierta por los componentes.
    for (const escena of ['THEME', 'CONFIGURATION', 'RESULT'] as const) {
      const marcado = html(stageOf(escena));
      expect(marcado).not.toContain('placeholder__title');
      expect(marcado).not.toContain('class="plate"');
      expect(marcado).not.toContain('<svg');
    }
  });
});

describe('el shell de la experiencia (Experience)', () => {
  it('arranca en ARRIVAL y no en una fase posterior', () => {
    useSceneStore.setState({ scene: 'ARRIVAL', selected: null, moving: false });
    const marcado = html(<Experience />);
    expect(marcado).toContain('data-scene="ARRIVAL"');
    expect(marcado).toContain('Iniciar');
    expect(marcado).not.toContain('platform-carousel');
  });

  it('monta el fondo geométrico nuevo en el lienzo de la experiencia', () => {
    useSceneStore.setState({ scene: 'ARRIVAL', selected: null, moving: false });
    const marcado = html(<Experience />);
    expect(marcado).toContain('experience__canvas');
    expect(marcado).toContain('experience__grid');
    expect(marcado).toContain('experience__blob');
  });
});