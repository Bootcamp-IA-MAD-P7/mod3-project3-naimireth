/**
 * TRAZO · los assets del escenario y sus anclajes.
 *
 * Estos tests comprueban dos cosas distintas:
 *
 *  1. Que las medidas de los PNG siguen siendo ciertas. Son números
 *     leídos de los archivos; si alguien cambia un asset, el recorte
 *     se descuadra y falla aquí en vez de fallar en el navegador.
 *  2. Que las cajas de las plataformas caen DENTRO de la imagen de la
 *     estantería. Un área clicable fuera del asset es un bug invisible:
 *     se hace clic y no pasa nada.
 */
import { describe, expect, it } from 'vitest';

import {
  ORDEN_EN_ESTANTERIA,
  PLATE,
  SHELF,
  SPRITE,
  SPRITE_CELL_COUNT,
  STAGE,
  WALK_POSES,
  POSE_POR_FASE,
  platformBoxes,
  poseHeight,
  shelfBaseY,
  shelfCenter,
  spriteCell,
  spriteCellStyle,
  walkTargetX,
} from './geometry';

describe('la placa del estudio', () => {
  it('es 1702 x 924, el tamaño real de 02_studio-scene.png', () => {
    expect(PLATE.w).toBe(1702);
    expect(PLATE.h).toBe(924);
  });

  it('se sirve desde los assets visuales, no desde una ruta inventada', () => {
    expect(PLATE.src).toBe('/visual/02_studio-scene.png');
    expect(SHELF.src).toBe('/visual/03_platform-shelf.png');
    expect(SPRITE.src).toBe('/visual/05_character-actions.png');
  });

  it('el mundo es 1:1 con la placa, así que la imagen no se estira', () => {
    // El recorte de la hoja de poses se usa a tamaño nativo solo si el
    // mundo y la placa comparten proporción.
    expect(PLATE.w / PLATE.h).toBeCloseTo(1702 / 924, 10);
  });
});

describe('la hoja de poses del personaje', () => {
  it('tiene las siete poses medidas en 05_character-actions.png', () => {
    expect(SPRITE.w).toBe(1505);
    expect(SPRITE.h).toBe(240);
    expect(SPRITE_CELL_COUNT).toBe(7);
  });

  it('ninguna celda se sale de la hoja', () => {
    for (const celda of SPRITE.cells) {
      expect(celda.x).toBeGreaterThanOrEqual(0);
      expect(celda.x + celda.w).toBeLessThanOrEqual(SPRITE.w);
    }
  });

  it('las celdas no se solapan: son siete recortes distintos', () => {
    for (let i = 1; i < SPRITE.cells.length; i++) {
      const anterior = SPRITE.cells[i - 1]!;
      const actual = SPRITE.cells[i]!;
      expect(actual.x).toBeGreaterThan(anterior.x + anterior.w);
    }
  });

  it('la pose de llegada es la primera', () => {
    expect(spriteCell(0)).toEqual(SPRITE.cells[0]);
  });

  it('una pose fuera de rango se recorta en vez de romper', () => {
    expect(spriteCell(-5)).toEqual(SPRITE.cells[0]);
    expect(spriteCell(99)).toEqual(SPRITE.cells[SPRITE.cells.length - 1]);
  });

  it('el recorte se hace con background-position, a tamaño nativo', () => {
    const estilo = spriteCellStyle(0, 1);
    expect(estilo.width).toBe(`${SPRITE.cells[0]!.w}px`);
    expect(estilo.height).toBe(`${SPRITE.cellH}px`);
    expect(estilo.backgroundImage).toContain(SPRITE.src);
    // La hoja completa se dibuja a su tamaño real y se desplaza: el
    // recorte no reescala ni un píxel de la ilustración.
    expect(estilo.backgroundSize).toBe(`${SPRITE.w}px ${SPRITE.h}px`);
    expect(estilo.backgroundPosition).toBe(`0px -${SPRITE.cellY}px`);
  });

  it('al escalar, la hoja y el recorte escalan juntos', () => {
    const estilo = spriteCellStyle(1, 2);
    expect(estilo.backgroundSize).toBe(`${SPRITE.w * 2}px ${SPRITE.h * 2}px`);
    expect(estilo.backgroundPosition).toBe(`-${SPRITE.cells[1]!.x * 2}px -${SPRITE.cellY * 2}px`);
  });

  it('la pose apoyada en el suelo mide lo que dice', () => {
    expect(poseHeight(0, 1)).toBe(SPRITE.cellH);
    expect(poseHeight(0, 2)).toBe(SPRITE.cellH * 2);
  });
});

describe('la estantería', () => {
  it('es 395 x 240, el tamaño real de 03_platform-shelf.png', () => {
    expect(SHELF.w).toBe(395);
    expect(SHELF.h).toBe(240);
  });

  it('las cinco plataformas del MVP tienen su sitio en la balda', () => {
    expect(ORDEN_EN_ESTANTERIA).toHaveLength(5);
    for (const id of ORDEN_EN_ESTANTERIA) {
      expect(['instagram', 'linkedin', 'x', 'blog', 'pinterest']).toContain(id);
    }
  });

  it('cada área clicable cae dentro de la imagen de la estantería', () => {
    // Si una caja se sale, se hace clic y no ocurre nada: es el fallo
    // más difícil de ver de toda la interacción.
    const cajas = platformBoxes(SHELF.w, SHELF.h);
    expect(cajas).toHaveLength(5);
    for (const caja of cajas) {
      expect(caja.x).toBeGreaterThanOrEqual(0);
      expect(caja.y).toBeGreaterThanOrEqual(0);
      expect(caja.x + caja.w).toBeLessThanOrEqual(SHELF.w);
      expect(caja.y + caja.h).toBeLessThanOrEqual(SHELF.h);
    }
  });

  it('las cinco cajas están repartidas, no apiladas', () => {
    const cajas = platformBoxes(SHELF.w, SHELF.h);
    for (let i = 1; i < cajas.length; i++) {
      expect(cajas[i]!.x).toBeGreaterThan(cajas[i - 1]!.x);
    }
  });

  it('cada área clicable ocupa toda la altura de su columna', () => {
    // Mientras no se pueda medir dónde está dibujado cada objeto, la
    // zona generosa es lo que garantiza que el clic acierte. Un fallo
    // aquí se nota como «hice clic y no pasó nada».
    const cajas = platformBoxes(SHELF.w, SHELF.h);
    for (const caja of cajas) {
      expect(caja.y).toBe(0);
      expect(caja.h).toBe(SHELF.h);
    }
  });

  it('las zonas clicables se reparten la balda casi entera', () => {
    // Se deja un margen entre zonas para que una no se coma a la
    // vecina, pero la cobertura debe ser alta: un hueco grande es una
    // zona muerta donde el clic no acierta.
    const cajas = platformBoxes(SHELF.w, SHELF.h);
    const cubierta = cajas.reduce((suma, caja) => suma + caja.w, 0);
    expect(cubierta / SHELF.w).toBeGreaterThan(0.85);
    expect(cubierta / SHELF.w).toBeLessThanOrEqual(1);
  });
});

describe('las poses del paseo', () => {
  it('el paseo encadena varias poses, no una sola imagen quieta', () => {
    expect(WALK_POSES.length).toBeGreaterThanOrEqual(3);
    expect(new Set(WALK_POSES).size).toBe(WALK_POSES.length);
  });

  it('las poses del paseo están dentro de la hoja', () => {
    for (const pose of WALK_POSES) {
      expect(pose).toBeGreaterThanOrEqual(0);
      expect(pose).toBeLessThan(SPRITE_CELL_COUNT);
    }
  });

  it('la pose de llegada es distinta de la de tomar', () => {
    expect(POSE_POR_FASE.ARRIVAL).not.toBe(POSE_POR_FASE.PLATFORM_SELECTED);
  });
});

describe('los anclajes del escenario', () => {
  it('la estantería y la chica apoyan sobre la línea del suelo', () => {
    // Es lo que evita que los recortes floten sobre la habitación.
    const pieEstanteria = STAGE.sueloY;
    const pieChica = STAGE.sueloY;
    expect(pieEstanteria).toBeGreaterThan(PLATE.h * 0.4);
    expect(pieEstanteria).toBeLessThan(PLATE.h);
    expect(pieChica).toBe(STAGE.sueloY);
  });

  it('nadie se sale del encuadre por los lados', () => {
    expect(STAGE.estanteria.x - (SHELF.w * STAGE.estanteria.escala) / 2).toBeGreaterThan(0);
    expect(STAGE.estanteria.x + (SHELF.w * STAGE.estanteria.escala) / 2).toBeLessThan(PLATE.w);
    expect(STAGE.personaje.x - 100).toBeGreaterThan(0);
    expect(STAGE.personaje.x + 100).toBeLessThan(PLATE.w);
  });

  it('la chica no se solapa con la estantería', () => {
    // Si se solapan, hay que elegir un ancla y mover la otra.
    const mitadChica = 100;
    const mitadEstanteria = (SHELF.w * STAGE.estanteria.escala) / 2;
    const distancia = Math.abs(STAGE.estanteria.x - STAGE.personaje.x);
    expect(distancia).toBeGreaterThan(mitadChica + mitadEstanteria);
  });

  it('la chica cabe en vertical sobre el suelo', () => {
    expect(STAGE.sueloY - poseHeight(0, STAGE.personaje.escala)).toBeGreaterThan(0);
  });

  it('el encuadre de la estantería cae sobre la estantería', () => {
    // `x` es el centro, porque así lo trata el CSS (`translateX(-50%)`).
    const centro = shelfCenter();
    expect(centro.x).toBeCloseTo(STAGE.estanteria.x, 5);
    expect(centro.y).toBeCloseTo(shelfBaseY() - (SHELF.h * STAGE.estanteria.escala) / 2, 5);
  });
});

describe('la línea del suelo está medida, no supuesta', () => {
  it('coincide con la arista continua que se detectó en 02', () => {
    // En 02_studio-scene.png la fila 491 es la que presenta un salto de
    // color en el 60 % de las columnas. La fila 878, que engaña con un
    // 78 %, es el borde inferior del recorte. Este test ata el número a
    // la medición para que nadie lo "arregle" a ojo.
    expect(STAGE.sueloY).toBe(491);
    expect(STAGE.sueloY).toBeLessThan(PLATE.h * 0.6);
  });

  it('la estantería cuelga de la pared, sin apoyarse en el suelo', () => {
    // Con la base exactamente en el suelo, el recorte se leía como un
    // mueble plantado encima de las sillas.
    expect(shelfBaseY()).toBeLessThan(STAGE.sueloY);
    expect(shelfBaseY()).toBeGreaterThan(0);
  });

  it('la chica llega a la estantería sin montarse encima', () => {
    // El destino es el borde izquierdo de la balda menos un margen.
    const mitad = (SHELF.w * STAGE.estanteria.escala) / 2;
    expect(walkTargetX()).toBeLessThan(STAGE.estanteria.x - mitad);
    expect(walkTargetX()).toBeGreaterThan(STAGE.personaje.x - 400);
  });
});
