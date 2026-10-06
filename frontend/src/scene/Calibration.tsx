/**
 * TRAZO · modo calibración.
 *
 * `?calib=1` superpone una rejilla y los anclajes del escenario sobre
 * la escena real, con las coordenadas de mundo en pantalla.
 *
 * Existe por una razón concreta: los tres valores que no se pueden
 * medir leyendo los píxeles (la altura del suelo, la posición de la
 * estantería y la de la chica) están puestos a ojo. Con esta rejilla se
 * leen exactos y se pegan en `STAGE`, en geometry.ts.
 *
 * Apagado por defecto. No aparece en la aplicación salvo que se pida.
 */
import { PLATE, SHELF, STAGE, platformBoxes, ORDEN_EN_ESTANTERIA } from './geometry';

function activo(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('calib') === '1';
}

export function Calibration() {
  if (!activo()) return null;

  const cajas = platformBoxes(SHELF.w, SHELF.h);

  return (
    <div className="calib" aria-hidden="true">
      <div
        className="calib__grid"
        style={{
          backgroundSize: `${100}px ${100}px`,
          width: `${PLATE.w}px`,
          height: `${PLATE.h}px`,
        }}
      />

      <div className="calib__line calib__line--floor" style={{ top: `${STAGE.sueloY}px` }}>
        sueloY = {STAGE.sueloY}
      </div>

      <div
        className="calib__box"
        style={{
          left: `${STAGE.estanteria.x}px`,
          top: `${STAGE.sueloY - SHELF.h * STAGE.estanteria.escala}px`,
          width: `${SHELF.w}px`,
          height: `${SHELF.h}px`,
        }}
      >
        03 · estantería x = {STAGE.estanteria.x}
      </div>

      <div className="calib__box" style={{ left: `${STAGE.personaje.x}px`, top: `${STAGE.sueloY - 239}px` }}>
        05 · chica x = {STAGE.personaje.x}
      </div>

      {cajas.map((c, i) => (
        <div
          key={ORDEN_EN_ESTANTERIA[i]}
          className="calib__hit"
          style={{
            left: `${STAGE.estanteria.x - SHELF.w / 2 + c.x}px`,
            top: `${STAGE.sueloY - SHELF.h + c.y}px`,
            width: `${c.w}px`,
            height: `${c.h}px`,
          }}
        >
          {ORDEN_EN_ESTANTERIA[i]}
        </div>
      ))}
    </div>
  );
}
