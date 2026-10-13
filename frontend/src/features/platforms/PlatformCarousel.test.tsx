/**
 * TRAZO · montaje del carrusel de plataformas (Etapa 2 · rediseño).
 *
 * El carrusel vive en la capa `Ui` y solo se muestra en SHELF_SELECTION
 * (eso lo decide `Ui.tsx`; aquí se comprueba que el componente pinta
 * las cinco tarjetas, que resalta y confirma la que toca, y que arranca
 * desde la plataforma ya elegida si el store trae `selected`).
 *
 * Se usa `react-dom/server`, igual que en `App.test.tsx`: sin DOM, las
 * animaciones de Motion no se ejecutan y se comprueba el montaje.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { PlatformId } from '../../data/platforms';
import { useSceneStore } from '../../store/sceneStore';
import { PlatformCarousel, initialActiveFor } from './PlatformCarousel';

function html(carrusel = <PlatformCarousel />): string {
  return renderToStaticMarkup(carrusel);
}

describe('el carrusel de plataformas', () => {
  it('pinta las cinco tarjetas con su nombre', () => {
    useSceneStore.setState({ scene: 'SHELF_SELECTION', moving: false });
    const marcado = html();

    expect(marcado).toContain('platform-carousel');
    for (const nombre of ['Instagram', 'LinkedIn', 'X', 'Pinterest', 'Blog']) {
      expect(marcado, `falta ${nombre}`).toContain(nombre);
    }
  });

  it('la tarjeta central es la que se confirma', () => {
    useSceneStore.setState({ scene: 'SHELF_SELECTION', moving: false });
    const marcado = html();

    expect(marcado).toContain('Continuar con Instagram');
    expect(marcado).toContain('aria-current="true"');
  });

  it('arranca desde la plataforma guardada en el store', () => {
    const orden: readonly PlatformId[] = ['instagram', 'linkedin', 'x', 'blog', 'pinterest'];

    expect(initialActiveFor(null, orden)).toBe(0);
    expect(initialActiveFor('instagram', orden)).toBe(0);
    expect(initialActiveFor('linkedin', orden)).toBe(1);
    expect(initialActiveFor('pinterest', orden)).toBe(4);
  });

  it('no dibuja SVG dentro del carrusel: los glifos son CSS', () => {
    useSceneStore.setState({ scene: 'SHELF_SELECTION', moving: false });
    expect(html()).not.toContain('<svg');
  });
});