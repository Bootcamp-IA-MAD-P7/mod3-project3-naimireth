/**
 * TRAZO · fase de selección de plataforma (rediseño visual).
 *
 * El carrusel es el protagonista de la pantalla: las tarjetas reales de
 * las plataformas sobre el fondo geométrico nuevo. El carrusel vive en
 * su propia capa y no sobre ninguna escena antigua.
 */
import { PlatformCarousel } from '../../platforms/PlatformCarousel';

export function ShelfStage() {
  return <PlatformCarousel />;
}