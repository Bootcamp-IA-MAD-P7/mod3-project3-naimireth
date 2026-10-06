/**
 * TRAZO · inventario de los assets visuales y anclajes del escenario.
 *
 * REGLA ABSOLUTA (F01A) · los PNG de `docs/visual/` no son referencias
 * de estilo: son el aspecto del producto. Nada de esto redibuja una
 * ilustración; son medidas de los archivos, leídas de los propios
 * píxeles, para poder colocarlas sin escalarlas ni deformarlas.
 *
 * Cómo se obtuvo cada número: decodificando el PNG con el zlib nativo
 * de Node y midiendo el canal alfa y los saltos de color. No hay
 * estimation ni ojo clínico: son medidas. Lo único estimado son los
 * anclajes de abajo, y están marcados como tales.
 *
 * El mundo mide lo mismo que la placa del estudio, 1702 × 924. Eso es
 * deliberado: al ser 1:1, los recortes de la hoja de poses se usan a
 * su tamaño nativo y no hay que inventar ninguna escala.
 */

export interface AssetInfo {
  /** Ruta servida por Vite desde `public/visual/`. */
  src: string;
  /** Ancho real del archivo, en píxeles. */
  w: number;
  /** Alto real del archivo, en píxeles. */
  h: number;
}

const VISUAL = '/visual';

/**
 * 02 · la placa del estudio. Es el espacio: pared, suelo, mesa y
 * decoración. NO lleva personaje ni estantería, que se componen encima.
 */
export const PLATE: AssetInfo = { src: `${VISUAL}/02_studio-scene.png`, w: 1702, h: 924 };

/** 04 · el estudio con el espacio de trabajo. Reservado para F01D. */
export const WORKSPACE_PLATE: AssetInfo = {
  src: `${VISUAL}/04_table-workspace.png`,
  w: 1702,
  h: 924,
};

/** 03 · la estantería con las cinco plataformas. */
export const SHELF: AssetInfo = { src: `${VISUAL}/03_platform-shelf.png`, w: 395, h: 240 };

/** 01 · hoja de referencia del personaje. Reservada como guía de arte. */
export const CHARACTER_SHEET: AssetInfo = {
  src: `${VISUAL}/01_character-reference.png`,
  w: 740,
  h: 405,
};

/**
 * 05 · hoja de poses del personaje. Es el único asset con transparencia
 * real: por eso es el que se puede animar.
 *
 * Siete poses en fila, medidas separando las columnas con contenido.
 * La primera es la pose de llegada.
 */
export interface SpriteCell {
  /** Columna de inicio dentro de la hoja. */
  x: number;
  /** Ancho de la celda. */
  w: number;
}

export const SPRITE: AssetInfo & { cells: readonly SpriteCell[]; cellY: number; cellH: number } = {
  src: `${VISUAL}/05_character-actions.png`,
  w: 1505,
  h: 240,
  cellY: 1,
  cellH: 239,
  cells: [
    { x: 0, w: 188 },
    { x: 197, w: 205 },
    { x: 412, w: 177 },
    { x: 595, w: 151 },
    { x: 754, w: 205 },
    { x: 968, w: 181 },
    { x: 1158, w: 347 },
  ],
};

/** Cuántas celdas hay, útil para validar que una fase no se sale. */
export const SPRITE_CELL_COUNT = SPRITE.cells.length;

/* ── Anclajes del escenario ───────────────────────────────────────
 *
 * ESTOS SÍ SON LOS ÚNICOS NÚMEROS QUE NO SALEN DE UNA MEDIDA.
 *
 * Son la posición de la estantería, la de la chica y la altura del
 * suelo. No se pueden medir por píxel porque las ilustraciones no
 * tienen un punto de referencia separable, así que quedan aquí, en un
 * único sitio, para poder corregirirlos mirando el navegador.
 *
 * `?calib=1` en la URL dibuja la rejilla y los anclajes sobre la
 * escena, con las coordenadas en pantalla, para leer los valores
 * exactos y pegarlos aquí.
 */

export interface Anchor {
  /** Posición horizontal del ancla en el mundo. */
  x: number;
  /** Escala aplicada al recorte. 1 = tamaño nativo del archivo. */
  escala: number;
}

/** La estantería cuelga de la pared: además de centro y escala, su base. */
export interface ShelfAnchor extends Anchor {
  /** Altura de la balda respecto a la línea del suelo. */
  altura: number;
}

export interface Stage {
  /** Altura de la línea del suelo. Los pies se apoyan aquí. */
  sueloY: number;
  estanteria: ShelfAnchor;
  personaje: Anchor;
}

/**
 * La línea del suelo está MEDIDA, no supuesta.
 *
 * Se detectó buscando la fila donde el salto de color entre dos filas
 * consecutivas aparece a lo largo de la mayor parte del ancho, que es
 * lo que distingue una arista de arquitectura del borde de un mueble:
 *
 *   y=491  ·  60 % de las columnas con salto   ← unión pared/suelo
 *   y=878  ·  78 % de las columnas con salto   ← borde inferior del recorte
 *
 * Con 660 la estantería se comía 170 px por debajo del suelo: por eso
 * caía encima de las sillas. La base va además 24 px por encima del
 * suelo porque el mueble cuelga de la pared, no se apoya en ella.
 */
export const STAGE: Stage = {
  sueloY: 491,
  estanteria: { x: 1180, escala: 1, altura: 24 },
  personaje: { x: 880, escala: 1 },
};

/** Pies de la estantería en el mundo. */
export function shelfBaseY(): number {
  return STAGE.sueloY - STAGE.estanteria.altura;
}

/**
 * Centro horizontal de la estantería, para el encuadre de cámara.
 * `x` es el centro, porque así lo trata el CSS (`translateX(-50%)`).
 */
export function shelfCenter(): { x: number; y: number } {
  const alto = SHELF.h * STAGE.estanteria.escala;
  return {
    x: STAGE.estanteria.x,
    y: shelfBaseY() - alto / 2,
  };
}

/**
 * Punto donde se para la chica al recoger una plataforma: junto a la
 * estantería, no encima de ella.
 */
export function walkTargetX(): number {
  return STAGE.estanteria.x - (SHELF.w * STAGE.estanteria.escala) / 2 - 40;
}

/* ── Cajas de las plataformas ────────────────────────────────────
 *
 * `03` es una imagen opaca: la estantería se ve tal cual y encima se
 * (superpuestas) las zonas clicables. No se redibuja ni un solo icono.
 *
 * Las cajas se reparten en cinco columnas iguales dentro de la
 * imagen, en el orden de `ORDEN_EN_ESTANTERIA`, y ocupan TODA la altura
 * de la columna a propósito: mientras no se pueda medir dónde está
 * exactamente cada objeto dibujado, una zona generosa garantiza que
 * el clic acierte y la fase avance. Con `?calib=1` se pueden estrechar
 * hasta la balda real.
 */

export interface PlatformBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Orden de izquierda a derecha dentro de la imagen de la estantería. */
export const ORDEN_EN_ESTANTERIA = ['instagram', 'linkedin', 'x', 'blog', 'pinterest'] as const;

/** Margen lateral de cada zona clicable, en fracción de la columna. */
const HIT_MARGIN = 0.06;

export function platformBoxes(ancho: number, alto: number): PlatformBox[] {
  const columnas = ORDEN_EN_ESTANTERIA.length;
  const paso = ancho / columnas;
  const lado = Math.round(paso * (1 - HIT_MARGIN));
  return ORDEN_EN_ESTANTERIA.map((_, i) => ({
    x: Math.min(Math.round(i * paso + (paso - lado) / 2), Math.max(0, ancho - lado)),
    y: 0,
    w: lado,
    h: alto,
  }));
}

/* ── Poses por fase ─────────────────────────────────────────────
 *
 * Las siete poses se recorren en orden narrativo, que es como están
 * en la hoja. El orden exacto de cada fase se confirma mirando el
 * navegador: se cambia aquí y en ningún otro sitio.
 */

export const POSE_POR_FASE = {
  ARRIVAL: 0,
  SHELF_SELECTION: 0,
  CHARACTER_MOVING: 1,
  PLATFORM_SELECTED: 4,
} as const;

/**
 * Poses que encadenan el paseo. Se recorren en bucle mientras la chica
 * se desplaza, y al llegar se queda con la pose de `PLATFORM_SELECTED`:
 * caminar → llegar → tomar.
 */
export const WALK_POSES = [1, 2, 3] as const;

/** Milisegundos que dura cada paso del paseo. */
export const WALK_STEP_MS = 260;

/* ── Utilidades de recorte ────────────────────────────────────── */

export function spriteCell(index: number): SpriteCell {
  return SPRITE.cells[Math.max(0, Math.min(index, SPRITE.cells.length - 1))] ?? SPRITE.cells[0]!;
}

/**
 * Estilo de una celda de la hoja de poses.
 *
 * Se recorta con `background-position` en lugar de usar `<svg><image>`
 * o un `<div>` por pose: así el PNG se dibuja tal cual, a su tamaño
 * nativo, y el recorte no toca ni un píxel de la ilustración.
 */
export function spriteCellStyle(index: number, escala: number) {
  const cell = spriteCell(index);
  const w = Math.round(cell.w * escala);
  const h = Math.round(SPRITE.cellH * escala);
  return {
    width: `${w}px`,
    height: `${h}px`,
    backgroundImage: `url(${SPRITE.src})`,
    backgroundSize: `${Math.round(SPRITE.w * escala)}px ${Math.round(SPRITE.h * escala)}px`,
    backgroundPosition: `${-Math.round(cell.x * escala)}px ${-Math.round(SPRITE.cellY * escala)}px`,
    backgroundRepeat: 'no-repeat' as const,
  };
}

/**
 * Altura que ocupa la pose sobre el suelo. Es la misma en las siete
 * celdas, y por eso el personaje se ancla por el borde inferior.
 */
export function poseHeight(_index: number, escala: number): number {
  return Math.round(SPRITE.cellH * escala);
}
