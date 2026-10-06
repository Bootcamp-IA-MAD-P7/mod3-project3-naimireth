/**
 * TRAZO · velo de luz.
 *
 * Deliberadamente mínimo. La placa `02` ya viene iluminada y pintada;
 * añadir antorchas o resplandores encima la alteraría, y la fidelidad
 * al asset es la prioridad. Aquí solo queda la viñeta, que no cambia
 * los colores del dibujo y evita que el encuadre se lea como una
 * captura recortada.
 */
export function Lighting() {
  return (
    <div className="light" aria-hidden="true">
      <div className="light__vignette" />
    </div>
  );
}
