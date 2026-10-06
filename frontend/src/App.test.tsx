/**
 * TRAZO · prueba de montaje de F01A.
 *
 * ESTA ES LA PRUEBA QUE F01A TIENE QUE PASAR.
 *
 * El brief es explícito: la referencia tiene que ser el asset que se
 * usa, no algo que se le parezca. Estas comprobaciones leen el HTML
 * inicial y verifican que:
 *
 *   · se pinta el asset real, no un SVG ni un rectángulo de colores
 *   · el personaje es un recorte de la hoja de poses, no un dibujo
 *   · la estantería es la imagen, con las zonas clicables encima
 *   · la escena empieza en ARRIVAL, sin el mensaje de elegir
 *
 * Se usa `react-dom/server`, que ya es dependencia de producción: no
 * hace falta añadir nada ni montar un DOM.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import App from './App';
import { PLATE, SHELF, SPRITE, spriteCellStyle } from './scene/geometry';

describe('F01A usa los assets originales', () => {
  const html = renderToStaticMarkup(<App />);

  it('pinta la placa 02 como imagen, no reconstruida', () => {
    expect(html).toContain('class="plate"');
    expect(html).toContain(`url(${PLATE.src})`);
  });

  it('la placa ocupa el mundo entero a 1:1', () => {
    expect(html).toContain(`width:${PLATE.w}px`);
    expect(html).toContain(`height:${PLATE.h}px`);
  });

  it('el personaje es un recorte de la hoja 05, a tamaño nativo', () => {
    expect(html).toContain('class="pose"');
    expect(html).toContain(`url(/visual/char-sprites.png)`);
    // La hoja se dibuja entera y se desplaza: no hay un segundo dibujo.
    expect(html).toContain(spriteCellStyle(0, 1).backgroundSize ?? '');
    expect(html).toContain(`background-size:${SPRITE.w}px ${SPRITE.h}px`);
  });

  it('la estantería es la imagen 03, con las cajas encima', () => {
    expect(html).toContain(`src="${SHELF.src}"`);
    expect(html).toContain('class="shelf__hits"');
    expect(html).toContain('class="shelf__hit"');
  });

  it('las cinco plataformas del MVP son seleccionables', () => {
    for (const etiqueta of ['Instagram', 'LinkedIn', 'X', 'Pinterest', 'Blog']) {
      expect(html, `falta ${etiqueta}`).toContain(`Elegir ${etiqueta}`);
    }
  });

  it('las cajas clicables empiezan inactivas: antes de Iniciar son decorado', () => {
    // El click accidental sobre el escenario no debe seleccionar nada.
    expect(html).toContain('data-active="false"');
    expect(html).toContain('disabled=""');
  });

  it('no queda ni una sola ilustración SVG en la escena', () => {
    // La regla es absoluta: si aparece un <svg> dentro del escenario,
    // alguien ha vuelto a dibujar algo que ya venía en el asset.
    const escenario = html.slice(html.indexOf('class="scene"'), html.indexOf('class="ui"'));
    expect(escenario).not.toContain('<svg');
  });

  it('no se dibuja ningún study de los antiguos', () => {
    for (const clase of ['backdrop', 'window', 'shelf-art', 'table', 'rug', 'sofa', 'pendants']) {
      expect(html, `vuelve la capa dibujada ${clase}`).not.toContain(`layer ${clase}`);
    }
  });

  it('empieza en ARRIVAL, sin el mensaje de elegir plataforma', () => {
    expect(html).toContain('data-scene="ARRIVAL"');
    expect(html).not.toContain('data-scene="PLATFORM_SELECTION"');
    expect(html).not.toContain('Elige una plataforma de la estantería');
  });

  it('ofrece una acción visible para empezar', () => {
    expect(html).toContain('Iniciar');
  });

  it('publica la geometría en el DOM con unidad', () => {
    expect(html).toContain(`--plate-w:${PLATE.w}px`);
    expect(html).toContain(`--plate-h:${PLATE.h}px`);
  });
});
