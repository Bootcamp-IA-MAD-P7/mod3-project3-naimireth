/**
 * TRAZO · monograma de una plataforma (ADR-0002).
 *
 * La balda ya no es una imagen (`03_platform-shelf.png` no existe):
 * cada token es un objeto cuadrado con volumen, dibujado con geometría
 * propia —no con logotipos oficiales— y con el color de marca del
 * token de `data/platforms.ts`.
 *
 * Los glifos se dibujan solo con HTML/CSS (sin SVG ni fuentes externas):
 * `ring` son formas circulares, `in`/`x`/`p` son letras propias y
 * `article` es una página con líneas. Así se conserva la regla F01A de
 * que la escena no redibuja ilustraciones ni introduce <svg>.
 */
import type { Platform } from '../data/platforms';

export function PlatformMonogram({ platform }: { platform: Platform }) {
  return <span className={`token__mono token__mono--${platform.glyph}`} aria-hidden="true" />;
}