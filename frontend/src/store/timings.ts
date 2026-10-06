/**
 * TRAZO · duraciones de F01A, en segundos.
 *
 * Todas en un solo sitio: el ajuste de la sensación cinematográfica
 * es cambiar números aquí, no tocar lógica. El solapamiento entre
 * fin de cámara y fin de superficie es deliberado.
 */
export const TIMINGS = {
  /* Personaje */
  idle: 3.4,
  /** Fase de paso completo de un ciclo de marcha. */
  stride: 0.62,
  /** Recogida del token: brazo arriba, despegue, viaje a la mano. */
  pick: 0.55,
  /** Deposición sobre la mesa. */
  place: 0.6,
  /** Recorrido a la estantería. */
  walkToShelf: 1.8,
  /** Recorrido de vuelta a la mesa, algo más largo. */
  walkToTable: 2.0,
  /** El pelo y la mochila siguen al cuerpo con retardo. */
  followThrough: 0.18,

  /* Plataformas */
  /** Retardo escalonado entre token y token al salir de la balda. */
  tokenStagger: 0.09,
  /** Total de la salida de las plataformas al primer plano. */
  tokensOut: 0.9,
  /** Enfoque del token elegido. */
  tokenFocus: 0.6,

  /* Cámara */
  toSelection: 0.9,
  toShelf: 0.8,
  toTable: 0.8,
  toDesk: 0.8,

  /* Superficie */
  /** Expansión de la mesa a pantalla completa. */
  expand: 1.4,
  /** La cámara termina ANTES que la superficie: ese solape
      produce la sensación de continuidad y no de corte. */
  surfaceLag: 0.2,

  /* Interfaz */
  panel: 0.55,
} as const;
