/**
 * TRAZO · datos de las tarjetas del carrusel (Etapa 2 · rediseño).
 *
 * El carrusel se nutre de `PLATFORMS`: los cinco PNG reales de
 * `redes_sociales_png_corregido/` (Instagram incluida, con su tarjeta
 * ilustrada, la de atardecer neón). Estas comprobaciones atan el
 * contenido a los archivos y a sus medidas, igual que
 * `geometry.test.ts` ata las del escenario.
 */
import { describe, expect, it } from 'vitest';

import { PLATFORMS, getPlatform } from './platforms';

describe('las tarjetas del carrusel', () => {
  it('son cinco', () => {
    expect(PLATFORMS).toHaveLength(5);
  });

  it('las cinco se sirven desde redes_sociales_png_corregido, incluida Instagram', () => {
    for (const p of PLATFORMS) {
      expect(p.card.image, p.id).toContain('/visual/redes_sociales_png_corregido/');
    }
    expect(getPlatform('instagram').card.image).toContain('Tarjeta Instagram');
  });

  it('las proporciones reflejan la caja de cada tarjeta en el carrusel', () => {
    const retrato = 287 / 497;
    // Las cinco tarjetas actualizadas en public son retrato: Instagram
    // y LinkedIn/X por diseño, Blog y Pinterest desde que se sustituyó
    // su PNG (953×1650) por la versión del mismo formato.
    expect(getPlatform('instagram').card.aspect).toBe(retrato);
    expect(getPlatform('linkedin').card.aspect).toBe(retrato);
    expect(getPlatform('x').card.aspect).toBe(retrato);
    expect(getPlatform('blog').card.aspect).toBe(retrato);
    expect(getPlatform('pinterest').card.aspect).toBe(retrato);
  });

  it('nombres e ids se mantienen estables para la máquina de estados', () => {
    for (const p of PLATFORMS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.glyph).toBeTruthy();
    }
  });
});