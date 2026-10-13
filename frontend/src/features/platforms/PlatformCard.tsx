/**
 * TRAZO · tarjeta de plataforma del carrusel (Etapa 2 · rediseño).
 *
 * Las cinco tarjetas son los PNG reales de
 * `public/visual/redes_sociales_png_corregido/`, servidos a su
 * proporción nativa (`object-fit: contain` en una caja con la misma
 * `aspect`): la ilustración no se deforma ni se recorta. Instagram usa
 * su propia tarjeta ilustrada (Tarjeta Instagram de atardecer neón),
 * como las demás.
 *
 * La placa del nombre es el único elemento añadido sobre la imagen:
 * da contexto a la tarjeta sin alterar la ilustración.
 */
import type { Platform } from '../../data/platforms';

export function PlatformCard({ platform }: { platform: Platform }) {
  const ratio = platform.card.aspect.toFixed(4);

  return (
    <div
      className="pcard"
      data-platform={platform.id}
      style={{ aspectRatio: ratio }}
    >
      <img
        className="pcard__img"
        src={encodeURI(platform.card.image)}
        alt={platform.name}
        draggable={false}
      />

      <div className="pcard__plate">
        <span
          className="pcard__dot"
          style={{ background: platform.color }}
          aria-hidden="true"
        />
        <span className="pcard__name">{platform.name}</span>
      </div>
    </div>
  );
}