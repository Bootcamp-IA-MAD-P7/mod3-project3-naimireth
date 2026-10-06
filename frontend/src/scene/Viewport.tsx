/**
 * TRAZO · encuadre del mundo.
 *
 * El mundo mide exactamente lo mismo que la placa del estudio
 * (1702 × 924, ver geometry.ts). Al ser 1:1, los recortes de la hoja
 * de poses conservan su tamaño y la ilustración no se estira nunca.
 *
 * Este componente escala el mundo al viewport y publica su tamaño
 * como variables CSS con unidad. Con unidad es obligatorio: una
 * custom property sin unidad hace que el navegador descarte la
 * declaración y la caja caiga en `auto` — la escena entera se
 * quedaba invisible sin dar ningún error.
 */
import { useEffect, useMemo, useState } from 'react';

import { PLATE } from './geometry';

function useCoverScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function measure() {
      setScale(Math.max(window.innerWidth / PLATE.w, window.innerHeight / PLATE.h));
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return scale;
}

export function World({ children }: { children: React.ReactNode }) {
  const scale = useCoverScale();

  const style = useMemo(
    () =>
      ({
        '--plate-w': `${PLATE.w}px`,
        '--plate-h': `${PLATE.h}px`,
        // Único factor sin unidad: es un `scale()`, no una longitud.
        '--plate-scale': scale,
      }) as unknown as React.CSSProperties,
    [scale],
  );

  return (
    <div className="world" style={style}>
      <div className="world__scaler">{children}</div>
    </div>
  );
}
