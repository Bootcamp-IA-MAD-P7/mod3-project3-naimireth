/**
 * TRAZO · encuadre del mundo.
 *
 * El mundo mide exactamente lo mismo que la placa activa (ver
 * geometry.ts): la placa del estudio en las escenas de estudio y la
 * base de tablet en las escenas de tablet. Al ser 1:1, los recortes y
 * el formulario de la tablet conservan su tamaño y la ilustración no
 * se estira nunca.
 *
 * Este componente escala el mundo al viewport y publica su tamaño
 * como variables CSS con unidad. Con unidad es obligatorio: una
 * custom property sin unidad hace que el navegador descarte la
 * declaración y la caja caiga en `auto` — la escena entera se
 * quedaba invisible sin dar ningún error.
 */
import { useEffect, useMemo, useState } from 'react';

import type { AssetInfo } from './geometry';

function useCoverScale(plate: AssetInfo) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function measure() {
      setScale(Math.max(window.innerWidth / plate.w, window.innerHeight / plate.h));
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [plate.w, plate.h]);

  return scale;
}

export function World({ plate, children }: { plate: AssetInfo; children: React.ReactNode }) {
  const scale = useCoverScale(plate);

  const style = useMemo(
    () =>
      ({
        '--plate-w': `${plate.w}px`,
        '--plate-h': `${plate.h}px`,
        // Único factor sin unidad: es un `scale()`, no una longitud.
        '--plate-scale': scale,
      }) as unknown as React.CSSProperties,
    [plate.w, plate.h, scale],
  );

  return (
    <div className="world" style={style}>
      <div className="world__scaler">{children}</div>
    </div>
  );
}