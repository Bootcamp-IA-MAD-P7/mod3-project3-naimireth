/**
 * TRAZO · prueba del punto de entrada del rediseño visual.
 *
 * El brief es explícito: la referencia es el asset que se usa, no algo
 * que se le parezca. Estas comprobaciones leen el HTML inicial y
 * verifican que el nuevo punto de partida:
 *
 *   · es `Experience`: cada fase de la máquina es una pantalla propia
 *   · arranca en ARRIVAL con la composición de bienvenida
 *   · la antigua escena del estudio YA NO se renderiza: ni placa, ni
 *     estantería, ni personaje, ni cúpula de interfaz superpuesta
 *   · no deja ni un solo SVG: la composición son capas CSS y formas
 *
 * Se usa `react-dom/server`, que ya es dependencia de producción: no
 * hace falta añadir nada ni montar un DOM. Como el snapshot del server
 * usa el estado inicial del store, aquí nunca se muta el store.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('el nuevo punto de entrada (Experience) reemplaza a la escena antigua', () => {
  const html = renderToStaticMarkup(<App />);

  it('monta la experiencia con su fase engomada: ARRIVAL al inicio', () => {
    expect(html).toContain('class="experience"');
    expect(html).toContain('data-scene="ARRIVAL"');
  });

  it('compone la bienvenida: emblema, kicker y botón Iniciar', () => {
    expect(html).toContain('welcome__emblem');
    expect(html).toContain('Estudio creativo');
    expect(html).toContain('btn btn--start');
    expect(html).toContain('Iniciar');
  });

  it('pinta las palabras del titular como unidades (sin texto partido de más)', () => {
    for (const palabra of ['Del', 'icono', 'a', 'la', 'publicación']) {
      expect(html, `falta la palabra ${palabra} del titular`).toContain(palabra);
    }
  });

  it('las fases que aún no se construyen son una superficie de transición', () => {
    expect(html).not.toContain('placeholder__title');
  });

  it('la placa antigua no pinta: ni la imagen, ni su escalado cover', () => {
    expect(html).not.toContain('class="plate"');
    expect(html).not.toContain('02_studio-scene.png');
    expect(html).not.toContain('--plate-w:');
    expect(html).not.toContain('--plate-h:');
  });

  it('la estantería antigua no pinta: ni tablero, ni tokens, ni zonas clicables', () => {
    expect(html).not.toContain('class="scene"');
    expect(html).not.toContain('shelf__board');
    expect(html).not.toContain('class="token"');
    expect(html).not.toContain('shelf__hit');
    expect(html).not.toContain('Elegir Instagram');
  });

  it('ni el personaje, ni la cúpula de interfaz antigua (Ui)', () => {
    expect(html).not.toContain('url(/visual/char-sprites.png)');
    expect(html).not.toContain('class="life"');
    expect(html).not.toContain('class="ui"');
    expect(html).not.toContain('Elige una plataforma de la estantería');
    expect(html).not.toContain('side-panel');
  });

  it('ARRIVAL no muestra aún el carrusel: es el protagonista de la fase siguiente', () => {
    expect(html).not.toContain('platform-carousel');
    expect(html).not.toContain('Continuar con');
  });

  it('no queda ni una sola ilustración SVG en la experiencia', () => {
    expect(html).not.toContain('<svg');
  });

  it('el documento nueva pinta el fondo marino del rediseño', () => {
    expect(html).not.toContain('#0e2429');
    expect(html).not.toContain('--c-wall-top');
  });
});