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
}

export const PLATFORMS: readonly Platform[] = [
  { id: 'instagram', name: 'Instagram', color: 'var(--c-platform-instagram)', glyph: 'ring' },
  { id: 'linkedin', name: 'LinkedIn', color: 'var(--c-platform-linkedin)', glyph: 'in' },
  { id: 'x', name: 'X', color: 'var(--c-platform-x)', glyph: 'x' },
  { id: 'blog', name: 'Blog', color: 'var(--c-platform-blog)', glyph: 'article' },
  { id: 'pinterest', name: 'Pinterest', color: 'var(--c-platform-pinterest)', glyph: 'p' },
];

export function getPlatform(id: PlatformId): Platform {
  const found = PLATFORMS.find((p) => p.id === id);
  if (!found) {
    throw new Error(`TRAZO · plataforma desconocida: ${id}`);
  }
  return found;
}
