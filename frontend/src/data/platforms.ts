/**
 * TRAZO · datos de las plataformas.
 *
 * 05: "LAS PLATAFORMAS EXISTEN DENTRO DEL MUNDO DEL ESTUDIO. No son
 * simplemente botones de una navegación web."
 *
 * Cada token es un objeto cuadrado con volumen. Los monogramas son
 * geometría propia, no logotipos oficiales (ADR-0002, D-01).
 */

export type PlatformId =
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'blog'
  | 'pinterest';

export interface Platform {
  id: PlatformId;
  /** Nombre visible. Aparece bajo el token, no dentro de él. */
  name: string;
  /** Color de marca de referencia. */
  color: string;
  /** Glifo dibujado con formas propias, no el logo oficial. */
  glyph: 'ring' | 'in' | 'x' | 'article' | 'p';
  /**
   * Tarjeta del carrusel (Etapa 2 · rediseño). `image` es la imagen
   * real de `public/visual/redes_sociales_png_corregido/` —todas las
   * tarjetas, incluida Instagram, tienen ilustración propia—.
   *
   * El lienzo de Instagram (1281×1227) es casi cuadrado pero su arte es
   * retrato (bordes transparentes): por eso su caja usa la proporción
   * de la familia y `cover` recorta solo el margen transparente, así la
   * tarjeta queda del mismo tamaño que el resto.
   */
  card: {
    image: string;
    aspect: number;
  };
}

const CARDS_DIR = '/visual/redes_sociales_png_corregido';
/** Proporción retrato de las tarjetas del carrusel: Instagram, LinkedIn,
    X, Blog y Pinterest comparten el mismo formato (287/497 medido). */
const RETRATO = 287 / 497;

export const PLATFORMS: readonly Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: 'var(--c-platform-instagram)',
    glyph: 'ring',
    card: {
      image: `${CARDS_DIR}/Tarjeta Instagram de atardecer neón.png`,
      aspect: RETRATO,
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: 'var(--c-platform-linkedin)',
    glyph: 'in',
    card: { image: `${CARDS_DIR}/LinkedIn.png`, aspect: RETRATO },
  },
  {
    id: 'x',
    name: 'X',
    color: 'var(--c-platform-x)',
    glyph: 'x',
    card: { image: `${CARDS_DIR}/X.png`, aspect: RETRATO },
  },
  {
    id: 'blog',
    name: 'Blog',
    color: 'var(--c-platform-blog)',
    glyph: 'article',
    card: { image: `${CARDS_DIR}/Blogger.png`, aspect: RETRATO },
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: 'var(--c-platform-pinterest)',
    glyph: 'p',
    card: { image: `${CARDS_DIR}/Pinterest.png`, aspect: RETRATO },
  },
];

export function getPlatform(id: PlatformId): Platform {
  const found = PLATFORMS.find((p) => p.id === id);
  if (!found) {
    throw new Error(`TRAZO · plataforma desconocida: ${id}`);
  }
  return found;
}
